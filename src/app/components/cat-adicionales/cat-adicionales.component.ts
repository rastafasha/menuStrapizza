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
  @Input() activeCategory: string = ''; 
  @Input() title!: string;
  @Input() tienda_moneda!: any;

  isLoading: boolean = false;
  catname!: string;
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
    // Si cambia el input de la categoría y ya tenemos el ID de la tienda, refrescamos la petición
    if (changes['activeCategory'] && this.tiendaSelected) {
      this.getProductosPorSubcategoria();
    }
  }


  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
        
        // Ejecutamos la petición HTTP directa con el término correcto
        this.getProductosPorSubcategoria(); 
      }
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
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
