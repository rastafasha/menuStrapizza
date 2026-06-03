import { CommonModule } from '@angular/common';
import { Component, inject, Input, Output, OnInit, OnDestroy, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { StorageService } from '../../services/storage.service';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';
import { SelectorService } from '../../services/selector.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { ToastrService } from 'ngx-toastr';
import { FavoritoService } from '../../services/favorito.service';

declare var bootstrap: any;

@Component({
  selector: 'app-modalproduct',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe
  ],
  templateUrl: './modalproduct.component.html',
  styleUrl: './modalproduct.component.scss'
})
export class ModalproductComponent implements OnInit, OnDestroy, AfterViewInit {
  // Capturamos el elemento HTML usando la referencia local que pusimos en el HTML
  @ViewChild('offcanvasElement', { static: false }) offcanvasElement!: ElementRef;

  @Input() product: any;
  @Input() selectedProduct: any;
  @Input() tienda_moneda!: any;
  @Input() activeCategory!: string;
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();

  public msm_error = false;
  public msm_success = false;
  public msm_alert = false;

  producto: any;
  favoriteItem: any;

  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);
  private selectorService = inject(SelectorService);
  private favoritoService = inject(FavoritoService);
  private toastr = inject(ToastrService);

  user!: Usuario;
  bandejaList: any[] = [];
  tiendaSelected: Tienda | null = null;
  tiendaNameSelected!: string;
  img: string | null = './assets/images/no-image.jpg';

  public selector_to_cart = ' ';
  public selector_error = false;
  public selectores: any = [];

  private cartSubscription!: Subscription;
  // private modalInstance: any = null; - removed

  ngOnInit(): void {
    this.msm_alert = false;
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
    // Subscribe to cart changes to keep local copy updated
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
    });

    this.product;
    this.activeCategory;
    if (!this.product?.img) {
      this.img = '../assets/images/no-image.jpg';
    }
    this.getSelectorProducto();
  }

  // 🚀 ESTA FUNCIÓN ES LA MAGIA: Se ejecuta AUTOMÁTICAMENTE cuando el HTML ya existe en el DOM
  ngAfterViewInit() {
    if (this.offcanvasElement && this.offcanvasElement.nativeElement) {
      const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(this.offcanvasElement.nativeElement);
      offcanvas.show();

      // 🚀 ESCUCHA CUANDO LA ANIMACIÓN DE CIERRE TERMINA POR COMPLETO
      this.offcanvasElement.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
        // Ejecutamos la limpieza interna
        this.selector_to_cart = ' ';
        document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';

        // Ahora sí, le avisamos al padre que ponga la variable en null
        this.modalClosed.emit();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    // Cleanup orphan Bootstrap backdrops (fixes stuck backdrop issue)
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach((backdrop: Element) => backdrop.remove());
  }

  // ngOnChanges removed - no longer needed with Bootstrap data attributes

  // Modificamos la función de la "X" para que NO emita directo, sino que use el JS de Bootstrap
  onModalHidden(): void {
    if (this.offcanvasElement && this.offcanvasElement.nativeElement) {
      const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(this.offcanvasElement.nativeElement);
      offcanvas.hide(); // 👈 Esto dispara la animación nativa de Bootstrap primero
    }
  }


  total() {
    const total = this.bandejaList.reduce((sum, item) =>
      sum + item.precio_ahora * item.cantidad, 0
    );
    return total;
  }

  addItem(producto: Producto) {
    this.msm_success = false;
    this.selector_error = false;

    if (producto.subcategoria === 'Pastas') {
      // Validar que se haya seleccionado un selector
      if (!this.selector_to_cart || this.selector_to_cart === ' ') {
        this.selector_error = true;
        setTimeout(() => {
          this.selector_error = false;
        }, 3000)
        return;
      }

      // Agregamos el selector al producto
      producto.nombre_selector = this.selector_to_cart;

    }

    this.carritoService.addItem(producto);
    // Reset selector after adding
    this.selector_to_cart = ' ';
    this.toastr.success('Artículo agregado al carrito');
  }

  removeItem(producto: Producto) {
    this.carritoService.removeItem(producto);
    this.toastr.success('Artículo removido del carrito');
  }
  addToFavorites(producto: Producto) {
    console.log(this.producto);

    const data = {
      producto: producto._id,
      usuario: this.user.uid,
    };

    this.favoritoService.registro(data).subscribe((res: any) => {
      this.favoriteItem = res;
      this.toastr.success('Producto agregado a favoritos');
    });
  }

  closeAviso() {
    this.msm_success = false;
    this.msm_alert = false;
    this.selector_error = false;
  }

  getSelectorProducto() {
    this.selector_to_cart = ' ';
    this.selectorService.selectorByProduct(this.product._id).subscribe(
      response => {
        this.selectores = response;
      },
      error => {

      }
    );
  }

  
}
