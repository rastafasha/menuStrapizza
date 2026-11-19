import { CommonModule } from '@angular/common';
import { Component, inject, Input, Output, OnInit, OnDestroy, EventEmitter,  ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { Tienda } from '../../models/tienda.model';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';
import { SelectorService } from '../../services/selector.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { ToastrService } from 'ngx-toastr';
import { FavoritoService } from '../../services/favorito.service';
import { ComentarioService } from '../../services/comentario.service';
import { Comentario } from '../../models/comentarios.model';
import { RatingStarComponent } from '../ratingStar/ratingStar.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SolicitudService } from '../../services/solicitud.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

declare var bootstrap: any;

@Component({
  selector: 'app-modalproduct',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe,
    RatingStarComponent,
    TranslatePipe,
    LoadingComponent
  ],
  templateUrl: './modalproduct.component.html',
  styleUrl: './modalproduct.component.scss'
})
export class ModalproductComponent implements OnInit, OnDestroy, OnChanges {
  // Capturamos el elemento HTML usando la referencia local que pusimos en el HTML
  @ViewChild('offcanvasElement', { static: false }) offcanvasElement!: ElementRef;

  @Input() product: any;
  @Input() selectedProduct: any;
  @Input() tienda_moneda!: any;
  @Input() localIdActual!: any;
  @Input() activeCategory!: string;
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();

  public msm_error = false;
  public msm_success = false;
  public msm_alert = false;
  public isLoading = false;

  producto: any;
  favoriteItem: any;
  comentarios!: Comentario;
  stars: number = 0;

  private router = inject(Router);
  private carritoService = inject(CarritoService);
  private selectorService = inject(SelectorService);
  private favoritoService = inject(FavoritoService);
  private toastr = inject(ToastrService);
  private comentarioService = inject(ComentarioService);
  private solicitudService = inject(SolicitudService);

