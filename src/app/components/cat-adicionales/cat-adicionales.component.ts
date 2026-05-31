import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges, TrackByFunction } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { TiendaService } from '../../services/tienda.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ModalproductComponent } from '../modalproduct/modalproduct.component';
import { ProductItemComponent } from '../product-item/product-item.component';
import { ProductoService } from '../../services/product.service';

declare var bootstrap: any;

@Component({
  selector: 'app-cat-adicionales',
  imports: [
    CommonModule, 
    LoadingComponent,
    ProductItemComponent, 
    ModalproductComponent,
  ],
  templateUrl: './cat-adicionales.component.html',
  styleUrl: './cat-adicionales.component.scss'
})
export class CatAdicionalesComponent {
  // Recibe la subcategoría base desde el bloque @defer del Home (ej: 'Entradas', 'Bebidas')
  @Input() activeCategory: string = ''; // Recibe 'Entradas', 'Bebidas', etc.
  @Input() title!: string;
  @Input() tienda_moneda!: any;
  @Input() catname: string = ''; // 🌟 NUEVO: Recibe 'Pizzería' o 'Panadería' directo del Home

  isLoading: boolean = false;
  subcategories: any[] = [];
  products: any[] = [];
  todo: any[] = []; 
  selectedProduct: any = null;
  tiendaSelected: any = null;

  private categoryService = inject(CategoryService);
  private productoService = inject(ProductoService);
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    // Si cambia el rubro o la subcategoría desde el Home, volvemos a filtrar de forma limpia
    if ((changes['activeCategory'] || changes['catname']) && this.tiendaSelected) {
      this.getCategories();
    }
  }



    ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
        
        // Si por alguna razón el Input del Home viene vacío, usamos el del objeto como respaldo
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
        // Normalizamos los nombres para que el filtro no falle por acentos o mayúsculas
        const rubroTiendaLimpio = this.catname.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const subcategoriaTarget = this.activeCategory.toLowerCase().trim();

        // 1. Filtramos los productos que pertenezcan ÚNICAMENTE a la categoría de esta tienda (ej: 'panaderia')
        const productosDelRubro = resp.filter((producto: any) => {
          if (!producto.categoria?.nombre) return false;
          
          // Opcional: Si tus productos traen el ID del local, puedes validar 'producto.local === this.tiendaSelected._id'
          const productoCatLimpio = producto.categoria.nombre.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return productoCatLimpio === rubroTiendaLimpio;
        });
        
        // 2. De los productos de este negocio, extraemos solo los de la sección actual (ej: 'Bebidas')
        this.products = productosDelRubro.filter((p: any) => {
          if (!p.subcategoria) return false;
          return p.subcategoria.toLowerCase().trim() === subcategoriaTarget;
        });

        // 3. Mapeamos las subcategorías internas de la sección
        const subcats = this.products.map((producto: any) => producto.subcategoria);
        const subcategoriasUnicas = [...new Set(subcats.filter((sub: any) => !!sub))];

        this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
          nombre: subcategoria,
          products: this.products.filter((product: any) => product.subcategoria === subcategoria),
        }));

        // 4. Cargamos la grilla limpia en pantalla
        this.todo = this.products.slice();
        this.isLoading = false;
        console.log(`📡 Adicionales aislados con éxito para la tienda (${this.catname}) - Sección (${this.activeCategory}):`, this.todo);
      },
      error: (err) => {
        console.error('Error cargando adicionales activos:', err);
        this.isLoading = false;
      }
    });
  }

 getProductosPorSubcategoria() {
    if (!this.activeCategory) return;
    
    this.isLoading = true;
    const localId = this.tiendaSelected?._id;

    // 🌟 AQUÍ SE CONFIGURA TU URL:
    // Al pasarle 'this.activeCategory' (ej: 'Entradas'), el servicio armará internamente:
    // https://onrender.com...
    console.log(`🚀 Conectando a Zlipmenu API. Solicitando URL para: ${this.activeCategory}`);

    this.categoryService.find_by_nombre(this.activeCategory, localId).subscribe({
      next: (resp: any) => {
        // Guardamos los platos que devuelve directamente tu endpoint de categorías
        this.products = resp.productos || [];
        
        // Replicamos tu lógica original para armar el menú de pestañas internas si existen
        const subcats = this.products.map((producto: any) => producto.subcategoria);
        const subcategoriasUnicas = [...new Set(subcats.filter(sub => !!sub))];

        this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
          nombre: subcategoria,
          products: this.products.filter((product: any) => product.subcategoria === subcategoria),
        }));

        // Inicializamos la grilla de platos (todo) con la respuesta directa del servidor
        this.todo = this.products.slice();
        this.isLoading = false;
        console.log(`✅ ¡Petición HTTP Exitosa! Platos renderizados para ${this.activeCategory}:`, this.todo);
      },
      error: (error) => {
        console.error(`❌ Error en la llamada HTTP para ${this.activeCategory}:`, error);
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
    // Lógica para asegurar que Bootstrap inicialice el Offcanvas/Modal correctamente
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
