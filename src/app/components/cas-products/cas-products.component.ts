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
import { CategoriasPipePipe } from '../../pipes/categorias-pipe.pipe';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
declare var bootstrap: any;
@Component({
  selector: 'app-cas-products',
  imports: [CommonModule, LoadingComponent,
    ProductItemComponent, ModalproductComponent,
    CategoriasPipePipe, TranslatePipe
  ],
  templateUrl: './cas-products.component.html',
  styleUrl: './cas-products.component.scss'
})
export class CasProductsComponent implements OnInit, OnDestroy {
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() refreshCasProducts: EventEmitter<void> | null = null;
  // @Input() activeCategory: string = 'all';
  @Input() activeSubCategory: string = 'all';
  @Input() title!: string;
  @Input() isVisible = false;
  @Input() tienda_moneda!: any;
  @Input() isLoading: boolean = false;

  private _activeCategory: string = 'all';

  @Input()
  set activeCategory(value: string) {
    // 🚨 OJO: Asignamos a la variable con guion bajo (_activeCategory), NO a 'this.activeCategory'
    this._activeCategory = value || 'all';

    // Llamamos a tu función de carga de forma segura
    if (this.localIdActual) {
      this.cargarProductosPorTiendaId(this.localIdActual);
    }
  }

  // El getter también debe leer de la variable interna privada
  get activeCategory(): string {
    return this._activeCategory;
  }

  option_selectedd: number = 1;
  solicitud_selectedd: any = null;

  isRefreshing = false;
  isEdnOfList = false;
  nextUrl: string = '';
  loadingTitle: string = '';

  categories: Categoria[] = [];
  subcategories: any[] = [];

  catname!: string;
  products: Producto[] = [];
  tiendaSelected: Tienda | null = null;

  todo: Producto[] = [];
  selectedProduct: Producto | null = null;
  localIdActual: any;

  private categoryService = inject(CategoryService);
  private productoService = inject(ProductoService);
  private tiendasService = inject(TiendaService);
  public translate = inject(TranslateService);
  private tiendaSubscription!: Subscription;


  ngOnInit() {
    this.isLoading = true;

    // 1. Escuchamos la tienda activa resuelta en la caché
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda = this.tiendaSelected.moneda;

        // 2. 🚀 CONEXIÓN DIRECTA: Ejecutamos el filtro usando tu función nativa por ID
        this.cargarProductosPorTiendaId(this.tiendaSelected._id);
      }
    });

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
    this.categoryService.getCategoriaByLocal(this.tiendaSelected?._id).subscribe({
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

  // 🟢 TU NUEVA FUNCIÓN MAESTRA INTEGRAL (Limpia, rápida y libre de cruce de datos)
  cargarProductosPorTiendaId(localId: any) {
    this.isLoading = true;

    this.productoService.find_by_storeId(localId).subscribe({
      next: (productos: any[]) => {
        this.products = productos || [];

        // 1. Extraemos el texto base (ID o string en minúsculas) de la subcategoría del producto
        const subcategoriasEspanol = this.products.map((producto: any) => {
          if (producto.subcategoria) {
            return typeof producto.subcategoria === 'string'
              ? producto.subcategoria.trim().toLowerCase()
              : producto.subcategoria.es?.trim().toLowerCase();
          }
          return null;
        });

        // 2. Eliminamos duplicados
        const subcategoriasUnicasEs = [...new Set(subcategoriasEspanol.filter((sub: any) => !!sub))];

        // 3. Construimos el arreglo bilingüe agrupado buscando en el objeto 'categoria'
        this.subcategories = subcategoriasUnicasEs.map((subcatBase: string) => {

          // Buscamos un producto que tenga el objeto 'categoria' cargado
          const productoConDataCompleta = this.products.find((p: any) => {
            const actualSub = typeof p.subcategoria === 'string' ? p.subcategoria : p.subcategoria?.es;
            return actualSub?.trim().toLowerCase() === subcatBase?.trim().toLowerCase() && p.categoria?.subcategorias;
          });

          let estructuraFinalNombre = { es: subcatBase, en: subcatBase };

          // 🧠 CORRECCIÓN EXACTA: 'subcategorias' es un objeto directo { es, en }
          if (productoConDataCompleta && productoConDataCompleta.categoria.subcategorias) {
            const subcatBD = productoConDataCompleta.categoria.subcategorias;

            // Si viene como objeto bilingüe, extraemos sus traducciones directo
            if (typeof subcatBD === 'object') {
              estructuraFinalNombre = {
                es: subcatBD.es || subcatBase,
                en: subcatBD.en || subcatBD.es || subcatBase
              };
            }
          }

          return {
            nombre: estructuraFinalNombre,

            products: this.products.filter((product: any) => {
              if (!product.subcategoria) return false;
              const actualSub = typeof product.subcategoria === 'object' ? product.subcategoria.es : product.subcategoria;
              return actualSub?.trim().toLowerCase() === subcatBase?.trim().toLowerCase();
            })
          };
        }) || [];

        // 4. Sincronizamos la grilla de platos
        this.updateTodo();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener los productos por tienda:', err);
        this.isLoading = false;
      }
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
      // 💡 CORRECCIÓN: Comparamos el string plano contra la propiedad .es del objeto bilingüe
      const selectedCategory = this.subcategories
        ? this.subcategories.find(subcat => subcat.nombre?.es === this.activeCategory)
        : null;

      this.todo = selectedCategory ? selectedCategory.products : [];
    }

    this.isLoading = false;
  }

  openModal(product: Producto) {
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

  // Actualizamos la función de refresco para que use el nuevo flujo limpio
  refreshData() {
    this.isRefreshing = true;
    setTimeout(() => {
      this.isRefreshing = false;
      if (this.tiendaSelected?._id) {
        this.cargarProductosPorTiendaId(this.tiendaSelected._id);
      }
    }, 2000);
  }

}
