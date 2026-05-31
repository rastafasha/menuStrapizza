import { CommonModule } from '@angular/common';
import { Component, inject, Output, EventEmitter, Input, OnInit, OnDestroy, TrackByFunction } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { TiendaService } from '../../services/tienda.service';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { ProductItemComponent } from "../product-item/product-item.component";
import { ModalproductComponent } from "../modalproduct/modalproduct.component";
import { LoadingComponent } from '../../shared/loading/loading.component';
import { Subscription } from 'rxjs';
import { ProductoService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { Categoria } from '../../models/categoria.model';
declare var bootstrap: any;
@Component({
  selector: 'app-cas-products',
  imports: [CommonModule, LoadingComponent,
    ProductItemComponent, ModalproductComponent,
  ],
  templateUrl: './cas-products.component.html',
  styleUrl: './cas-products.component.scss'
})
export class CasProductsComponent implements OnInit, OnDestroy {
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() refreshCasProducts: EventEmitter<void> | null = null;
  @Input() activeCategory: string = 'all';
  @Input() activeSubCategory: string = 'all';
  @Input() title!: string ;
  @Input() isVisible = false;
  @Input() tienda_moneda!: any;
  @Input() isLoading: boolean = false;

  option_selectedd: number = 1;
  solicitud_selectedd: any = null;

  isRefreshing = false;
  isEdnOfList = false;
  nextUrl:string = '';
  loadingTitle:string = '';

  categories: Categoria[] = [];
  subcategories: any[] = [];
  
  catname!: string;
  products: Producto[] = [];
  tiendaSelected: Tienda | null = null;
  
  todo: Producto[] = [];
  selectedProduct: Producto | null = null;

  private categoryService = inject(CategoryService);
  private productoService = inject(ProductoService);
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnInit() {
    // Escucha la tienda que ya resolvió el Home en la caché de forma reactiva
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
        
        // Prioriza la categoría limpia enviada desde el Home para el endpoint
        this.catname = this.activeCategory !== 'all' ? this.activeCategory : (this.tiendaSelected?.categoria?.nombre || 'Pizzería');
        
        this.getCategories();
      }
    });

    // this.escucharTiendaActiva();

    if (this.refreshCasProducts) {
      this.refreshCasProducts.subscribe(() => this.refreshData());
    }
  }

 
 

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

 

  // Mantenemos tu función por si la necesitas, pero limpia de llamadas duplicadas
  getProductosCatName() {
    this.isLoading = true;
    this.categoryService.find_by_nombre(this.catname).subscribe({
      next: (resp: any) => {
        this.products = resp.productos || [];
        this.updateTodo();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los productos', error);
        this.isLoading = false;
      }
    });
  }

  // 🌟 TU FUNCIÓN MAESTRA ORIGINAL (Ordenada y tipada para evitar cruce de datos)
    // Tu función original corregida y blindada contra fallas de acentos y mayúsculas
 
      getCategories() {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe((resp: any) => {
      // 1. Filtramos los productos que pertenecen a la categoría del restaurante actual
      const productos = resp.filter((producto: any) => producto.categoria?.nombre === this.catname);
      
      this.products = productos;

      // 2. Extraemos el campo subcategoria asegurando que no procese valores nulos o vacíos
      const subcategorias = productos.map((producto: any) => {
        return producto.subcategoria ? producto.subcategoria.trim() : null;
      });
      
      // 3. Eliminamos duplicados y limpiamos valores falsos/nulos para que el Set no se rompa
      const subcategoriasUnicas = [...new Set(subcategorias.filter((sub: any) => !!sub))];
      
      console.log('📋 Las subcategorías únicas reales encontradas son:', subcategoriasUnicas);

      // 4. Creamos el arreglo de objetos con el nombre de la subcategoria y el arreglo de productos
      const categorias = subcategoriasUnicas.map((subcategoria: any) => ({
        nombre: subcategoria,
        products: productos.filter((product: any) => {
          if (!product.subcategoria) return false;
          return product.subcategoria.trim() === subcategoria;
        }),
      }));
      
      this.subcategories = categorias || [];
      
      // 5. Sincronizamos la grilla de platos
      this.updateTodo();
      this.isLoading = false;
    });
  }


  selectCategory(category: string) {
    console.log('selectCategory called with:', category);
    this.activeCategory = category;
    this.updateTodo();
  }

  updateTodo() {
    this.isLoading = true;
    if (this.activeCategory === 'all') {
      this.todo = this.products ? this.products.slice() : [];
    } else {
      const selectedCategory = this.subcategories ? this.subcategories.find(subcat => subcat.nombre === this.activeCategory) : null;
      this.todo = selectedCategory ? selectedCategory.products : [];
    }
    this.isLoading = false;
  }

  openModal(product: any) {
    this.selectedProduct = product;
    setTimeout(() => {
      const element = document.getElementById('modalProduct-' + product._id);
      if (element) {
        const myOffcanvas = new bootstrap.Offcanvas(element, {
          backdrop: true,
          keyboard: true,
          scroll: true
        });
        myOffcanvas.show();
      }
    }, 0);
  }

  onMsmSuccess(value: boolean): void {
    this.msm_success.emit(value);
  }

  onScrollDown() {
    if (!this.nextUrl || this.isLoading) return;
    this.categoryService.find_by_nombre(this.nextUrl).subscribe({
      next: (resp: any) => {
        if (resp.info.next) {
          this.nextUrl = resp.info.next;
          this.products = [...this.products, ...resp.results];
        } else {
          this.isEdnOfList = true;
          this.loadingTitle = 'No hay más personajes para mostrar';
        }
      },
      error: () => this.isLoading = false
    });
  }

  onScrollUp() {
    this.refreshData();
  }

  trackByCharacterId: TrackByFunction<any> = (index: number, character: any) => character.id;

  refreshData() {
    this.isRefreshing = true;
    setTimeout(() => {
      this.isRefreshing = false;
      this.getCategories(); // Refrescamos usando el flujo limpio
    }, 2000);
  }

}
