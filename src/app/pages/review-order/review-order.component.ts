import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidomenuService } from '../../services/pedidomenu.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DireccionService } from '../../services/direccion.service';
import { UsuarioService } from '../../services/usuario.service';
import { WaGeolocationService } from '@ng-web-apis/geolocation';
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-review-order',
  imports: [
    HeaderComponent,
    CommonModule,
    RouterModule,
    ImagenPipe,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './review-order.component.html',
  styleUrl: './review-order.component.scss'
})
export class ReviewOrderComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  bandejaList: Producto[] = [];
  fechaHoy: string = new Date().toISOString().split('T')[0];
  randomNum: number = 0;
  isbandejaList: boolean = false;

  tiendaSelected: any;
  tienda_moneda: any;

  tiendas: Tienda[] = [];
  identity: any;
  userId: any;
  pedido: any;
  usuario: any;

  public expressForm!: FormGroup;
  public direccionForm!: FormGroup;

  public whatsapp!: string;

  pedidoGuardado = false;
  // Variables del mapa
  public direccion: any;
  map: any; // Tu variable global para almacenar la instancia del mapa

  // private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  selectedCoords: { lat: number; lng: number } | null = null;
  mapLoading = true;
  mapError = '';
  private locationSubscription: Subscription | null = null;
  pasoActual: number = 1;
  public data_detalle: Array<any> = [];
  public subtotal: any = 0;
  public urlWhatsApp: string = '';

  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidomenuService);
  private usuarioService = inject(UsuarioService);
  private toastr = inject(ToastrService);
  private _router = inject(Router);
  private fb = inject(FormBuilder);

  private cartSubscription!: Subscription;



  constructor(
    private router: Router
  ) {

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.identity = this.usuarioService.getLocalStorage()
    if (this.identity) {
      this.userId = this.identity.uid;
    }

    // Subscribe to cart changes from CarritoService
    this.SubscribeToCart();
    this.escucharTiendaActiva();
    this.geneardorOrdeneNumero();
    this.loadBandejaListFromLocalStorage();
    this.chekpedidoguardado();
    this.crearFormularioExpress();

    this.expressForm.valueChanges.subscribe(() => {
      this.actualizarUrlWhatsApp();
    });
  }

  SubscribeToCart() {
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
      this.isbandejaList = items.length > 0;
      // If cart becomes empty, navigate to home
      if (items.length === 0 && this.router.url.includes('/review')) {
        this.router.navigate(['/']);
      }
    });
  }



  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }


  //tienda

  escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda = this.tiendaSelected.moneda
      }
    });
  }
  total() {
    const total = this.bandejaList.reduce((sum, item) =>
      sum + (item.precio_ahora * item.cantidad), 0
    );
    return total;
  }

  addItem(item: Producto, index: number) {
    // Use CarritoService to add item - this will trigger the BehaviorSubject update
    this.carritoService.addItem(item);
  }

  removeItem(item: Producto, index: number) {
    // Use CarritoService to remove item - this will trigger the BehaviorSubject update
    // and notify all subscribers including MenuFooterComponent
    this.carritoService.removeItem(item);
    if (this.bandejaList.length === 0) {
      this.chekpedidoguardado();
    }
  }

  borrarPedido() {
    this.pedidoService.borrarPedido(this.pedido._id).subscribe((resp: any) => {
    })
  }


  geneardorOrdeneNumero() {
    //creamos una suma de 1 a 1000 para ordenes nuevas
    const max = 1000;
    const min = 1;
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    this.randomNum = random;
  }
  loadBandejaListFromLocalStorage() {
    const storedItems = localStorage.getItem('bandejaItems');
    if (storedItems) {
      this.bandejaList = JSON.parse(storedItems);

    }
    if (this.bandejaList.length > 0) {
      this.isbandejaList = true;
    }

    this.bandejaList;
    this.subtotal = 0;
    this.bandejaList.forEach(element => {
      this.subtotal = Math.round(this.subtotal + (element.precio_ahora * element.cantidad));
      this.data_detalle.push({
        producto: element,
        cantidad: element.cantidad,
        precio: Math.round(element.precio_ahora),
        color: '#fff',
        selector: 'unico'
      })
      // console.log(this.bandejaList);

    });
  }

  //si existe usuario logueado
  chekpedidoguardado() {
    const storedItems = localStorage.getItem('bandejaItems');
    // Si no hay items en localStorage, no hay pedido guardado
    if (!storedItems) {
      this.pedidoGuardado = false;
      return;
    }

    // Si no hay userId, no hay pedido guardado
    if (!this.userId) {
      this.pedidoGuardado = false;
      return;
    }
    this.pedidoService.getByUserId(this.userId).subscribe((resp: any) => {
      // resp es un array de pedidos
      // Si el array está vacío, no hay pedido guardado
      if (!resp || resp.length === 0) {
        this.pedidoGuardado = false;
        return;
      }

      // Convertir storedItems a objeto para comparar
      const bandejaItems = JSON.parse(storedItems);

      // Verificar si existe algún pedido que coincida con los items actuales
      // Comparamos el contenido de los arrays, no por referencia
      const pedidoCoincide = resp.some((pedido: any) => {
        // Comparamos que la tienda sea la misma
        const mismaTienda = pedido.tienda === this.tiendaSelected?._id;

        // Comparamos que los pedidos tengan los mismos items (misma longitud y mismos IDs)
        const mismaBandeja = pedido.pedido && pedido.pedido.length === bandejaItems.length;
        return mismaTienda && mismaBandeja;
      });

      // pedidoGuardado es true solo si:
      // 1. Hay items en localStorage Y
      // 2. Hay un pedido en la BD que coincida con esos items
      this.pedidoGuardado = pedidoCoincide;

      this.pedido = resp[0]
      // this.borrarPedido()
    })
  }
  // fin tienda

  //proceso para registro express
  crearFormularioExpress() {
    this.expressForm = this.fb.group({
      first_name: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]], // Valida números telefónicos
      tipoEntrega: ['delivery', Validators.required],
      direccion: [''] // Lo validaremos dinámicamente según la entrega
    });

    // Escuchar cambios en el tipo de entrega para activar/desactivar la validación de dirección
    this.expressForm.get('tipoEntrega')?.valueChanges.subscribe(tipo => {
      const direccionControl = this.expressForm.get('direccion');
      if (tipo === 'pickup') {
        direccionControl?.clearValidators(); // Si retira en tienda, no es obligatoria
      } else {
        direccionControl?.setValidators([Validators.required]); // Si es delivery, sí es obligatoria
      }
      direccionControl?.updateValueAndValidity();
    });
  }

  avanzarAlRegistroExpress() {
    // Si el usuario ya está logueado en tu app, saltamos directo al mapa o al envío
    // Si no, lo mandamos al paso 2 (formulario express de datos básicos)
    this.pasoActual = 2;
  }

  procesarClienteExpress() {
    if (this.expressForm.invalid) return;

    // 1. Extraemos el ID de la tienda actual (puedes jalarlo de tu servicio de tiendas o ruta)
    const localId = this.tiendaSelected._id || '';

    // 2. Estructuramos el payload JSON plano con los nombres exactos que espera tu backend
    const payloadExpress = {
      first_name: this.expressForm.value.first_name,
      telefono: this.expressForm.value.telefono,
      local: localId
    };

    // 1. Corres tu petición HTTP a Node.js para registrar al cliente de forma invisible (crearClienteExpress)
    this.usuarioService.crearClienteExpress(payloadExpress).subscribe((resp: any) => {

      this.toastr.success('Gracias por Registrate');
      // 2. Al recibir la respuesta exitosa (y guardar el JWT/ID del usuario):
      const uidDirecto = resp.uid || resp.usuario?._id || resp.usuario?.uid || resp.id;

      this.guardarPedido(uidDirecto);
      // SALVAVIDAS: Solo borramos el carrito si la URL de WhatsApp se calculó con éxito
      if (this.urlWhatsApp && this.urlWhatsApp !== '') {
        localStorage.removeItem('bandejaItems');
        this.carritoService.clearCart();
      }

    }, (err) => {
      this.toastr.error('Error', err.error.msg,);
    })
  }

  // Recibimos el userId directamente para asegurar que no viaje como undefined
  guardarPedido(userId?: string) {
    this.pedidoGuardado = false;

    // Prioridad 1: ID directo del backend. Prioridad 2: LocalStorage.
    const localStorageData = this.usuarioService.getLocalStorage();
    const uid = userId || localStorageData?.uid;

    // Si sigue vacío, lanzamos la alerta para diagnosticarlo
    if (!uid) {
      this.toastr.error('Error', 'No se encontró el identificador del usuario. Intente de nuevo.');
      console.error('Estructura de localStorage actual:', localStorageData);
      return;
    }

    const data = {
      user: uid, // Aquí ya viaja seguro el ID string
      tienda: this.tiendaSelected._id,
      pedidoList: this.bandejaList,
      status: 'PENDING'
    };

    this.pedidoService.create(data).subscribe({
      next: (resp: any) => {
        this.pedidoGuardado = true;
        this.toastr.success('¡Éxito!', 'Pedido Agregado');
        this.actualizarUrlWhatsApp();

      },
      error: (err) => {
        this.toastr.error('Error al guardar', err.error.msg || 'No se pudo registrar el pedido');
      }
    });
  }


  // Generate WhatsApp message with order items
  getWhatsAppMessage(): string {

    // Si no hay sesión o la bandeja está vacía, frena aquí
    if (!this.identity || !this.bandejaList || this.bandejaList.length === 0) {
      return '';
    }

    // SALVAVIDAS: Si expressForm no existe o no tiene datos, usamos datos de la sesión para que NO se rompa
    const formValues = this.expressForm?.value || {};
    const nombreCliente = formValues.first_name || this.identity.first_name || 'Cliente';
    const tipoEntrega = formValues.tipoEntrega || 'No especificado';
    const telefonoCliente = formValues.telefono || this.identity.telefono || 'No registrado';

    let message = `*Nuevo Pedido desde App Menu #${this.randomNum}*\n\n`;
    message += `*Cliente:* ${nombreCliente}\n`;
    message += `*Tipo Entrega:* ${tipoEntrega}\n`;
    message += `*Teléfono:* ${telefonoCliente}\n\n`;
    message += `*Detalles del Pedido:*\n`;
    message += `─────────────────────\n`;

    this.bandejaList.forEach((item: any) => {
      const itemTotal = (item.precio_ahora * item.cantidad).toFixed(2);
      message += `• ${item.titulo}\n`;

      // Evitamos comparar contra propiedades undefined de los items
      if (item.nombre_selector && item.nombre_selector !== 'unico') {
        message += `• ${item.nombre_selector}\n`;
      }

      message += `  Cant: ${item.cantidad} x ${item.precio_ahora.toFixed(2)} = ${itemTotal}\n\n`;
    });

    message += `─────────────────────\n`;
    message += `*TOTAL:* ${this.tienda_moneda} ${this.total().toFixed(2)}\n\n`;
    message += `Por favor confirmar disponibilidad y método de pago.`;

    return encodeURIComponent(message);
  }

  // Llama a esta función dentro de tu ngOnInit() o cada vez que cambie el carrito/formulario
  actualizarUrlWhatsApp(): void {
    if (!this.tiendaSelected?.telefono) return;

    const phone = this.tiendaSelected.telefono.replace(/\D/g, '');
    const message = this.getWhatsAppMessage();

    if (message && phone) {
      // CORRECCIÓN CLAVE: Debe llevar obligatoriamente "api." al principio
      this.urlWhatsApp = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
    } else {
      this.urlWhatsApp = '';
    }
  }



  // Tu función original intacta
  // sendWhatsAppOrder(): void {
  //   this.whatsapp = this.tiendaSelected.telefono;
  //   const phone = this.whatsapp.replace(/\D/g, '');

  //   // 1. TRUCO DE MAGIA: Abrimos una pestaña en blanco INMEDIATAMENTE.
  //   // Como ocurre al instante del clic, el teléfono NO la bloquea.
  //   const nuevaPestana = window.open('about:blank', '_blank');

  //   // 2. Procesamos el mensaje (aquí es donde se tardaba el código)
  //   const message = this.getWhatsAppMessage();

  //   if (message && nuevaPestana) {
  //     // 3. Si el mensaje se generó bien, le cambiamos la URL a la pestaña que ya abrimos
  //     nuevaPestana.location.href = `https://wa.me/${phone}?text=${message}`;
  //   } else if (nuevaPestana) {
  //     // Si algo falló, cerramos la pestaña silenciosamente para no dejarla colgada
  //     nuevaPestana.close();
  //     console.warn('No se pudo generar el mensaje.');
  //     return;
  //   }

  //   // 4. Tu lógica de limpieza original intacta
  //   localStorage.removeItem('bandejaItems');
  //   this.carritoService.clearCart();
  // }












}

