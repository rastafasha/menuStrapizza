import { Component, ElementRef, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Producto } from '../../../models/producto.model';
import { FavoritoService } from '../../../services/favorito.service';
import { UsuarioService } from '../../../services/usuario.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { AuthService } from '../../../services/auth.service';
import { MenuFooterComponent } from '../../../shared/menu-footer/menu-footer.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ToastrService } from 'ngx-toastr';
import { SelectorService } from '../../../services/selector.service';
import { CarritoService } from '../../../services/carrito.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalproductComponent } from '../../../components/modalproduct/modalproduct.component';
import { SolicitudService } from '../../../services/solicitud.service';
import { Comentario } from '../../../models/comentarios.model';
import { ComentarioService } from '../../../services/comentario.service';
import { TiendaService } from '../../../services/tienda.service';
declare var bootstrap: any;

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterModule, LoadingComponent,
    ImagenPipe, MenuFooterComponent, HeaderComponent,
    ReactiveFormsModule,
    FormsModule, TranslatePipe,],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  @ViewChild('offcanvasElement', { static: false }) offcanvasElement!: ElementRef;

  public usuario: any;
  public productos!: Producto;
  public favoritos: any[] = [];
  public isLoading = false;
  public isLoadingModal = false;
  public msm_success_fav = false;
  tienda_moneda!: string;
  selectedProduct!: any;

  public msm_error = false;
  public msm_success = false;
  public msm_alert = false;
  public selector_to_cart = ' ';
  public selector_error = false;
  public selectores: any = [];

  isModalOpen: boolean = false;
  comentarios!: Comentario;
  stars: number = 0;
  tiendaSelected!: any;

  constructor(
    private http: HttpClient,
    private solicitudService: SolicitudService,
    private comentarioService: ComentarioService,
    private favoritosService: FavoritoService,
    private tiendaService: TiendaService,
    public usuarioService: UsuarioService,
    public activatedRoute: ActivatedRoute,
    public authService: AuthService,
    public selectorService: SelectorService,
    public carritoService: CarritoService,
    public toastr: ToastrService,
    handler: HttpBackend,
    public translate: TranslateService
  ) {
    this.http = new HttpClient(handler);
  }


  ngOnInit(): void {

    window.scrollTo(0, 0);
    this.escucharTiendaActiva();
    this.usuario = this.authService.getLocalStorage();
    this.getFavoritos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isModalOpen']?.currentValue === true && this.selectedProduct?._id) {
      this.getSelectorProducto();
      this.getComentariosYEstrellas();
    }
  }

    escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda  = this.tiendaSelected.moneda
      }
    });
  }

  getFavoritos() {
    this.isLoading = true;
    this.favoritosService.listarFaoritosporUsuario(this.usuario.uid, this.tiendaSelected._id).subscribe((resp: any) => {
      this.favoritos = resp.favoritos;
      this.isLoading = false;
    })
  }

  removeFavorito(_id: string) {
    console.log(_id)
    this.favoritosService.eliminar(_id).subscribe(
      res => {
        this.toastr.success('Favorito eliminado correctamente', 'Éxito');
        this.getFavoritos();
      }
    );
  }


  verDetalles(item: any) {
  // Asegura tomar el objeto producto real si viene envuelto en el favorito
  const prod = item?.producto ? item.producto : item;
  this.selectedProduct = prod;
  this.selectores = [];
  this.comentarios = [] as any;
  console.log(item)

  if (this.selectedProduct?._id) {
    this.getSelectorProducto();
    this.getComentariosYEstrellas();
  }

  // Espera un tick para asegurar que el DOM con selectedProduct esté listo
  setTimeout(() => {
    const el = this.offcanvasElement?.nativeElement || document.getElementById('offcanvasProducto');
    if (el) {
      const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(el);
      bsOffcanvas.show();
    } else {
      console.error('No se encontró el elemento #offcanvasProducto en el HTML');
    }
  }, 0);
}


  addItem(producto: Producto) {
    this.selector_error = false;

    if (producto.nombre_selector && producto.nombre_selector.toLowerCase() !== 'unico') {

      // Validar de forma segura que no venga vacío o con puros espacios
      if (!this.selector_to_cart || this.selector_to_cart.trim() === '') {
        this.selector_error = true;
        setTimeout(() => {
          this.selector_error = false;
        }, 3000);
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

  closeAviso() {
    this.msm_success = false;
    this.msm_alert = false;
    this.selector_error = false;
  }

  onModalHidden(): void {
    if (this.offcanvasElement && this.offcanvasElement.nativeElement) {
      const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(this.offcanvasElement.nativeElement);
      offcanvas.hide(); // 👈 Esto dispara la animación nativa de Bootstrap primero
    }
  }

  getSelectorProducto() {
    this.isLoadingModal = true;
    this.selector_to_cart = ' ';
    this.selectorService.selectorByProduct(this.selectedProduct._id).subscribe(
      response => {
        this.selectores = response;
        // 2. Llama a esta lógica justo donde recibes `this.selectores` del backend
        // Ejemplo: dentro del .subscribe() donde llenas this.selectores
        if (this.selectores && this.selectores.length > 0) {
          this.seleccionarOpcion(this.selectores[0]);
        }
        this.isLoadingModal = false;
      },
      error => {

      }
    );
  }

  seleccionarOpcion(selector: any) {
    this.selector_to_cart = this.translate.currentLang() === 'en'
      ? selector.titulo.en
      : selector.titulo.es;
    this.selector_error = false;
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

  // ✅ Una sola petición HTTP trae los comentarios Y calcula las estrellas
  getComentariosYEstrellas(): void {
    if (!this.selectedProduct?._id) return;

    this.comentarioService.getComentByProduct(this.selectedProduct._id).subscribe({
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



}
