import { CommonModule } from '@angular/common';
import { Component, inject, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { TiendaService } from '../../services/tienda.service';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { ProductItemComponent } from "../product-item/product-item.component";
import { ModalproductComponent } from "../modalproduct/modalproduct.component";
import { LoadingComponent } from '../../shared/loading/loading.component';
import { Subscription } from 'rxjs';
import { ProductoService } from '../../services/product.service';
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
  @Input() title!: string;
  @Input() isVisible = false;
  @Input() tienda_moneda!: any;
  @Input() isLoading: boolean = false;

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
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe({
      next: (tienda) => {
        this.tiendaSelected = tienda;
        if (this.tiendaSelected) {
          this.tienda_moneda = this.tiendaSelected.moneda;
          
          // Resolvemos el catname basado en el objeto de la tienda activa
          this.catname = this.tiendaSelected?.categoria?.nombre || 'Pizzería';
          
          // Ejecutamos tu función recuperada y blindada
          this.getCategories();
        }
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

   //obtenemos las subcategorias de los productos
  // getCategories() {
  //   this.isLoading = true
  //   this.productoService.getProductosActivos().subscribe((resp: any) => {
  //     //filtramos los productos donde sea igual a la categoria
  //     const productos = resp.filter((producto: any) => producto.categoria.nombre === this.catname);
  //     //extraemos el campo subcategoria
  //     const subcategorias = productos.map((producto: any) => producto.subcategoria);
  //     //eliminamos los duplicados
  //     const subcategoriasUnicas = [...new Set(subcategorias)];
  //     //creamos un arreglo de objetos con el nombre de la subcategoria y el arreglo de productos
  //     const categorias = subcategoriasUnicas.map((subcategoria: any) => ({
  //       nombre: subcategoria,
  //       products: productos.filter((product: any) => product.subcategoria === subcategoria),
  //     }));
  //     this.subcategories = categorias || [];
  //     // console.log(this.subcategories)
  //   })
  //   this.isLoading = false
  // }

    // Tu función original intacta con los tipados necesarios para TypeScript
  getCategories() {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe((resp: any) => {
      // filtramos los productos donde sea igual a la categoria
      const productos = resp.filter((producto: any) => producto.categoria.nombre === this.catname);
      
      // extraemos el campo subcategoria
      const subcategorias = productos.map((producto: any) => producto.subcategoria);
      
      // eliminamos los duplicados (aquí agregamos : any para corregir tu error)
      const subcategoriasUnicas = [...new Set(subcategorias.filter((sub: any) => !!sub))];
      
      // creamos un arreglo de objetos con el nombre de la subcategoria y el arreglo de productos
      const categorias = subcategoriasUnicas.map((subcategoria: any) => ({
        nombre: subcategoria,
        products: productos.filter((product: any) => product.subcategoria === subcategoria),
      }));
      
      this.subcategories = categorias || [];
      // console.log(this.subcategories)
      
      // Inicializamos la grilla con tu método original
      this.updateTodo();
      this.isLoading = false;
    });
  }


   selectCategory(category: string) {
    this.activeCategory = category;
    this.updateTodo();
  }

  updateTodo() {
    if (this.activeCategory === 'all') {
      this.todo = this.products ? this.products.slice() : [];
    } else {
      const selectedCategory = this.subcategories ? this.subcategories.find(subcat => 
        subcat.nombre.toLowerCase().trim() === this.activeCategory.toLowerCase().trim()
      ) : null;
      this.todo = selectedCategory ? selectedCategory.products : [];
    }
  }

  openModal(product: any) {
    this.selectedProduct = product;
    setTimeout(() => {
      const element = document.getElementById('modalProduct-' + product._id);
      if (element && bootstrap?.Offcanvas) {
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

  refreshData() {
    setTimeout(() => {
      this.getCategories();
    }, 1000);
  }

}
