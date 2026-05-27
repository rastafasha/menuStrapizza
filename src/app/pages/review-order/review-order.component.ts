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
  nombreSelected = environment.nombreSelected;
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


  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidomenuService);
  private usuarioService = inject(UsuarioService);
  private direccionService = inject(DireccionService);
  private toastr = inject(ToastrService);
  private geolocation$ = inject(WaGeolocationService);
  private _router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  private cartSubscription!: Subscription;



  constructor(
    private router: Router
  ) {
    window.scrollTo(0, 0);
  }
  ngOnInit() {
    this.identity = this.usuarioService.getLocalStorage()
    if (this.identity) {
      this.userId = this.identity.uid;
    }

    this.nombreSelected;
    // Subscribe to cart changes from CarritoService
    this.SubscribeToCart();
    this.getTienda();
    this.geneardorOrdeneNumero();
    this.loadBandejaListFromLocalStorage();
    this.chekpedidoguardado();
    this.crearFormularioExpress();
    // Suscripción a geolocalización para centrar mapa inicialmente
    this.SuscripciónGeolocalizacion();
    this.iniciarFormularioDireccion();
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


  //mapa direccion
  SuscripciónGeolocalizacion() {
    this.locationSubscription = this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('Initial geolocation success - Lat:', lat, 'Lng:', lng);
        // Solo usar GPS si no hay coordenadas ya seleccionadas
        if (!this.selectedCoords && this.map) {
          this.map.setView([lat, lng], 15);
        }
        this.mapLoading = false;
        this.mapError = '';
      },
      error: (error) => {
        console.error('Error de geolocalización:', error);
        this.mapLoading = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.mapError = 'Permiso de geolocalización denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            this.mapError = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            this.mapError = 'Tiempo de espera agotado';
            break;
          default:
            this.mapError = 'Error desconocido';
        }
        // Centrar en ubicación por defecto (Venezuela) si hay error
        if (this.map) {
          this.map.setView([10.4806, -66.9036], 15);
        }
      }
    });
  }

  iniciarFormularioDireccion(){
    this.direccionForm = this.fb.group({
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      direccion: [''], // Puedes añadir los campos extra que necesites
      referencia: [''], // Puedes añadir los campos extra que necesites
    });
  }

  // ngAfterViewInit() {
  //   // Delay aumentado para asegurar DOM listo y logging
  //   setTimeout(() => {
  //     console.log('Attempting to init map. Container ready?', !!this.mapContainer?.nativeElement);
  //     this.initMap();
  //   }, 300);
  // }

  /**
     * Inicializa el mapa de Leaflet
     */
  private initMap(): void {
    if (this.map) {
    setTimeout(() => {
      // Si usas Leaflet:
      this.map.invalidateSize();
      // Si usas Google Maps no necesitas invalidar, con el retorno basta.
    }, 100);
    return; 
  }
    console.log('Map container element:', this.mapContainer?.nativeElement);
    // Verificar que el contenedor del mapa existe
    if (!this.mapContainer?.nativeElement) {
      console.error('Contenedor del mapa no encontrado');
      this.mapError = 'Contenedor del mapa no disponible. Recarga la página.';
      this.mapLoading = false;
      return;
    }

    // Centro inicial: Venezuela por defecto
    const centerLat = 10.4806;
    const centerLng = -66.9036;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [centerLat, centerLng],
      zoom: 15,
      zoomControl: true
    });

    // Agregar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Evento click en el mapa para colocar marcador
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng.lat, e.latlng.lng);
    });

    // Si hay coordenadas en la dirección existente, mostrar marcador
    if (this.direccion?.latitud && this.direccion?.longitud) {
      this.placeMarker(this.direccion.latitud, this.direccion.longitud);
      this.map.setView([this.direccion.latitud, this.direccion.longitud], 15);
    }

    this.mapLoading = false;
  }
  /**
     * Usa la ubicación actual del GPS
     */
  useCurrentLocation(): void {
    this.mapLoading = true;
    console.log('Starting GPS location');
    this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('GPS Success:', lat, lng);
        this.placeMarker(lat, lng);
        this.mapLoading = false;
      },
      error: (error) => {
        console.error('GPS Error:', error);
        this.mapLoading = false;
        this.toastr.warning('GPS Error', 'Habilita ubicación. Usa HTTPS.');
      }
    });
  }

  /**
    * Coloca o mueve el marcador en las coordenadas especificadas
    */
  placeMarker(lat: number, lng: number): void {
    console.log('placeMarker called with lat:', lat, 'lng:', lng);

    // Always set coords FIRST
    this.selectedCoords = { lat, lng };
    console.log('selectedCoords set:', this.selectedCoords); // esta viene

    // Patch form fields
    this.direccionForm.patchValue({ latitud: lat, longitud: lng });
    console.log('Form lat/lng:', this.direccionForm.value.latitud, this.direccionForm.value.longitud); //error aqui

    if (!this.map) {
      console.error('Map not ready - coords saved anyway');
      this.fetchAddress(lat, lng);
      return;
    }

    // Marker
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('<b>Ubicación GPS</b>')
        .openPopup();
    }

    this.map.setView([lat, lng], 15);

    // Address
    this.fetchAddress(lat, lng);
  }

  fetchAddress(lat: number, lng: number): void {
    console.log('Geocoding', lat, lng);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        const address = data.display_name || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
        this.direccionForm.patchValue({ direccion: `📍 ${address}` });
        console.log('Address:', address);
      })
      .catch(() => {
        this.direccionForm.patchValue({ direccion: `📍 GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      });
  }
  // fin mapa direccion


  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }


  //tienda
  getTienda() {
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: Tienda) => {
      // Asignamos el array filtrado directamente
      this.tiendaSelected = resp;
      this.tienda_moneda = this.tiendaSelected.moneda
    })
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


      if (this.expressForm.value.tipoEntrega === 'pickup') {
        // Si retira en tienda, no necesita mapa, disparamos el WhatsApp de una vez!
       this.guardarPedido(uidDirecto);
      } else {
        // Si quiere delivery, lo pasamos al paso 3 para que use tu mapa potente
        this.pasoActual = 3;
        // Forzamos a Angular a renderizar el contenedor HTML (#mapContainer) inmediatamente
      this.cdr.detectChanges(); 

        // 💡 IMPORTANTE: Inicializas tu mapa aquí mismo usando un setTimeout de 50ms 
        // para darle tiempo a Angular de renderizar el contenedor #mapContainer que estaba oculto
        
        this.initMap(); // Tu función existente que dibuja el mapa de Google o Leaflet
        // setTimeout(() => {
        // }, 50);
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
  const uid = userId || localStorageData?.uid ;

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
      
      localStorage.removeItem('bandejaItems');
      this.carritoService.clearCart();

      if (this.expressForm.value.tipoEntrega === 'pickup') {
        this.sendWhatsAppOrder();
      }
    },
    error: (err) => {
      this.toastr.error('Error al guardar', err.error.msg || 'No se pudo registrar el pedido');
    }
  });
}

  onSubmitDireccionFinal() {
    if (this.direccionForm.invalid) return;

    // 1. Guardas la dirección en el backend llamando a tu servicio existente de direcciones.
    // Como en el paso 2 ya registraste al cliente y tienes su ID/Token, la dirección se asociará perfectamente.
    const data: any = {
      ...this.direccionForm.value,
      user: this.usuarioService.getLocalStorage()?.uid,
      latitud: this.selectedCoords?.lat || this.direccionForm.value.latitud || 0,
      longitud: this.selectedCoords?.lng || this.direccionForm.value.longitud || 0
    };

    this.direccionService.registro(data).subscribe(
      (resp: any) => {
        this.toastr.success('¡Creado!', 'Dirección guardada correctamente');
      }, error => this.toastr.error('Error', error.message,)
    );
    // 2. Teniendo las coordenadas (selectedCoords) y la dirección textual, abrimos el WhatsApp final
    this.sendWhatsAppOrder();
  }




  // Generate WhatsApp message with order items
  getWhatsAppMessage(): string {

    if (!this.identity || this.bandejaList.length === 0) {
      return '';
    }

    let message = `*Nuevo Pedido desde App Menu #${this.randomNum}*\n\n`;
    message += `*Cliente:* ${this.identity.first_name} ${this.identity.last_name}\n`;
    message += `*Teléfono:* ${this.identity.telefono || 'No registrado'}\n\n`;
    message += `*Detalles del Pedido:*\n`;
    message += `─────────────────────\n`;

    this.bandejaList.forEach((item: any) => {
      const itemTotal = (item.precio_ahora * item.cantidad).toFixed(2);
      message += `• ${item.titulo || item.titulo}\n`;
      if (item.subcategoria === 'Pastas') {
        message += `• ${item.nombre_selector}\n`;
      }
      message += `  Cant: ${item.cantidad} x ${item.precio_ahora.toFixed(2)} = ${itemTotal}\n\n`;
    });

    // message += `─────────────────────\n`;
    // message += `*Delivery:* ${this.pedido.delivery}\n`;
    message += `─────────────────────\n`;
    message += `*TOTAL:* ${this.tienda_moneda} ${this.total().toFixed(2)}\n\n`;
    message += `Por favor confirmar disponibilidad y método de pago.`;

    return encodeURIComponent(message);
  }

  // Open WhatsApp with pre-filled message
  sendWhatsAppOrder(): void {

    this.whatsapp = this.tiendaSelected.telefono;
    const phone = this.whatsapp.replace(/\D/g, '');
    const message = this.getWhatsAppMessage();

    if (message) {
      const url = `https://wa.me/${phone}?text=${message}`;
      window.open(url, '_blank');
    }
    // Limpiamos carritos
      localStorage.removeItem('bandejaItems');
      this.carritoService.clearCart();

  }








}

