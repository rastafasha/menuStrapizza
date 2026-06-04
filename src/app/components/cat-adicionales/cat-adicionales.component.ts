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

    // console.log(`📡 Filtrando adicionales locales de ${this.tiendaSelected.nombre} para: ${this.activeCategory}`);

    // Usamos tu servicio nativo que trae los productos exclusivos de esta tienda
    this.productoService.find_by_storeIdActive(localId).subscribe({
      next: (productos: any[]) => {
        
        // 1. Filtramos en caliente para que SOLO pasen los productos que correspondan a la categoría activa (Bebidas, Cajas, etc.)
        // Comparamos contra el slug o el nombre de forma limpia
        this.products = (productos || []).filter((prod: any) => {
          if (!prod.categoria) return false;
          const catNombre = prod.categoria.nombre ? prod.categoria.nombre.toLowerCase().trim() : '';
          return catNombre === this.activeCategory.toLowerCase().trim();
        });

        // 2. Extraemos las subcategorías internas si el bloque tuviera subdivisiones
        const subcats = this.products.map((producto: any) => {
          return producto.subcategoria ? producto.subcategoria.trim() : null;
        });
        const subcategoriasUnicas = [...new Set(subcats.filter((sub: any) => !!sub))];

        this.subcategories = subcategoriasUnicas.map((subcategoriaName: string) => ({
          nombre: subcategoriaName,
          products: this.products.filter((product: any) => product.subcategoria?.trim() === subcategoriaName),
        }));

        // 3. Cargamos la grilla directo con los productos del local correspondientes a esa sección
        this.todo = this.products.slice();
        this.isLoading = false;
        // console.log(`✅ ¡Filtro de adicionales exitoso! Renderizados para ${this.activeCategory}:`, this.todo.length);
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
