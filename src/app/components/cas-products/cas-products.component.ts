import { CommonModule } from '@angular/common';
import { Component, inject, Output, EventEmitter, TrackByFunction, Input, OnInit, OnDestroy } from '@angular/core';
import { Categoria } from '../../models/categoria.model';
import { CategoryService } from '../../services/category.service';
import { TiendaService } from '../../services/tienda.service';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { ProductoService } from '../../services/product.service';
import { ProductItemComponent } from "../product-item/product-item.component";
import { ModalproductComponent } from "../modalproduct/modalproduct.component";
import { LoadingComponent } from '../../shared/loading/loading.component';
import { Subscription } from 'rxjs';
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
  @Input() activeCategory: string = 'all'; // Recibirá el slug dinámico (ej: 'pizzeria' o 'entradas')
  @Input() activeSubCategory: string = 'all';
  @Input() title!: string;
  @Input() isVisible = false;
  @Input() tienda_moneda!: any;
  @Input() isLoading: boolean = false;

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
  selectedProduct: any = null;


  private categoryService = inject(CategoryService);
  private productoService = inject(ProductoService);
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
        this.getProductosCatName();
        // ❌ ELIMINA O COMENTA ESTA LÍNEA DE AQUÍ:
        // this.getCategories(); 
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

  getTiendaName() {
    // 2. Corregido para usar la URL dinámica del navegador
    this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
        this.getProductosCatName();
      }
    });
  }


  getProductosCatName() {
    this.isLoading = true;

    // 🌟 CORRECCIÓN MAESTRA:
    // 1. Si la tienda tiene el objeto 'categoria' populado con su slug, lo usamos (ej: 'panaderia').
    // 2. Si viene solo el ID string, evaluamos el campo 'subcategoria' de la tienda para saber el rubro real.
    if (this.tiendaSelected?.categoria && typeof this.tiendaSelected.categoria === 'object' && (this.tiendaSelected.categoria as any).slug) {
      this.catname = (this.tiendaSelected.categoria as any).slug;
    } else {
      // Fallback inteligente: si la subcategoría es 'Panadería', forzamos a que busque 'panaderia' o 'panaderia' limpia
      const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

      if (rubro === 'panaderia') {
        this.catname = 'panaderia'; // ◄--- El slug real de tu colección de categorías para los panes
      } else if (rubro === 'hamburgueseria') {
        this.catname = 'hamburguesa';
      } else {
        this.catname = 'pizzeria';
      }
    }

    console.log('🚀 Petición HTTP enviada a Categorías con el término correcto:', this.catname);

    const localId = this.tiendaSelected?._id;

    // 3. Ahora la URL se armará perfecta: /category_by_nombre/nombre/panaderia?localId=...
    this.categoryService.find_by_nombre(this.catname, localId).subscribe({
      next: (resp: any) => {
        this.products = resp.productos || [];
        this.updateTodo();
        this.getCategories(); // Extrae las pestañas internas (PASTAS, PIZZAS, PANES, etc.)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los productos por slug', error);
        this.isLoading = false;
      }
    });
  }





  //obtenemos las subcategorias de los productos
  getCategories() {
    // Procesamos directamente el arreglo 'this.products' que ya descargó el backend
    if (!this.products || this.products.length === 0) {
      this.subcategories = [];
      return;
    }

    // Extraemos el campo 'subcategoria' de cada plato en memoria
    const subcategorias = this.products.map((producto: any) => producto.subcategoria);

    // Eliminamos los nombres duplicados para tener pestañas únicas
    const subcategoriasUnicas = [...new Set(subcategorias.filter(sub => !!sub))];

    // Armamos el arreglo de objetos para el HTML de Angular
    this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
      nombre: subcategoria,
      // Filtramos los platos que corresponden a cada pestaña específica
      products: this.products.filter((product: any) => product.subcategoria === subcategoria),
    }));

    console.log('Subcategorías dinámicas extraídas con éxito:', this.subcategories);
  }


  selectCategory(category: string) {
    console.log('Filtro seleccionado por el usuario:', category);
    this.activeCategory = category; // Guarda la subcategoría cliqueada (o 'all')
    this.updateTodo(); // Re-calcula el contenido del arreglo 'this.todo'
  }

  updateTodo() {
    this.isLoading = true;

    // Si activeCategory es 'all' O es igual al slug del restaurante activo, mostramos TODO
    const esCategoriaPrincipal = this.activeCategory === 'all' ||
      this.activeCategory === this.tiendaSelected?.categoria?.slug;

    if (esCategoriaPrincipal) {
      this.todo = this.products ? this.products.slice() : [];
    } else {
      // Para los bloques @defer inferiores (Entradas, Combos, etc.), filtramos de forma normal
      // Normalizamos a minúsculas para evitar que los acentos o mayúsculas rompan el filtro
      const selectedCategory = this.subcategories ? this.subcategories.find(subcat =>
        subcat.nombre.toLowerCase().trim() === this.activeCategory.toLowerCase().trim()
      ) : null;

      this.todo = selectedCategory ? selectedCategory.products : [];
    }

    console.log('Productos listos para mostrar en el HTML (todo):', this.todo);
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
        if (resp.info?.next) {
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
      this.getProductosCatName();
    }, 2000);
  }


}
