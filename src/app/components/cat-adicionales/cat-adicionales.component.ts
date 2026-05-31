import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TiendaService } from '../../services/tienda.service';
import { CategoryService } from '../../services/category.service'; // ◄--- Usamos el servicio de categorías especializado

@Component({
  selector: 'app-cat-adicionales',
  templateUrl: './cat-adicionales.component.html',
  styleUrls: ['./cat-adicionales.component.css']
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
  private tiendaSubscription!: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    // Si el bloque @defer se activa o cambia de sección en el Home, dispara la red instantáneamente
    if (changes['activeCategory'] && this.tiendaSelected) {
      this.getProductosPorSubcategoria();
    }
  }

  ngOnInit() {
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe(tienda => {
      this.tiendaSelected = tienda;
      if (this.tiendaSelected) {
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

  getProductosPorSubcategoria() {
    if (!this.activeCategory) return;
    
    this.isLoading = true;
    const localId = this.tiendaSelected?._id;

    // 🚀 PETICIÓN DIRECTA POR URL EN RED:
    // Le pega exactamente a: /category_by_nombre/nombre/Entradas?localId=...
    // o /category_by_nombre/nombre/Bebidas?localId=...
    console.log(`📡 Solicitando a Render los adicionales completos para: ${this.activeCategory}`);

    this.categoryService.find_by_nombre(this.activeCategory, localId).subscribe({
      next: (resp: any) => {
        // Guardamos los platos que el endpoint especializado limpia y empaqueta desde la base de datos
        this.products = resp.productos || [];
        
        // Mapeamos las pestañas internas si el bloque tuviera subdivisiones
        const subcats = this.products.map((producto: any) => producto.subcategoria);
        const subcategoriasUnicas = [...new Set(subcats.filter((sub: any) => !!sub))];

        this.subcategories = subcategoriasUnicas.map((subcategoria: any) => ({
          nombre: subcategoria,
          products: this.products.filter((product: any) => product.subcategoria === subcategoria),
        }));

        // Cargamos la grilla directo con la respuesta completa del servidor
        this.todo = this.products.slice();
        this.isLoading = false;
        console.log(`✅ ¡Petición de adicionales exitosa! Renderizados para ${this.activeCategory}:`, this.todo);
      },
      error: (error) => {
        console.error(`❌ Error en la llamada HTTP de adicionales para ${this.activeCategory}:`, error);
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
