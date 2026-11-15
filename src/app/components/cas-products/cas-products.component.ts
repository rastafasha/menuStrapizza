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
import { Categoria } from '../../models/categoria.model';
import { CategoriasPipePipe } from '../../pipes/categorias-pipe.pipe';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

declare var bootstrap: any;
@Component({
  selector: 'app-cas-products',
  imports: [CommonModule, LoadingComponent,
    ProductItemComponent, ModalproductComponent,
    CategoriasPipePipe,
    TranslatePipe
  ],
  templateUrl: './cas-products.component.html',
  styleUrl: './cas-products.component.scss'
})
export class CasProductsComponent implements OnInit, OnDestroy {
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() refreshCasProducts: EventEmitter<void> | null = null;


  @Input() activeSubCategory: string = 'all';
  @Input() title!: string;
  @Input() isVisible = false;
  @Input() tienda_moneda!: any;
  @Input() isLoading: boolean = false;

isModalOpen: boolean = false;

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
    if (!this._activeCategory || this._activeCategory === 'all') {
      this.todo = this.products ? [...this.products] : [];
    } else {
      const claveBuscada = this._activeCategory.trim().toLowerCase();
      const selectedCategory = this.subcategories.find(
        subcat => subcat.clave === claveBuscada || subcat.nombre?.es?.trim().toLowerCase() === claveBuscada
      );
      this.todo = selectedCategory ? [...selectedCategory.products] : [];
    }
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