  constructor(
    // Debe ser public para que el HTML pueda leer "translate.currentLang"
    public translate: TranslateService
  ) { }

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
    const USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;

    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
    });

    if (!this.product?.img) {
      this.img = '../assets/images/no-image.jpg';
    }
  }
  // ✅ Detecta cuándo el padre abre el modal (isModalOpen = true)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isModalOpen']?.currentValue === true && this.product?._id) {
      this.abrirOffcanvas();
      this.getSelectorProducto();
      this.getComentariosYEstrellas();
    }
  }

  private abrirOffcanvas(): void {
    // Usamos setTimeout(..., 0) para asegurar que el HTML del modal ya esté renderizado
    setTimeout(() => {
      if (this.offcanvasElement?.nativeElement) {
        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(this.offcanvasElement.nativeElement);
        offcanvas.show();

        // { once: true } evita que se acumulen múltiples listeners si abres y cierras varias veces
        this.offcanvasElement.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
          this.selector_to_cart = ' ';
          document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove());
          document.body.style.overflow = 'auto';
          document.body.style.paddingRight = '0';
          this.modalClosed.emit();
        }, { once: true });
      }
    }, 0);
  }

  // ✅ Una sola petición HTTP trae los comentarios Y calcula las estrellas
  getComentariosYEstrellas(): void {
    if (!this.product?._id) return;

    this.comentarioService.getComentByProduct(this.product._id).subscribe({
      next: (resp: any) => {
        const lista = resp.comentarios || [];
        this.comentarios = lista;

        if (lista.length > 0) {
          const sumaTotal = lista.reduce((total: number, item: any) => total + item.estrellas, 0);
          this.stars = parseFloat((sumaTotal / lista.length).toFixed(1));
        } else {
          this.stars = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener comentarios:', err);
        this.comentarios = [] as any;
        this.stars = 0;
      }
    });
  }

  

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    // Cleanup orphan Bootstrap backdrops (fixes stuck backdrop issue)
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach((backdrop: Element) => backdrop.remove());
  }


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

    // 🟢 CONDICIÓN UNIVERSAL: Si el plato REQUIERE que el cliente elija un modificador
    if (producto.nombre_selector && producto.nombre_selector.toLowerCase() !== 'unico') {

      // Validar de forma segura que no venga vacío o con puros espacios
      if (!this.selector_to_cart || this.selector_to_cart.trim() === '') {
        this.selector_error = true;
        setTimeout(() => {
          this.selector_error = false;
        }, 3000);
        return;
      }
    }

    // 🟢 INYECCIÓN DINÁMICA: Clonamos el objeto y guardamos la elección real
    let productoParaCarrito = {
      ...producto,
      selector_elegido: (producto.nombre_selector && producto.nombre_selector.toLowerCase() !== 'unico')
        ? this.selector_to_cart
        : 'Único'
    };

    // Enviamos el objeto con la salsa/opción inyectada al servicio
    this.carritoService.addItem(productoParaCarrito);

    // Reset de seguridad para la próxima selección
    this.selector_to_cart = ' ';
    this.toastr.success('Artículo agregado al carrito');
  }


  removeItem(producto: Producto) {
    this.carritoService.removeItem(producto);
    this.toastr.success('Artículo removido del carrito');
  }


  addItemPedido(producto: Producto) {
    this.msm_success = false;
    this.selector_error = false;

    // 🟢 CONDICIÓN UNIVERSAL: Si el plato REQUIERE que el cliente elija un modificador
    if (producto.nombre_selector && producto.nombre_selector.toLowerCase() !== 'unico') {

      // Validar de forma segura que no venga vacío o con puros espacios
      if (!this.selector_to_cart || this.selector_to_cart.trim() === '') {
        this.selector_error = true;
        setTimeout(() => {
          this.selector_error = false;
        }, 3000);
        return;
      }
    }

    // 🟢 INYECCIÓN DINÁMICA: Clonamos el objeto y guardamos la elección real
    let productoParaCarrito = {
      ...producto,
      selector_elegido: (producto.nombre_selector && producto.nombre_selector.toLowerCase() !== 'unico')
        ? this.selector_to_cart
        : 'Único'
    };

    // Enviamos el objeto con la salsa/opción inyectada al servicio
    this.solicitudService.addItem(productoParaCarrito);

    // Reset de seguridad para la próxima selección
    this.selector_to_cart = ' ';
    this.toastr.success('Artículo agregado al pedido');
  }


  removeItemPedido(producto: Producto) {
    this.solicitudService.removeItem(producto);
    this.toastr.success('Artículo removido del pedido');
  }

  addToFavorites(producto: Producto) {

    const data = {
      producto: producto._id,
      usuario: this.user.uid,
      local: this.localIdActual,
    };

    this.favoritoService.registro(data).subscribe((res: any) => {
      this.favoriteItem = res;
      this.toastr.success('Producto agregado a favoritos');
    });
  }

  irASolicitud() {
    this.onModalHidden(); // Cierra el modal antes de navegar
    this.router.navigate(['/bajopedido']);
  }

  closeAviso() {
    this.msm_success = false;
    this.msm_alert = false;
    this.selector_error = false;
  }

  getSelectorProducto() {
    this.isLoading =true;
    this.selector_to_cart = ' ';
    this.selectorService.selectorByProduct(this.product._id).subscribe(
      response => {
        this.selectores = response;
        // 2. Llama a esta lógica justo donde recibes `this.selectores` del backend
        // Ejemplo: dentro del .subscribe() donde llenas this.selectores
        if (this.selectores && this.selectores.length > 0) {
          this.seleccionarOpcion(this.selectores[0]);
        }
        this.isLoading =false;
      },
      error => {

      }
    );
  }

  // 1. Método al hacer clic en un globo
  seleccionarOpcion(selector: any) {
    this.selector_to_cart = this.translate.currentLang() === 'en'
      ? selector.titulo.en
      : selector.titulo.es;
    this.selector_error = false;
  }




}
