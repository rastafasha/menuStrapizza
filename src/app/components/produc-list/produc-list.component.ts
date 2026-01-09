import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/product.service';
import { Subscription } from 'rxjs';
import { Categoria } from '../../models/categoria.model';
import { Tienda } from '../../models/tienda.model';
import { CategoryService } from '../../services/category.service';
import { TiendaService } from '../../services/tienda.service';

@Component({
  selector: 'app-produc-list',
  imports: [CommonModule],
  templateUrl: './produc-list.component.html',
  styleUrl: './produc-list.component.scss'
})
export class ProducListComponent {
@Input() productsList: Producto[] = [];
  tiendaSelected: Tienda | null = null;

  isLoading:boolean = false;
  
  selectedProduct: Producto | null = null;
  categories: Categoria[] = [];
  subcategories: any[] = [];

  products: Producto[] = [];


  activeCategory: string = 'all';

  todo: Producto[] = [];
  catname!:string;
  
  private productoService = inject(ProductoService);
  private categoryService = inject(CategoryService);
  private tiendasService = inject(TiendaService);

  private tiendaSubscription: Subscription | undefined;

  

  constructor() {
    this.products = this.products || [];
    this.todo = this.products.slice();
  }
  
  ngOnInit(){
    this.tiendaSubscription = this.tiendasService.selectedTiendaObservable$.subscribe(tienda => {
      this.tiendaSelected = tienda;
      this.updateTodo();
      this.getProductosCatName();
      this.getCategories();
    });
  }



  ngAfterViewInit() {
    this.getProductosCatName();
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productsList'] && this.productsList) {
      this.products = this.productsList;
      this.updateTodo();
    }
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

  getProductosCatName() {
    this.catname = this.tiendaSelected?.subcategoria ?? 'Pizzería'
    this.isLoading = true
    this.categoryService.find_by_nombre(this.catname).subscribe(
      (resp:any) => {
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
    this.productoService.getProductosActivos().subscribe((resp:any)=>{
      //filtramos los productos donde sea igual a la categoria Panaderia
      const productos = resp.filter((producto: any) => producto.categoria.nombre ===  this.catname);
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
    })
    this.isLoading = false
  }

  selectCategory(category: string) {
    // console.log('selectCategory called with:', category);
    this.activeCategory = category;
    this.updateTodo();
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
    // Use Bootstrap's modal method to show modal programmatically
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  

}
