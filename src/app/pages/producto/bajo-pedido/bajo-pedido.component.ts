import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TrackByFunction } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { TiendaService } from '../../../services/tienda.service';
import { ProductoService } from '../../../services/product.service';
import { Producto } from '../../../models/producto.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ProductsBajoPedidoComponent } from '../../../components/products-bajo-pedido/products-bajo-pedido.component';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../services/category.service';
import { Categoria } from '../../../models/categoria.model';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { CategoriasPipePipe } from '../../../pipes/categorias-pipe.pipe';
import { ModalProductPedidoComponent } from '../../../components/modal-product-pedido/modal-product-pedido.component';
import { MenuFooterComponent } from '../../../shared/menu-footer/menu-footer.component';
declare var bootstrap: any;

@Component({
  selector: 'app-bajo-pedido',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    HeaderComponent,
    LoadingComponent,
    CategoriasPipePipe,
    ProductsBajoPedidoComponent,
    ModalProductPedidoComponent,
    MenuFooterComponent
],
  templateUrl: './bajo-pedido.component.html',
  styleUrl: './bajo-pedido.component.scss'
})
export class BajoPedidoComponent implements OnInit {
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  user: any;
  tiendaSelected: any;
  products: Producto[] = [];
  isLoading = false;
  private tiendaSubscription!: Subscription;
  title = 'Productos por pedido';
  isModalOpen: boolean = false;

   isRefreshing = false;
  isEdnOfList = false;
  nextUrl: string = '';
  loadingTitle: string = '';

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

  categories: Categoria[] = [];
  subcategories: any[] = [];

  private _activeCategory: string = 'all';
  // El getter también debe leer de la variable interna privada
  get activeCategory(): string {
    return this._activeCategory;
  }

   todo: Producto[] = [];
    selectedProduct: Producto | null = null;
    localIdActual: any;
    tienda_moneda!: any;



  constructor(
    public productoService: ProductoService,
    public tiendaService: TiendaService,
    public authService: AuthService,
    public translate: TranslateService,
    public categoryService: CategoryService,

    public router: Router,
    public toastr: ToastrService,
    public fb: FormBuilder,
  ) {
    this.user = this.authService.getLocalStorage();
  }

  ngOnInit() {
    this.isLoading = true;

    // 1. Escuchamos la tienda activa resuelta en la caché
    this.tiendaSubscription = this.tiendaService.getTiendaByNameCached().subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda = this.tiendaSelected.moneda;

        // 2. 🚀 CONEXIÓN DIRECTA: Ejecutamos el filtro usando tu función nativa por ID
        this.cargarProductosPorTiendaId(this.tiendaSelected._id);
      }
    });

  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

  // 🟢 TU NUEVA FUNCIÓN MAESTRA INTEGRAL (Limpia, rápida y libre de cruce de datos)
 cargarProductosPorTiendaId(localId: any) {
    this.isLoading = true;

    this.productoService.bypedido(localId).subscribe({
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
