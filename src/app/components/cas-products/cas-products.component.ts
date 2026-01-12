import { CommonModule } from '@angular/common';
import { Component, inject, Output, EventEmitter } from '@angular/core';
import { Categoria } from '../../models/categoria.model';
import { CategoryService } from '../../services/category.service';
import { TiendaService } from '../../services/tienda.service';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { ProductoService } from '../../services/product.service';
import { ProductItemComponent } from "../product-item/product-item.component";
import { ModalproductComponent } from "../modalproduct/modalproduct.component";
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-cas-products',
  imports: [CommonModule, LoadingComponent, ProductItemComponent, ModalproductComponent],
  templateUrl: './cas-products.component.html',
  styleUrl: './cas-products.component.scss'
})
export class CasProductsComponent {
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  option_selectedd: number = 1;
  solicitud_selectedd: any = null;

  categories: Categoria[] = [];
  subcategories: any[] = [];
  activeCategory: string = 'all';
  catname!:string;
  isLoading:boolean = false;
  products: Producto[] = [];
  tiendaSelected: Tienda | null = null;
  todo: Producto[] = [];

  selectedProduct: Producto | null = null;

  private categoryService = inject(CategoryService);
  private productoService = inject(ProductoService);
private tiendasService = inject(TiendaService);


 ngOnInit(){
    this.updateTodo();
      this.getProductosCatName();
      this.getCategories();
  }


  optionSelected(value: number) {
    this.option_selectedd = value;
    if (this.option_selectedd === 1) {

      // this.ngOnInit();
    }
    if (this.option_selectedd === 2) {
      this.solicitud_selectedd = null;
    }
    if (this.option_selectedd === 3) {
      this.solicitud_selectedd = null;
    }
    if (this.option_selectedd === 4) {
      this.solicitud_selectedd = null;
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
        // console.log(this.selectCategory)
    })
    this.isLoading = false
  }

  selectCategory(category: string) {
    // console.log('selectCategory called with:', category);
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
    // Use Bootstrap's modal method to show modal programmatically
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

public PageSize(): void {
        this.getProductosCatName();
      }

  onMsmSuccess(value: boolean): void {
    this.msm_success.emit(value);
  }

}
