import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TiendaService } from '../../services/tienda.service';
import { ProductoService } from '../../services/product.service';

@Component({
  selector: 'app-cat-adicionales',
  templateUrl: './cat-adicionales.component.html',
  styleUrls: ['./cat-adicionales.component.css']
})
export class CatAdicionalesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeCategory: string = ''; 
  @Input() title!: string;
  @Input() tienda_moneda!: any;
  @Input() catname: string = ''; // Recibe 'Pizzería', 'Hamburguesa' o 'Panadería' del Home

  isLoading: boolean = false;
  subcategories: any[] = [];
  products: any[] = [];
  todo: any[] = []; 
  selectedProduct: any = null;
  tiendaSelected: any = null;

  private productoService = inject(ProductoService);
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['activeCategory'] || changes['catname']) && this.tiendaSelected) {
      this.getCategories();
    }
  }

  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
        
        if (!this.catname) {
          this.catname = this.tiendaSelected?.categoria?.nombre || 'Pizzería';
        }

        this.getCategories(); 
      }
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

  getCategories() {
    if (!this.activeCategory || !this.catname) return;

    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe({
      next: (resp: any) => {
        // 🌟 NORMALIZACIÓN TOTAL DE LAS VARIABLES DEL HOME:
        const rubroTiendaLimpio = this.catname.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const subcategoriaTarget = this.activeCategory.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 1. FILTRADO FLEXIBLE POR RUBRO: Aísla los platos que pertenezcan a la categoría (ej: 'pizzeria' o 'panaderia')
        const productosDelRubro = resp.filter((producto: any) => {
          if (!producto.categoria?.nombre) return false;
          
          const productoCatLimpio = producto.categoria.nombre.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return productoCatLimpio.includes(rubroTiendaLimpio) || rubroTiendaLimpio.includes(productoCatLimpio);
        });
        
        // 2. FILTRADO FLEXIBLE POR SUBCATEGORÍA: Empareja singular/plural (ej: 'bebida' con 'bebidas')
        this.products = productosDelRubro.filter((p: any) => {
          if (!p.subcategoria) return false;
          
          const subcategoriaProductoLimplia = p.subcategoria.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return subcategoriaProductoLimplia.includes(subcategoriaTarget) || subcategoriaTarget.includes(subcategoriaProductoLimplia);
        });

        // 3. Mapeamos las subcategorías internas
        const subcats = this.products.map((producto: any) => producto.subcategoria);
        const subcategoriasUnicas = [...new Set(subcats.filter((sub: any) => !!sub))];

        this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
          nombre: subcategoria,
          products: this.products.filter((product: any) => product.subcategoria === subcategoria),
        }));

        // 4. Cargamos la grilla visible (todo)
        this.todo = this.products.slice();
        this.isLoading = false;
        console.log(`✅ ¡Éxito en bloque! Sincronizados adicionales para la tienda [${this.catname}] - Sección [${this.activeCategory}]:`, this.todo);
      },
      error: (err) => {
        console.error('Error cargando adicionales activos:', err);
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: string) {
    this.activeCategory = category;
    const selected = this.subcategories.find(sub => sub.nombre === category);
    this.todo = selected ? selected.products : [];
  }

  openModal(product: any) {
    this.selectedProduct = product;
    setTimeout(() => {
      const element = document.getElementById('modalProduct-' + product._id);
      if (element && (window as any).bootstrap) {
        const myOffcanvas = new (window as any).bootstrap.Offcanvas(element, {
          backdrop: true,
          keyboard: true,
          scroll: true
        });
        myOffcanvas.show();
      }
    }, 0);
  }
}
