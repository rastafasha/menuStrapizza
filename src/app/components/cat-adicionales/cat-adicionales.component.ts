import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TrackByFunction } from '@angular/core';
import { Subscription } from 'rxjs';
import { Categoria } from '../../models/categoria.model';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { CategoryService } from '../../services/category.service';
import { ProductoService } from '../../services/product.service';
import { TiendaService } from '../../services/tienda.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ModalproductComponent } from '../modalproduct/modalproduct.component';
import { ProductItemComponent } from '../product-item/product-item.component';

declare var bootstrap: any;

@Component({
  selector: 'app-cat-adicionales',
  imports: [
    CommonModule, 
    LoadingComponent,
    ProductItemComponent, 
    ModalproductComponent,
  ],
  templateUrl: './cat-adicionales.component.html',
  styleUrl: './cat-adicionales.component.scss'
})
export class CatAdicionalesComponent {
  // Evento para avisarle al componente padre o al cas-product principal qué categoría se eligió
  @Output() categorySelected: EventEmitter<string> = new EventEmitter<string>();

  @Input() activeCategory: string = 'all'; 
  @Input() title!: string;
  @Input() isLoading: boolean = false;
   @Input() tienda_moneda!: any;

  catname!: string;
  subcategories: any[] = [];
  products: any[] = [];
  tiendaSelected: any = null;
  selectedProduct: any = null;

  private categoryService = inject(CategoryService);
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      this.tienda_moneda = this.tiendaSelected.moneda;
      if (this.tiendaSelected) {
        this.getProductosCatName();
      }
    });
  }
  

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

  getProductosCatName() {
    this.isLoading = true;

    if (this.tiendaSelected?.categoria && typeof this.tiendaSelected.categoria === 'object' && (this.tiendaSelected.categoria as any).slug) {
      this.catname = (this.tiendaSelected.categoria as any).slug;
    } else {
      const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
      if (rubro === 'panaderia') {
        this.catname = 'panaderia'; 
      } else if (rubro === 'hamburgueseria') {
        this.catname = 'hamburguesa';
      } else {
        this.catname = 'pizzeria';
      }
    }

    const localId = this.tiendaSelected?._id;

    this.categoryService.find_by_nombre(this.catname, localId).subscribe({
      next: (resp: any) => {
        this.products = resp.productos || [];
        this.getCategories(); // Extrae las pestañas/categorías adicionales en memoria
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener las categorías por slug', error);
        this.isLoading = false;
      }
    });
  }

  getCategories() {
    if (!this.products || this.products.length === 0) {
      this.subcategories = [];
      return;
    }

    const subcategorias = this.products.map((producto: any) => producto.subcategoria);
    const subcategoriasUnicas = [...new Set(subcategorias.filter(sub => !!sub))];

    this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
      nombre: subcategoria
    }));

    console.log('Categorías adicionales listas:', this.subcategories);
  }

  selectCategory(category: string) {
    console.log('Categoría adicional cliqueada:', category);
    this.activeCategory = category;
    
    // Emitimos el string elegido al componente padre para que filtre el menú principal
    this.categorySelected.emit(category);
  }
}
