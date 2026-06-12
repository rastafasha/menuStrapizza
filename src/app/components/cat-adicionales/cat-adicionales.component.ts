import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TiendaService } from '../../services/tienda.service';
import { CategoryService } from '../../services/category.service'; // ◄--- Usamos el servicio de categorías especializado
import { ProductItemComponent } from '../product-item/product-item.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ModalproductComponent } from '../modalproduct/modalproduct.component';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/product.service';

@Component({
  selector: 'app-cat-adicionales',
  imports:[
    ProductItemComponent,
    LoadingComponent,
    ModalproductComponent,
    CommonModule
  ],
  templateUrl: './cat-adicionales.component.html',
  styleUrls: ['./cat-adicionales.component.scss']
})
export class CatAdicionalesComponent implements OnInit, OnDestroy, OnChanges {
  // Recibe del Home el término exacto: 'Entradas', 'Combos', 'Bebidas' o 'Postres'
  @Input() activeCategory: string = ''; 
  @Input() title!: string;
  @Input() tienda_moneda!: any;

  isLoading: boolean = false;
  subcategories: any[] = [];
  products: any[] = [];
  todo: any[] = []; 
  selectedProduct: any = null;
  tiendaSelected: any = null;

  private categoryService = inject(CategoryService); // ◄--- Inyección del servicio correcto
  private tiendasService = inject(TiendaService);
  private productoService = inject(ProductoService); // ◄--- Asegúrate de tener un servicio de productos que traiga por tienda
  private tiendaSubscription!: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    // Si el bloque @defer se activa o cambia de sección en el Home, dispara la red instantáneamente
    if (changes['activeCategory'] && this.tiendaSelected) {
      this.getProductosPorSubcategoria();
    }
  }

  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda = this.tiendaSelected.moneda;
        this.getProductosPorSubcategoria(); 
      }
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }

  // 🟢 LOGICA CORREGIDA: Filtramos por ID de tienda y por el nombre de la categoría principal
  getProductosPorSubcategoria() {
    if (!this.activeCategory || !this.tiendaSelected?._id) return;
    
    this.isLoading = true;
    const localId = this.tiendaSelected._id;

    this.productoService.find_by_storeIdActive(localId).subscribe({
      next: (productos: any[]) => {
        
        // 1. Filtrar los productos por la categoría activa utilizando la clave estable (.es)
        this.products = (productos || []).filter((prod: any) => {
          if (!prod.categoria || !prod.categoria.nombre) return false;
          
          // Soporte híbrido para el nombre de la categoría
          const catNombreEs = typeof prod.categoria.nombre === 'object' 
            ? prod.categoria.nombre.es 
            : prod.categoria.nombre;

          return catNombreEs ? catNombreEs.trim().toLowerCase() === this.activeCategory.trim().toLowerCase() : false;
        });

        // 2. Extraer las subcategorías en español de los productos filtrados para agrupar
        const subcatsEspanol = this.products.map((producto: any) => {
          if (producto.subcategoria && typeof producto.subcategoria === 'object') {
            return producto.subcategoria.es ? producto.subcategoria.es.trim() : null;
          }
          return typeof producto.subcategoria === 'string' ? producto.subcategoria.trim() : null;
        });
        
        // Eliminar duplicados de control
        const subcategoriasUnicasEs = [...new Set(subcatsEspanol.filter((sub: any) => !!sub))];

        // Reconstruir el arreglo mapeando el objeto bilingüe completo { es, en } en 'nombre'
        this.subcategories = subcategoriasUnicasEs.map((subcatEs: string) => {
          
          // Buscamos el objeto original en los productos para preservar las traducciones
          const productoConSubcat = this.products.find((p: any) => p.subcategoria?.es?.trim() === subcatEs || p.subcategoria === subcatEs);
          
          return {
            // Pasamos el objeto completo para que lo consuma el HTML y el Pipe bilingüe
            nombre: productoConSubcat && typeof productoConSubcat.subcategoria === 'object' 
              ? productoConSubcat.subcategoria 
              : { es: subcatEs, en: '' },
            
            // Filtramos el grupo comparando contra la clave en español
            products: this.products.filter((product: any) => {
              const currentSubcatEs = typeof product.subcategoria === 'object' ? product.subcategoria?.es : product.subcategoria;
              return currentSubcatEs ? currentSubcatEs.trim() === subcatEs : false;
            }),
          };
        });

        // 3. Cargamos la grilla directo con los productos correspondientes
        this.todo = this.products.slice();
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`❌ Error al obtener productos para adicionales de ${this.activeCategory}:`, error);
        this.isLoading = false;
      }
    });
}


  selectCategory(category: string) {
    this.activeCategory = category;
    const selected = this.subcategories.find(sub => sub.nombre === category);
    this.todo = selected ? selected.products : [];
  }

  openModal(product: any) {
    this.selectedProduct = product;
    console.log(product)
    setTimeout(() => {
      const element = document.getElementById('modalProduct-' + product._id);
      if (element && (window as any).bootstrap) {
        const myOffcanvas = new (window as any).bootstrap.Offcanvas(element, {
          backdrop: true,
          keyboard: true,
          scroll: true
        });
        myOffcanvas.show();
      }
    }, 0);
  }

}
