import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TrackByFunction } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';
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
  // Recibirá desde el Home 'Entradas', 'Combos', 'Bebidas' o 'Postres'
  @Input() activeCategory: string = ''; 
  @Input() title!: string;
  @Input() isLoading: boolean = false;
  @Input() tienda_moneda!: any;

  catname!: string;
  subcategories: any[] = [];
  products: any[] = [];
  todo: any[] = []; // ◄--- Crucial: Aquí se guardan los platos filtrados de esta sección
  selectedProduct: any = null; // ◄--- Controla el producto activo en el modal
  tiendaSelected: any = null;

  private categoryService = inject(CategoryService);
  private tiendasService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
        this.tienda_moneda = this.tiendaSelected.moneda;
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
        this.updateTodo(); // ◄--- Filtra de inmediato los platos asignados a este bloque
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los productos por slug', error);
        this.isLoading = false;
      }
    });
  }

  // Filtra los productos en memoria basándose en la categoría asignada al componente desde el Home
  updateTodo() {
    if (!this.products || this.products.length === 0) {
      this.todo = [];
      return;
    }

    // Busca los productos que correspondan exactamente a la subcategoría del bloque (Bebidas, Entradas, etc.)
    this.todo = this.products.filter((product: any) => {
      if (!product.subcategoria) return false;
      return product.subcategoria.toLowerCase().trim() === this.activeCategory.toLowerCase().trim();
    });

    console.log(`Productos listos para la sección (${this.activeCategory}):`, this.todo);
  }
}
