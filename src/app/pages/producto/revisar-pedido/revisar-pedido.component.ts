import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PreciosDeliveryComponent } from '../../../components/precios-delivery/precios-delivery.component';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Direccion } from '../../../models/direccion.model';
import { Producto } from '../../../models/producto.model';
import { Tienda } from '../../../models/tienda.model';
import { Usuario } from '../../../models/usuario.model';
import { AuthService } from '../../../services/auth.service';
import { DireccionService } from '../../../services/direccion.service';
import { PostalService } from '../../../services/postal.service';
import { TiendaService } from '../../../services/tienda.service';
import { UsuarioService } from '../../../services/usuario.service';
import { SolicitudService } from '../../../services/solicitud.service';

@Component({
  selector: 'app-revisar-pedido',
 imports: [
    HeaderComponent,
    CommonModule,
    RouterModule,
    ImagenPipe,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    PreciosDeliveryComponent
  ],
  templateUrl: './revisar-pedido.component.html',
  styleUrl: './revisar-pedido.component.scss'
})
export class RevisarPedidoComponent {

  // 💡 LA MAGIA: Capturamos el componente hijo usando la almohadilla del HTML
  @ViewChild('preciosComponent') preciosComponent!: PreciosDeliveryComponent;
  @ViewChild('direccionEditModal') direccionEditModal!: any;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('direccionEditModal') direccionModal!: any; // O el tipo de tu componente si lo tienes a mano
  
  public datosDireccionRecibidos: any = null;
  public totalGeneral: number = 0;


  bandejaListPedido: Producto[] = [];
  fechaHoy: string = new Date().toISOString().split('T')[0];
  randomNum: number = 0;
  isbandejaListPedido: boolean = false;

  tiendaSelected: any;
  tienda_moneda: any;

  tiendas: Tienda[] = [];
  identity: any;
  userId: any;
  pedido: any;
  usuario: any;
  public listaDeliveries: any[] = [];
  usaDelivery = false;
  public subtotalProductos: number = 0;
  public costoDeliveryAplicado: number = 0;

  direcciones: Direccion[] = [];
  direccionSelected!: Direccion;
  public data_direccion: any = {};
  public data_direccionLocal: any = {};

  public expressForm!: FormGroup;
  public direccionForm!: FormGroup;


  public whatsapp!: string;

  pedidoGuardado = false;
  pedidoaProcesar!: string;
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

  public activeLang = 'es';

