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
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnInit() {
    // 🌟 DINÁMICO: Nos suscribimos al caché reactivo de la tienda activa en el navegador.
    // Ya no dependemos de 'environment.nombreSelected' para gatillar las llamadas HTTP.
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe({
      next: (tienda) => {
        this.tiendaSelected = tienda;
        if (this.tiendaSelected) {
          this.tienda_moneda = this.tiendaSelected.moneda;
          this.getProductosCatName();
        }
      },
      error: (err) => console.error('Error al recuperar la tienda en caché', err)
    });

    // Escucha el trigger de recarga (pull to refresh de la cabecera)
    if (this.refreshCasProducts) {
      this.refreshCasProducts.subscribe(() => this.refreshData());
    }
  }
  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

  getProductosCatName() {
    // Usamos el nombre de la categoría populada por el backend en el objeto Tienda (ej: 'Pizzería')
    this.catname = this.tiendaSelected?.nombre ?? this.activeCategory;
    this.isLoading = true;

    // Ejecuta la petición HTTP limpia: /category_by_nombre/nombre/Pizzería
    this.categoryService.find_by_nombre(this.catname).subscribe({
      next: (resp: any) => {
        this.products = resp.productos || [];
        
        // Mapea las subcategorías (las pestañas internas como Pastas, Pizza, etc.)
        this.generarPestañasInternas();
        
        // Inicializa la grilla de visualización
        this.updateTodo();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los productos principales', error);
        this.isLoading = false;
      }
    });
  }

  generarPestañasInternas() {
    if (!this.products || this.products.length === 0) {
      this.subcategories = [];
      return;
    }

    // Mapeamos el campo subcategoria de los platos descargados (Pastas, Pizza, Especiales...)
    const subcats = this.products.map((producto: any) => producto.subcategoria);
    const subcategoriasUnicas = [...new Set(subcats.filter(sub => !!sub))];

    // Sincronizamos las pestañas con sus respectivos productos vinculados en memoria
    this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
      nombre: subcategoria,
      products: this.products.filter((product: any) => product.subcategoria === subcategoria),
    }));
  }

  selectCategory(category: string) {
    console.log('Filtro de pestaña seleccionado:', category);
    this.activeCategory = category;
    this.updateTodo();
  }

  updateTodo() {
    if (this.activeCategory === 'all') {
      this.todo = this.products ? this.products.slice() : [];
    } else {
      const selectedCategory = this.subcategories ? this.subcategories.find(subcat => subcat.nombre === this.activeCategory) : null;
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
      this.getProductosCatName();
    }, 1000);
  }

}
