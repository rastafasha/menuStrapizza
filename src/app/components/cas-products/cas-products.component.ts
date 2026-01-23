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
import { environment } from '../../../environments/environment';

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

  option_selectedd: number = 1;
  solicitud_selectedd: any = null;
  tiendaNameSelected = environment.nombreSelected;

  isRefreshing = false;
  isEdnOfList = false;
  nextUrl:string = '';
  loadingTitle:string = '';

  categories: Categoria[] = [];
  subcategories: any[] = [];
  
  catname!: string;
  isLoading: boolean = false;
  products: Producto[] = [];
  tiendaSelected: Tienda | null = null;
  
  todo: Producto[] = [];

  selectedProduct: Producto | null = null;
  isModalOpen: boolean = false;

  private categoryService = inject(CategoryService);
  private productoService = inject(ProductoService);
  private tiendasService = inject(TiendaService);


  ngOnInit() {
    // Get tiendaSelected from TiendaService (set by HeaderComponent)
    // Also subscribe to changes
    if (this.tiendaNameSelected) {
      setTimeout(()=>{
        this.getTiendaName()
      }, 500)
     
    }
    // Listen for refresh trigger from parent (header pull)
    if (this.refreshCasProducts) {
      this.refreshCasProducts.subscribe(() => this.refreshData());
    }
  }

  ngOnDestroy() {
    // No need to unsubscribe from EventEmitter as it's managed by Angular
  }

  getTiendaName(){
    this.tiendasService.getTiendaByName(this.tiendaNameSelected).subscribe(tienda => {
       this.tiendaSelected = tienda;
       this.tienda_moneda = this.tiendaSelected?.moneda;
      // Refresh products when tienda changes
      if (this.tiendaSelected) {
        this.getProductosCatName();
        this.updateTodo();
        this.getProductosCatName();
        this.getCategories();
      }
    });
  }


  getProductosCatName() {
    this.catname = this.tiendaSelected?.categoria?.nombre ?? this.activeCategory
    this.isLoading = true
    this.categoryService.find_by_nombre(this.catname).subscribe(
      (resp: any) => {
        this.products = resp.productos || [];
        // console.log(this.products)
        this.updateTodo();
        this.isLoading = false
      },
      (error) => {
        console.error('Error al obtener los productos', error);
      }
    );
  }

  getProductosCatName1() {
    // this.catname = this.tiendaSelected?.subcategoria ?? this.activeSubCategory
    this.catname =  'Alimentos'
    this.isLoading = true
    this.categoryService.find_by_nombre(this.catname).subscribe(
      (resp: any) => {
        this.products = resp.productos || [];
        // console.log(this.products)
        this.updateTodo();
        this.isLoading = false
      },
      (error) => {
        console.error('Error al obtener los productos', error);
      }
    );
  }
  //obtenemos las subcategorias de los productos
  getCategories() {
    this.isLoading = true
    this.productoService.getProductosActivos().subscribe((resp: any) => {
      //filtramos los productos donde sea igual a la categoria Panaderia
      const productos = resp.filter((producto: any) => producto.categoria.nombre === this.catname);
      //extraemos el campo subcategoria
      const subcategorias = productos.map((producto: any) => producto.subcategoria);
      //eliminamos los duplicados
      const subcategoriasUnicas = [...new Set(subcategorias)];
      //creamos un arreglo de objetos con el nombre de la subcategoria y el arreglo de productos
      const categorias = subcategoriasUnicas.map((subcategoria: any) => ({
        nombre: subcategoria,
        products: productos.filter((product: any) => product.subcategoria === subcategoria),
      }));
      this.subcategories = categorias || [];
      // console.log(this.subcategories)
    })
    this.isLoading = false
  }

  selectCategory(category: string) {
    console.log('selectCategory called with:', category);
    this.activeCategory = category;
    this.isLoading = true
    this.updateTodo();
    this.isLoading = false
  }

  updateTodo() {
    // console.log('updateTodo called. activeCategory:', this.activeCategory, 'products:', this.products, 'subcategories:', this.subcategories);
    this.isLoading = true
    if (this.activeCategory === 'all') {
      this.todo = this.products ? this.products.slice() : [];
    } else {
      const selectedCategory = this.subcategories ? this.subcategories.find(subcat => subcat.nombre === this.activeCategory) : null;
      this.todo = selectedCategory ? selectedCategory.products : [];
    }
    // console.log('todo updated:', this.todo);
    this.isLoading = false
  }


  openModal(product: Producto) {
    this.selectedProduct = product;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedProduct = null;
  }

  public PageSize(): void {
    this.getProductosCatName1();
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
          alert('ultima pagina');
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onScrollUp() {
    this.refreshData();
  }

  trackByCharacterId: TrackByFunction<any> = (index: number, character: any) => character.id;


  refreshData() {
    this.isRefreshing = true;
    // Simulate data fetching 
    setTimeout(() => {
      this.isRefreshing = false;
      // Update your data here 
      this.getProductosCatName();
    }, 2000);
  }


}