  private tiendaService = inject(TiendaService);
  private solicitudService = inject(SolicitudService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private postalService = inject(PostalService);
  private _direccionService = inject(DireccionService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  private solitudSubscription!: Subscription;


  ngOnInit() {
    window.scrollTo(0, 0);
    this.identity = this.authService.getLocalStorage() as Usuario;
    if (this.identity) {
      this.userId = this.identity.uid;
      // this.getDireccionbyUser();
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
    this.solitudSubscription = this.solicitudService.bandejaListPedido$.subscribe(items => {
      this.bandejaListPedido = items;
      this.isbandejaListPedido = items.length > 0;
      // If cart becomes empty, navigate to home
      if (items.length === 0 && this.router.url.includes('/review-solicitud')) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {
    if (this.solitudSubscription) {
      this.solitudSubscription.unsubscribe();
    }
  }


  //tienda

  escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda = this.tiendaSelected.moneda;
        this.usaDelivery = this.tiendaSelected.usaDelivery;
      }
    });
  }
  total() {
    const total = this.bandejaListPedido.reduce((sum, item) =>
      sum + (item.precio_ahora * item.cantidad), 0
    );
    return total;
  }

  addItem(item: Producto, index: number) {
    // Use SolicitudService to add item - this will trigger the BehaviorSubject update
    this.solicitudService.addItem(item);
  }

  removeItem(item: Producto, index: number) {
    // Use SolicitudService to remove item - this will trigger the BehaviorSubject update
    // and notify all subscribers including MenuFooterComponent
    this.solicitudService.removeItem(item);
    if (this.bandejaListPedido.length === 0) {
      this.chekpedidoguardado();
    }
  }

  borrarPedido() {
    this.solicitudService.deleteSolicitud(this.pedido._id).subscribe((resp: any) => {
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
    const storedItems = localStorage.getItem('bandejaPedidoItems');
    if (storedItems) {
      this.bandejaListPedido = JSON.parse(storedItems);

    }
    if (this.bandejaListPedido.length > 0) {
      this.isbandejaListPedido = true;
    }

    this.bandejaListPedido;
    this.subtotal = 0;
    this.bandejaListPedido.forEach(element => {
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
    const storedItems = localStorage.getItem('bandejaPedidoItems');
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
    this.solicitudService.getSolicitudByUser(this.userId).subscribe((resp: any) => {
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




  // Método que se llama cuando cambia el select
  // onDeliveryMethodChange(): void {
  //   // 1. Capturamos el valor seleccionado directamente desde el Formic Reactivo
  //   const metodoSeleccionado = this.expressForm.get('tipoEntrega')?.value;

  //   console.log('Método de entrega cambiado a:', metodoSeleccionado);

  //   // 2. Filtro estricto: Solo si es igual a 'delivery' ejecutamos la lógica
  //   if (metodoSeleccionado === 'delivery') {
  //     // Aquí puedes ejecutar el validador de coordenadas o la alerta del GPS nativo
  //     this.getDeliveryStore();
  //   } else {
  //     // Opcional: Si eligen 'pickup', puedes limpiar los costos de envío o esconder el mapa
  //     // this.costoDeliveryCalculado = 0;
  //     // this.mensajeDelivery = '';
  //   }
  // }

  // getDeliveryStore(): void {

  //   this.postalService.getPostalesLocal(this.tiendaSelected._id).subscribe({
  //     next: (resp: any) => {
  //       // Guardamos la lista de tarifas que viene del backend
  //       this.listaDeliveries = Array.isArray(resp) ? resp : [];
  //       console.log(this.listaDeliveries)
  //     },
  //     error: (err) => console.error("Error al traer tarifas:", err)
  //   });
  // }


  
 

//   onChangeDireccion(event: Event) {
//     const target = event.target as HTMLSelectElement; 
    
//     // Buscamos la dirección seleccionada dentro de la lista del Padre
//     this.direccionSelected = this.direcciones.filter(method => method._id === target.value)[0]
    
//     // 🚀 LE MANDAMOS LAS COORDENADAS AL HIJO DE PRECIOS
//     if (this.direccionSelected && this.direccionSelected.latitud && this.direccionSelected.longitud) {
//       const lat = Number(this.direccionSelected.latitud);
//       const lng = Number(this.direccionSelected.longitud);
      
//       if (this.preciosComponent) {
//         // Forzamos al hijo de precios a ejecutar la fórmula Haversine con la dirección seleccionada
//         this.preciosComponent.procesarUbicacionYCalcularPrecio(lat, lng);
//       }
//     }

//     if (this.direccionSelected) {
//       this.get_direccion(this.direccionSelected);
//     }
// }

//   get_direccion(direccionSelected: any) {
//     this.data_direccion = direccionSelected._id;
//     this._direccionService.get_direccion(this.data_direccion).subscribe(
//       response => {
//         this.data_direccion = response;
        
//       }
//     );

//   }

//   getDireccionbyUser() {
//     this._direccionService.listarUsuario(this.userId).subscribe((resp: any) => {
//       this.direcciones = resp.direcciones;
//     })
//   }

//   despertarMapaHijo() {
//     // 🧠 Esperamos 400ms a que el off-canvas de Bootstrap termine de abrirse en la pantalla
//     setTimeout(() => {
//       if (this.direccionModal && typeof this.direccionModal.inicializarMapa === 'function') {
//         console.log('🗺️ Comunicando con el componente hijo: Despertando mapa...');
//         this.direccionModal.inicializarMapa();
//       }
//     }, 400);
//   }

//   dispararGpsDirecto(): void {
//     // 🚀 LA MAGIA: Despertamos la función nativa del GPS que vive dentro del modal,
//     // pero de forma invisible sin abrir la ventana gris en la pantalla.
//     if (this.direccionEditModal) {
//       console.log('Disparando satélites de forma directa desde el carrito...');

//       // Invocamos el método exacto que busca la latitud y longitud en tu modal hijo
//       this.direccionEditModal.useCurrentLocation();
//     }
//   }


  // Esta es la función que conectaremos al evento (onDireccionCapturada) del HTML del hijo

  // procesarDireccionHijo(event: any): void {
  //   console.log('📍 Coordenadas recibidas del modal express:', event);

  //   // 1. Guardamos el paquete en memoria para tu backend
  //   this.datosDireccionRecibidos = event;

  //   // 💡 EL TRUCO PARA EL BOTÓN: Extraemos el texto de la calle que escribió el hijo
  //   const textoCalle = event.direccionText || event.direccion || 'Ubicación GPS Capturada';

  //   // 2. Parcheamos el formulario principal para que Angular sepa que ya NO está vacío
  //   this.expressForm.patchValue({
  //     direccion: textoCalle
  //   });

  //   // 3. Despertamos al motor matemático de los precios si vienen coordenadas
  //   if (event?.latitud && event?.longitud && this.preciosComponent) {
  //     this.preciosComponent.procesarUbicacionYCalcularPrecio(event.latitud, event.longitud);
  //   }
  // }




  //proceso para registro express
  crearFormularioExpress() {
    this.expressForm = this.fb.group({
      // 💡 SOLUCIÓN: Envolvemos los dos validadores dentro de [ corchetes ] en la segunda posición
      first_name: ['', [Validators.required, Validators.minLength(3)]],

      telefono: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(15),
        Validators.pattern('^[0-9]+$')
      ]],
      // tipoEntrega: ['', Validators.required],
      // direccion: ['']
    });

    // Tu lógica de escucha de cambios (Se queda idéntica, está perfecta)
    // this.expressForm.get('tipoEntrega')?.valueChanges.subscribe(tipo => {
    //   const direccionControl = this.expressForm.get('direccion');
    //   if (tipo === 'pickup') {
    //     direccionControl?.clearValidators();
    //   } else {
    //     direccionControl?.setValidators([Validators.required]);
    //   }
    //   direccionControl?.updateValueAndValidity();
    // });
  }


  avanzarAlRegistroExpress() {
    // Si el usuario ya está logueado en tu app, saltamos directo al mapa o al envío
    // Si no, lo mandamos al paso 2 (formulario express de datos básicos)
    this.pasoActual = 2;
  }

    procesarClienteExpress() {
    // 🧠 EL POLICÍA INTELIGENTE: 
    // Si es modo WHATSAPP, el formulario DEBE ser válido (exige nombre, teléfono, etc.).
    // Si es modo POS_DIRECTO, dejamos pasar al cliente aunque el formulario esté incompleto o inválido.
    if (this.tiendaSelected.tipoFlujo !== 'POS_DIRECTO' && this.expressForm.invalid) {
      this.toastr.warning('Por favor, complete los campos obligatorios.', 'Formulario Incompleto');
      return;
    }

    const localId = this.tiendaSelected._id || '';

    // Valores por defecto por si el formulario está vacío en modo POS_DIRECTO
    const nombreForm = this.expressForm.value.first_name || 'Cliente POS';
    const telefonoForm = this.expressForm.value.telefono || '0000000000';

    // 1. Resolvemos la dirección de forma limpia
    // const direccionFinal = this.direccionSelected 
    //   ? (this.direccionSelected.direccion || this.direccionSelected)
    //   : (this.expressForm.value.tipoEntrega === 'delivery' ? 
    //       (this.datosDireccionRecibidos?.direccionText || this.datosDireccionRecibidos?.direccion || '') 
    //       : 'Retiro en tienda (Pickup)');

    // 2. Control de duplicados: Si ya está seleccionada una dirección existente, 
    // mandamos las coordenadas en '0,0' o null para que el backend NO cree otra.
    // let posicionGPS = '0,0';
    // if (this.expressForm.value.tipoEntrega === 'delivery' && !this.direccionSelected) {
    //     const lat = this.datosDireccionRecibidos?.latitud || 0;
    //     const lng = this.datosDireccionRecibidos?.longitud || 0;
    //     posicionGPS = `${lat},${lng}`;
    // }

    const payloadExpress = {
      first_name: nombreForm,
      telefono: telefonoForm,
      local: localId,
      // referencia: this.direccionSelected ? this.direccionSelected.referencia : (this.datosDireccionRecibidos?.referencia || 'Sin referencia'),
      // nombres_completos: this.direccionSelected ? this.direccionSelected.nombres_completos : (this.datosDireccionRecibidos?.nombres_completos || nombreForm),
      // direccion: direccionFinal,
      // deliveryPosition: posicionGPS, // 🚀 '0,0' si ya existía, evitando el duplicado en la DB
    };

    // 1. Registramos al cliente express en segundo plano de forma invisible
    this.usuarioService.crearClienteExpress(payloadExpress).subscribe({
      next: (resp: any) => {
        this.toastr.success('Identificado correctamente', '¡Excelente!');

        const uidDirecto = resp.uid || resp.usuario?._id || resp.usuario?.uid || resp.id;
        // 💡 CAPTURAMOS EL ID DE LA DIRECCIÓN QUE MANDÓ EL BACKEND
        const direccionIdDirecto = resp.direccionId || null;

        // 🧠 EVALUAMOS EL DETECTOR DE FLUJO INTERNACIONAL
        if (this.tiendaSelected.tipoFlujo === 'POS_DIRECTO') {
          // =========================================================================
          // 🇺🇸 CARRIL A: MODO POS DIRECTO (Internacional / Autónomo)
          // =========================================================================
          console.log('📦 Checkout POS activado. Mudando el flujo al componente Pay.');
          
          // En modo POS enviamos el UID directo. La dirección va null si no aplica.
          this.guardarPedido(uidDirecto, direccionIdDirecto);
          return;

        } else {
          // =========================================================================
          // 🇻🇪 CARRIL B: MODO WHATSAPP (Híbrido tradicional de Venezuela)
          // =========================================================================
          this.guardarPedido(uidDirecto, direccionIdDirecto);
          // SALVAVIDAS: Solo borramos el carrito si la URL de WhatsApp se calculó con éxito
          if (this.urlWhatsApp && this.urlWhatsApp !== '') {
            localStorage.removeItem('bandejaItems');
            this.solicitudService.clearCart();
          }
        }
      },
      error: (err) => {
        this.toastr.error('Error', err.error?.msg || 'Error al procesar el cliente');
      }
    });
  }



  // Recibimos el userId directamente para asegurar que no viaje como undefined
  guardarPedido(userId?: string, direccionId?: string) {
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

    // 🧠 EVOLUCIÓN INTERNACIONAL: Forzamos el estatus 'NEW' para tu ERP si es POS_DIRECTO, si no mantiene 'PENDING'
    const estatusSeguro = this.tiendaSelected.tipoFlujo === 'POS_DIRECTO' ? 'NEW' : 'PENDING';

    const esDelivery = this.expressForm.value.tipoEntrega === 'delivery';

    const data = {
      user: uid,
      tienda: this.tiendaSelected._id,
      pedidoList: this.bandejaListPedido,
      status: estatusSeguro,
      
      // 🛵 INYECCIÓN DE DELIVERY COMPATIBLE: Captura los datos del formulario express
      // delivery: esDelivery,
      
      // 💡 ENGRANAJE LOGÍSTICO FINAL:
      // direccion: esDelivery ? direccionId : null,
      // total: esDelivery ? this.totalGeneral : this.total(),
      
      // 🚀 AQUÍ SE SOLUCIONA EL CERO DEFINITIVAMENTE:
      // Leemos la variable en tiempo real desde el componente hijo usando la referencia del HTML
      // costoDelivery: esDelivery ? Number(this.preciosComponent?.costoDeliveryAplicado || 0) : 0
    };


    this.solicitudService.createSolicitud(data).subscribe({
      next: (resp: any) => {
        this.pedidoGuardado = true;
        this.pedidoaProcesar = resp.pedido._id;
        // console.log('pedido guardado', resp)
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
    if (!this.identity || !this.bandejaListPedido || this.bandejaListPedido.length === 0) {
      return '';
    }

    // SALVAVIDAS: Si expressForm no existe o no tiene datos, usamos datos de la sesión para que NO se rompa
    const formValues = this.expressForm?.value || {};
    const nombreCliente = formValues.first_name || this.identity.first_name || 'Cliente';
    const tipoEntrega = formValues.tipoEntrega || 'No especificado';
    const telefonoCliente = formValues.telefono || this.identity.telefono || 'No registrado';
    
    const isEn = this.activeLang === 'en';

    let message = `*${isEn ? 'New Order from Zlipmenu App' : 'Nuevo Pedido desde App Zlipmenu'} #${this.randomNum}*\n\n`;
    message += `*${isEn ? 'Customer' : 'Cliente'}:* ${nombreCliente}\n`;
    // message += `*${isEn ? 'Delivery Type' : 'Tipo Entrega'}:* ${tipoEntrega}\n`;
    message += `*${isEn ? 'Phone' : 'Teléfono'}:* ${telefonoCliente}\n\n`;
    message += `*${isEn ? 'Order Details' : 'Detalles del Pedido'}:*\n`;
    message += `─────────────────────\n`;

    

    this.bandejaListPedido.forEach((item: any) => {
      const itemTotal = (item.precio_ahora * item.cantidad).toFixed(2);
      
      // 💡 SOLUCIÓN MULTIDIOMA Y ANTICAÍDAS: Usamos 'isEn' y el operador '?' de navegación segura
      const nombreProducto = isEn 
        ? (item.titulo?.en || item.titulo?.es || item.titulo || 'Producto')
        : (item.titulo?.es || item.titulo?.en || item.titulo || 'Producto');

      message += `• *${nombreProducto}*\n`;

      // Evitamos comparar contra propiedades undefined de los items
      if (item.nombre_selector && item.nombre_selector !== 'unico') {
        message += `  ↳ ${item.selector_elegido}\n`;
      }

      message += `  *${isEn ? 'Quant' : 'Cant'}:* ${item.cantidad} x ${item.precio_ahora.toFixed(2)} = $${itemTotal}\n\n`;
    });

    message += `─────────────────────\n`;

    // 💡 1. CALCULAMOS LAS VARIABLES FINANCIERAS PARA EL MENSAJE
    const subtotalComida = this.total(); // Tus $21.00 netos de los productos
    // const esDelivery = tipoEntrega === 'delivery';
    
    // Si es delivery jala tus $5.00, si es pickup se queda en $0.00
    // const montoDelivery = esDelivery ? (this.totalGeneral - subtotalComida) : 0; 
    // const totalFinalMoneda = esDelivery ? this.totalGeneral : subtotalComida;

    // 💡 2. INYECTAMOS EL DESGLOSE DE COBRO TRANSPARENTE EN EL TEXTO DE WHATSAPP
    message += `*${isEn ? 'Subtotal' : 'Subtotal Comida'}:* $${subtotalComida.toFixed(2)}\n`;
    
    // if (esDelivery) {
    //   message += `*${isEn ? 'Delivery Fee' : 'Costo de Envío'}:* $${montoDelivery.toFixed(2)}\n`;
    // }
    
    message += `─────────────────────\n`;
    
    // 💡 3. EL TOTAL REAL ACTUALIZADO CON EL DELIVERY INCLUIDO ($26.00)
    // message += `*TOTAL A PAGAR:* ${this.tienda_moneda} ${totalFinalMoneda.toFixed(2)}\n\n`;
    message += `*${isEn ? 'Please confirm availability and payment method' : 'Por favor confirmar disponibilidad y método de pago'}:*`;

    return encodeURIComponent(message);
}




  actualizarUrlWhatsApp(): void {
    if (!this.tiendaSelected?.telefono) return;

    // 1. Deja solo los números puros (elimina espacios, guiones y el signo +)
    let phone = this.tiendaSelected.telefono.replace(/\D/g, '');
    if (!phone) return;

    // 2. LÓGICA INTELIGENTE DE DETECCIÓN:
    if (phone.startsWith('0')) {
      // Si empieza con 0 (ej: 04121234567 o prefijos locales de otros países),
      // asumimos que es Venezuela, quitamos el 0 y ponemos el 58.
      phone = '58' + phone.substring(1);
    }
    else if (phone.length === 10 && (phone.startsWith('412') || phone.startsWith('414') || phone.startsWith('424') || phone.startsWith('416') || phone.startsWith('426'))) {
      // Si el usuario escribió el número de Venezuela directo sin el 0 (ej: 4121234567 tiene 10 dígitos)
      // le inyectamos el 58 automáticamente.
      phone = '58' + phone;
    }
    // Si no cumple lo anterior y tiene más de 10 dígitos (ej: 573001234567 o 13051234567),
    // significa que el usuario ya escribió su código internacional por su cuenta. Lo dejamos pasar intacto.

    const message = this.getWhatsAppMessage();

    if (message && phone) {
      this.urlWhatsApp = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
    } else {
      this.urlWhatsApp = '';
    }
  }













}
