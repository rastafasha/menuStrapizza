import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TrackByFunction } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Categoria } from '../../../../../models/categoria.model';
import { Producto } from '../../../../../models/producto.model';
import { Tienda } from '../../../../../models/tienda.model';
import { CategoriasPipePipe } from '../../../../../pipes/categorias-pipe.pipe';
import { CategoryService } from '../../../../../services/category.service';
import { ProductoService } from '../../../../../services/product.service';
import { TiendaService } from '../../../../../services/tienda.service';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { ModalProductCastingComponent } from '../modal-product-casting/modal-product-casting.component';
import { ProductItemCastingComponent } from '../product-item-casting/product-item-casting.component';

declare var bootstrap: any;

@Component({
  selector: 'app-lista-casting',
  imports: [CommonModule, LoadingComponent,
    ProductItemCastingComponent,
    ModalProductCastingComponent,
    CategoriasPipePipe, TranslatePipe
  ],
  templateUrl: './lista-casting.component.html',
  styleUrl: './lista-casting.component.scss'
})
export class ListaCastingComponent {
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
  set activeCategory(value: any) {
    if (!value) {
      this._activeCategory = 'all';
    } else if (typeof value === 'object') {
      this._activeCategory = value.es || value.nombre?.es || 'all';
    } else {
      this._activeCategory = String(value);
    }

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
  isModalOpen: boolean = false;

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

    this.productoService.find_by_storeIdActive(localId).subscribe({
      next: (resp: any) => {
        const lista = Array.isArray(resp) ? resp : (resp?.productos || []);
        this.products = lista;

        // 🟢 Mapa estricto para garantizar CERO categorías duplicadas
        const mapaSubcategorias = new Map<string, {
          clave: string;
          nombre: { es: string; en: string };
          products: Producto[];
        }>();

        this.products.forEach((producto: any) => {
          // 1. Apuntamos a producto.categoria.subcategorias o producto.categoria.nombre
          const dataCat = producto.categoria?.subcategorias || producto.categoria?.nombre || producto.subcategoria;
          if (!dataCat) return;

          // 2. Extraemos ES y EN de forma segura
          const rawEs = typeof dataCat === 'object' ? (dataCat.es || '') : String(dataCat);
          const rawEn = typeof dataCat === 'object' ? (dataCat.en || rawEs) : rawEs;

          const nombreLimpioEs = rawEs.trim();
          if (!nombreLimpioEs) return;

          const claveNormalizada = nombreLimpioEs.toLowerCase();

          if (!mapaSubcategorias.has(claveNormalizada)) {
            mapaSubcategorias.set(claveNormalizada, {
              clave: claveNormalizada,
              nombre: {
                es: nombreLimpioEs,
                en: rawEn.trim() || nombreLimpioEs
              },
              products: []
            });
          }

          mapaSubcategorias.get(claveNormalizada)!.products.push(producto);
        });

        this.subcategories = Array.from(mapaSubcategorias.values());

        // 4. Sincronizamos la grilla
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
    this._activeCategory = category || 'all';
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
    this.isModalOpen = true;
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
