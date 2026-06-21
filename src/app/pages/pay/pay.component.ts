import { Component, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { TiposdepagoService } from '../../services/tiposdepago.service';
import { PaymentMethod } from '../../models/paymenthmethod.model';
import { TransferenciasService } from '../../services/transferencias.service';
import { CarritoService } from '../../services/carrito.service';
import { TiendaService } from '../../services/tienda.service';
import { VentaService } from '../../services/venta.service';
import { ProductoService } from '../../services/product.service';
import { Tienda } from '../../models/tienda.model';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { PedidomenuService } from '../../services/pedidomenu.service';
import { Pedido } from '../../models/pedido.model';
import { DireccionService } from '../../services/direccion.service';
import { Direccion } from '../../models/direccion.model';
import { PagoEfectivoService } from '../../services/pago-efectivo.service';
import { ICreateOrderRequest, IPayPalConfig, NgxPayPalModule } from 'ngx-paypal';
import { Paypal } from '../../models/paypal.model';
import { PaypalService } from '../../services/paypal.service';
import { FileUploadService } from '../../services/file-upload.service';
import { ToastrService } from 'ngx-toastr';
import { TasadollarbcvService } from '../../services/tasadollarbcv.service';
import { TasaeurobcvService } from '../../services/tasaeurobcv.service';
import { PagosFilterPipe } from '../../pipes/pagos-filter.pipe';
import { AuthService } from '../../services/auth.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalCrearDireccionComponent } from '../../components/modal-crear-direccion/modal-crear-direccion.component';
import { PreciosDeliveryComponent } from '../../components/precios-delivery/precios-delivery.component';
import { PostalService } from '../../services/postal.service';
declare var $: any;

declare var bootstrap: any;

@Component({
  selector: 'app-pay',
  imports: [
    HeaderComponent,
    CommonModule, RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe,
    NgxPayPalModule,
    PagosFilterPipe,
    LoadingComponent,
    TranslatePipe,
    ModalCrearDireccionComponent,
    PreciosDeliveryComponent,
  ],
  templateUrl: './pay.component.html',
  styleUrl: './pay.component.scss'
})
export class PayComponent {

  @ViewChild('direccionEditModal') direccionModal!: any; // O el tipo de tu componente si lo tienes a mano
  @ViewChild('preciosComponent') preciosComponent!: PreciosDeliveryComponent;
  @ViewChild('direccionEditModal') direccionEditModal!: any;

  bandejaList: Producto[] = [];
  fechaHoy: string = new Date().toISOString().split('T')[0];
  randomNum: number = 0;
  isbandejaList: boolean = false;
  identitys: boolean = false;
  iva: number = 12;
  public identity!: Usuario;
  public localId!: string;
  public userId!: any;
  paypal: boolean = false;
  //DATA
  public radio_postal: any;
  public medio_postal: any = {};
  public data_cupon: any;
  public id_direccion = '';
  public direccion: any;
  public data_direccion: any = {};
  public data_detalle: Array<any> = [];
  public data_venta: any = {};
  public info_cupon_string = '';
  public error_stock = false;
  public date_string: any;
  public carrito: Array<any> = [];
  public subtotal: any = 0;
  public cupon: any;
  public msm_error_cupon = false;
  public msm_success_cupon = false;
  public precio_envio: any;
  public msm_error = '';
  // public whatsapp = '+584241874370';
  public whatsapp!: string;

  // public socket = io(environment.soketServer);
  public data_direccionLocal: any = {};
  public tienda_moneda: any;


  public no_direccion = 'no necesita direccion';

  public payPalConfig?: IPayPalConfig;
  public payPalCardConfig?: IPayPalConfig;
  cartItems!: any[];

  public url!: string;
  public postales: any;

  pedido!: Pedido;
  pedidos!: Producto[];
  totalAmount: number = 0;
  delivery!: string;
  deliveryAddres!: string;
  tienda!: Tienda;
  tiendas: Tienda[] = [];
  tiendaSelected: any;
  selectedMethod: string = 'Selecciona un método de pago';
  public clienteSeleccionado: any;

  habilitacionFormTransferencia: boolean = false;
  habilitacionFormCheque: boolean = false;
  habilitacionFormEfectivo: boolean = false;

  selectedDelivery: string = 'Deseas Delivery?';
  habilitacionAddresLocal: boolean = false;
  habilitacionFormDelivery: boolean = false;
  loading: boolean = false;

  direcciones: Direccion[] = [];
  direccionSelected!: Direccion;
  efectivo: string = 'efectivo';
  paypalinfo?: Paypal;

  public listaDeliveries: any[] = [];
  public totalGeneral: number = 0;
  public costoDeliveryAplicado: number = 0;
  cargandoGps: boolean = false;



  paymentMethods: PaymentMethod[] = []; //array metodos de pago para transferencia (dolares, bolivares, movil)
  paymentSelected!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia
  paymentMethodinfo!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia

  imagePreview = signal<string | null>(null);
  public selectedFile: File | null = null;
  tasadollar = signal(0);
  tasaeuro = signal(0);

  formTransferencia = new FormGroup({
    metodo_pago: new FormControl(this.paymentMethodinfo, Validators.required),
    referencia: new FormControl('', Validators.required),
    paymentday: new FormControl(new Date(), Validators.required)
  });

  formDelivery = new FormGroup({
    delivery: new FormControl('', Validators.required),
    deliveryAddres: new FormControl('', Validators.required),
  });


  formEfectivo = new FormGroup({
    paymentday: new FormControl('', Validators.required)
  });

  constructor(
    private _trasferencias: TransferenciasService,
    private _efectivo: PagoEfectivoService,
    private _tipoPagosService: TiposdepagoService,
    private _carritoService: CarritoService,
    private tiendaService: TiendaService,
    private pedidosService: PedidomenuService,
    private _direccionService: DireccionService,
    private _ventaService: VentaService,
    private _productoService: ProductoService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _paypalService: PaypalService,
    private fileUploadService: FileUploadService,
    private toastr: ToastrService,
    private tasaDollarService: TasadollarbcvService,
    private tasaEuroService: TasaeurobcvService,
    private authService: AuthService,
    private postalService: PostalService,
    public translate: TranslateService,
  ) {
    window.scrollTo(0, 0);
    // obtenemos el cliente del localstorage
    const cliente = localStorage.getItem('cliente');
    // Si el cliente existe, lo parseamos de JSON a un objeto
    if (cliente) {
      this.clienteSeleccionado = JSON.parse(cliente);
    } else {
      this.clienteSeleccionado = null; // O maneja el caso en que no hay cliente
    }


  }
  ngOnInit() {
    // 1. Rescatamos la identidad del usuario (Tradicional o Express)
    this.identity = this.authService.getLocalStorage() as Usuario;
    this.userId = this.identity?.uid || localStorage.getItem('uid_checkout_temporal') || '';

    // 2. OBLIGATORIO: Levantamos la tienda primero (Sincrónica/Local)
    this.asegurarTiendaActiva();

    // 3. Traemos las direcciones del usuario
    if (this.userId) {
      this.getDireccionbyUser();
    }

    // 4. Ahora que la tienda existe con seguridad en memoria, evaluamos el flujo de la ruta
    this._activatedRoute.params.subscribe(({ id }) => {
      if (this.tiendaSelected && this.tiendaSelected.tipoFlujo === 'POS_DIRECTO') {
        console.log('✅ Modo POS_DIRECTO validado con éxito. Armando flujo local.');
        this.loadPedido(id); // O la función híbrida que adaptamos
      } else {
        console.log('🇻🇪 Modo Tradicional validado. Buscando pedido en BD.');
        this.loadPedido(id);
      }
    });


  }


  asegurarTiendaActiva() {
    // Primero intentamos la vía tradicional (tu método de escucha actual)
    this.escucharTiendaActiva();

    // Si tras escuchar, el objeto de la tienda en memoria está vacío (por un F5), lo rescatamos del localStorage
    if (!this.tiendaSelected || !this.tiendaSelected._id) {
      const tiendaGuardada = localStorage.getItem('tienda_checkout_temporal');
      if (tiendaGuardada) {
        this.tiendaSelected = JSON.parse(tiendaGuardada);
        console.log('🏪 Tienda restaurada con éxito desde persistencia:', this.tiendaSelected);
      }
    }
  }



  loadPedido(id: string) {
    this.loading = true;

    // 🚀 LOGICA UNIFICADA: Tanto WhatsApp como POS_DIRECTO consultan el pedido real en la BD
    this.pedidosService.getById(id).subscribe({
      next: (resp: any) => {
        // Guardamos el objeto completo del pedido que devolvió MongoDB
        this.pedido = resp;
        console.log('📦 Pedido real cargado en la vista de pagos:', this.pedido);

        // Extraemos el listado de platos de forma segura
        this.pedidos = resp.pedidoList || [];

        // Inicializamos acumuladores de la vista
        this.subtotal = 0;
        this.data_detalle = [];

        // Procesamos los totales financieros de forma exacta
        this.totalAmount = this.pedidos.reduce((sum, item) =>
          sum + (item.precio_ahora * item.cantidad), 0
        );

        this.pedidos.forEach(element => {
          this.subtotal = Math.round(this.subtotal + (element.precio_ahora * element.cantidad));
          this.data_detalle.push({
            producto: element,
            cantidad: element.cantidad,
            precio: Math.round(element.precio_ahora),
            color: element.color,
            selector: element.nombre_selector
          });
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando el pedido desde el servidor:', err);
        this.toastr.error('No se pudo recuperar el resumen de la orden.');
        this.loading = false;
      }
    });
  }





  escucharTiendaActiva() {
    // 1. Nos suscribimos al observable de la forma tradicional
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.inicializarDatosTienda(tienda);
      }
    });

    // 2. 🧠 RESPALDO ANTIFALLOS (F5 / POS_DIRECTO):
    // Si el observable no ha emitido nada o la variable sigue vacía, la rescatamos del localStorage
    if (!this.tiendaSelected || !this.tiendaSelected._id) {
      const tiendaGuardada = localStorage.getItem('tienda_checkout_temporal');
      if (tiendaGuardada) {
        const tiendaParseada = JSON.parse(tiendaGuardada);
        console.log('🏪 Tienda rescatada del localStorage para inicializar pagos:', tiendaParseada);
        this.inicializarDatosTienda(tiendaParseada);
      }
    }
  }

  inicializarDatosTienda(tienda: any) {
    this.tiendaSelected = tienda;
    this.tienda_moneda = this.tiendaSelected.moneda;

    // Cargamos los métodos de pago y configuraciones de la tienda pasándole el ID
    this.getTiposdePagoByLocal();
    this.getPaypalByTienda();

    // Evaluamos las tasas de cambio según la moneda internacional configurada
    if (this.tienda_moneda === 'USD') {
      this.getTasadelDia();
    } else if (this.tienda_moneda === 'EUR') {
      this.getTasaeuro();
    }
  }

  getTasadelDia() {
    this.tasaDollarService.getUltimaTasa().subscribe((resp: any) => {
      this.tasadollar.set(resp.precio_dia);
    })
  }

  getTasaeuro() {
    this.tasaEuroService.getUltimaTasa().subscribe((resp: any) => {
      this.tasaeuro.set(resp.precio_dia);
    })
  }



  getPaypalByTienda() {
    this._paypalService.getPaypalByTiendaId(this.tiendaSelected._id).subscribe((paypals: any[]) => {
      if (paypals.length > 0) {
        this.paypalinfo = paypals[0];
        if (!this.paypalinfo?.clientIdPaypal || this.paypalinfo.clientIdPaypal.trim() === '') {
          // console.error('Invalid/empty PayPal clientIdPaypal from backend');
          // this.toastr.error('Configuración de PayPal inválida');
          return;
        }
        // console.log('PayPal config loaded:', this.paypalinfo!.clientIdPaypal);
        // Init PayPal with service data only
        this.initPayPalConfig();
      } else {
        console.warn('No PayPal config for tienda');
        // this.toastr.warning('PayPal no configurado');
        this.paypalinfo = undefined;
      }
    });
  }



  total() {
    if (!this.pedidos) return 0;
    const total = this.pedidos.reduce((sum, item) =>
      sum + item.precio_ahora * item.cantidad, 0
    );
    return total;
  }


  getTiposdePagoByLocal() {
    this._tipoPagosService.getPaymentMethodByTiendaId(this.tiendaSelected._id).subscribe(paymentMethods => {

      this.paymentMethods = paymentMethods;
      // console.log(this.tiposdepagos);
    })
  }



  // metodo para el cambio del select 'tipo de transferencia'
  onChangePayment(event: Event) {
    const target = event.target as HTMLSelectElement; //obtengo el valor
    // console.log(target.value)

    // guardo el metodo seleccionado en la variable de clase paymentSelected
    this.paymentSelected = this.paymentMethods.filter(method => method._id === target.value)[0]
    // console.log(this.paymentSelected)
  }

  // Método que se llama cuando cambia el select
  onPaymentMethodChange(event: any) {
    this.selectedMethod = event.target.value;
    // console.log(this.selectedMethod)
    this.renderPayPalButton(); // Renderiza el botón de nuevo según la opción seleccionada
  }

  getPaymentMbyName(selectedMethod: string) {
    this.selectedMethod = selectedMethod
    this._tipoPagosService.getPaymentMethodByName(selectedMethod).subscribe((resp: any) => {
      this.paymentMethodinfo = resp[0];
      console.log(this.paymentMethodinfo);
      // Update the form control value with the selected payment method info
      this.formTransferencia.get('metodo_pago')?.setValue(this.paymentMethodinfo);
      // this.formTransferencia.get('name_person')?.setValue(this.identity.first_name + '' + this.identity.last_name,);
    })
  }


  // Método que se llama cuando cambia el select
  onDeliveryMethodChange(event: any) {
    this.selectedDelivery = event.target.value;
    this.renderDelivery(); // Renderiza el botón de nuevo según la opción seleccionada
  }


  private renderDelivery() {
    // Primero, limpiar el contenedor anterior
    // this.paypalElement.nativeElement.innerHTML = '';

    if (this.selectedDelivery === 'Delivery') {
      // deshabilitar el formulario de pago con transferencia
      this.habilitacionAddresLocal = false;
      this.habilitacionFormDelivery = true;
      // Cargar el botón de PayPal con las opciones seleccionadas
      // this.initPayPalConfig();
      this.getDeliveryStore();
    }
    else if (this.selectedDelivery === 'Pickup') {
      // transferencia bancaria => abrir formulario (en un futuro un modal con formulario)
      this.habilitacionAddresLocal = true;
      this.habilitacionFormDelivery = false;
    }
    else {
      this.habilitacionAddresLocal = false;
      this.habilitacionFormDelivery = false;
    }

  }

  getDeliveryStore(): void {

    this.postalService.getPostalesLocal(this.tiendaSelected._id).subscribe({
      next: (resp: any) => {
        // Guardamos la lista de tarifas que viene del backend
        this.listaDeliveries = Array.isArray(resp) ? resp : [];
        console.log(this.listaDeliveries)
      },
      error: (err) => console.error("Error al traer tarifas:", err)
    });
  }


  dispararGpsDirecto(): void {
    // 🛑 ESCUDO ANTI-BUCLE: Si ya se está ejecutando un cálculo, bloqueamos el paso
    if (this.cargandoGps) {
      console.log('🛑 GPS bloqueado para evitar bucle infinito en el renderizado.');
      return;
    }

    if (this.direccionEditModal) {
      // Encendemos el candado
      this.cargandoGps = true;
      console.log('📡 Disparando satélites de forma directa desde el carrito POS...');

      // 1. Ejecutamos la función nativa que busca la ubicación
      this.direccionEditModal.useCurrentLocation();

      // 2. Esperamos el segundo para que Google responda el Geocoding
      setTimeout(() => {
        const coords = this.direccionEditModal.selectedCoords;

        if (coords && coords.lat && coords.lng) {
          const lat = Number(coords.lat);
          const lng = Number(coords.lng);

          console.log(`🎯 Coordenadas recuperadas con éxito: Lat ${lat}, Lng ${lng}`);

          if (this.preciosComponent) {
            // 3. Forzamos al Hijo de Precios a calcular la tarifa
            this.preciosComponent.procesarUbicacionYCalcularPrecio(lat, lng);
            console.log('⚡ Módulo financiero actualizado.');
          }
        }

        // 🔓 Apagamos el candado un momento después para permitir un clic manual futuro si el cliente se mueve
        setTimeout(() => {
          this.cargandoGps = false;
        }, 2000); // 2 segundos de inmunidad total

      }, 1000);
    }
  }

  despertarMapaHijo() {
    // 🧠 Esperamos 400ms a que el off-canvas de Bootstrap termine de abrirse en la pantalla
    setTimeout(() => {
      if (this.direccionModal && typeof this.direccionModal.inicializarMapa === 'function') {
        console.log('🗺️ Comunicando con el componente hijo: Despertando mapa...');
        this.direccionModal.inicializarMapa();
      }
    }, 400);
  }

  // metodo para el cambio del select 'tipo de transferencia'
  onChangeDireccion(event: Event) {
    const target = event.target as HTMLSelectElement; //obtengo el valor
    // guardo el metodo seleccionado en la variable de clase direccionSelected
    this.direccionSelected = this.direcciones.filter(method => method._id === target.value)[0]
    this.get_direccion(this.direccionSelected)
  }

  get_direccion(direccionSelected: any) {
    this.data_direccion = direccionSelected._id;
    this._direccionService.get_direccion(this.data_direccion).subscribe(
      response => {
        this.data_direccion = response;
        console.log(this.data_direccion)
      }
    );

  }



  getDireccionbyUser() {
    this._direccionService.listarUsuario(this.userId).subscribe((resp: any) => {
      this.direcciones = resp.direcciones;
    })
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }



  sendFormTransfer() {
    // 1. Validaciones del formulario de pago (banco, referencia, etc.)
    if (!this.formTransferencia.valid) {
      this.formTransferencia.markAllAsTouched();
      return;
    }

    this.loading = true;


    // Tu flujo de siempre: Usa directamente this.pedido._id porque ya existe con total seguridad
    this.fileUploadService.actualizarFoto(this.selectedFile!, 'transferencias', this.pedido._id)
      .then(imgUrl => {

        // Tu payload original fiel a tu esquema usando tu variable de siempre
        const data = {
          local: this.tiendaSelected._id,
          user: this.identity?.uid,
          name_person: this.identity?.first_name || 'Cliente',
          phone: this.identity?.telefono || 'N/A',
          amount: this.totalAmount,
          referencia: this.formTransferencia.value.referencia,
          bankName: this.paymentSelected.bankName,
          pedido: this.pedido._id, // 🚨 Tu campo original directo de memoria
          tasa: this.tienda_moneda === 'USD'
            ? (this.tasadollar() || 0)
            : (this.tienda_moneda === 'EUR' ? (this.tasaeuro() || 0) : 1),
          img: imgUrl,
          ...this.formTransferencia.value
        };

        // Guardamos la transferencia en tu servicio
        this._trasferencias.createTransfer(data).subscribe({
          next: () => {
            this.toastr.success('¡Transferencia registrada con éxito!');
            this.onItemRemoved();
            this._router.navigate(['/mis-pagos']);
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            this.toastr.error('Error al registrar la transacción en el servidor');
          }
        });
      })
      .catch(err => {
        this.loading = false;
        this.toastr.error('Error al subir el comprobante de transferencia');
      });
  }



  // 📦 FUNCIÓN REUTILIZABLE PARA LA SUBIDA DE FOTO Y REGISTRO DE TRANSFERENCIA
  procesarSubidaYRegistroPago(solicitudId: string) {
    this.fileUploadService.actualizarFoto(this.selectedFile!, 'transferencias', solicitudId)
      .then(imgUrl => {

        // CONSTRUCCIÓN DEL PAYLOAD FIEL A TU ESQUEMA REAL DE MONGO
        const data = {
          local: this.tiendaSelected._id,
          user: this.userId, // Usamos la variable unificada (identity.uid o temporal)
          name_person: this.identity?.first_name || 'Cliente Express',
          phone: this.identity?.telefono || 'N/A',
          amount: this.totalAmount,
          referencia: this.formTransferencia.value.referencia,
          bankName: this.paymentSelected.bankName,
          pedido: solicitudId, // 🚨 Vinculamos de forma exacta al ID real del pedido
          tasa: this.tienda_moneda === 'USD'
            ? (this.tasadollar() || 0)
            : (this.tienda_moneda === 'EUR' ? (this.tasaeuro() || 0) : 1),
          img: imgUrl,
          ...this.formTransferencia.value
        };

        this._trasferencias.createTransfer(data).subscribe({
          next: () => {
            this.toastr.success('¡Transferencia registrada con éxito!');

            // Limpieza de persistencias locales si es POS_DIRECTO
            if (this.tiendaSelected?.tipoFlujo === 'POS_DIRECTO') {
              localStorage.removeItem('uid_checkout_temporal');
              localStorage.removeItem('bandejaItems');
            }

            this.onItemRemoved();
            this._router.navigate(['/mis-pagos']);
          },
          error: (err) => {
            this.loading = false;
            this.toastr.error('Error al registrar la transacción en el servidor');
          }
        });
      })
      .catch(err => {
        this.loading = false;
        this.toastr.error('Error al registrar la transferencia');
      });
  }


  sendFormEfectivo() {

    if (this.formEfectivo.valid) {

      const data = {
        localId: this.tiendaSelected._id,
        user: this.identity.uid,
        name_person: this.identity.first_name + this.identity.last_name,
        phone: this.identity.telefono,
        amount: this.totalAmount,
        ...this.formEfectivo.value
      }

      // llamo al servicio
      this._efectivo.registro(data).subscribe(resultado => {
        // console.log('resultado: ',resultado);
        // this.verify_dataComplete(Number(this.formEfectivo.value.amount));
        this.verify_dataComplete(Number(this.totalAmount));
        if (resultado.ok || resultado.status === 200) {
          // transferencia registrada con exito
          this.toastr.success('Pago registrada con exito');
          this.onItemRemoved();
          this._router.navigate(['/my-account/ordenes']);
        }
        else {
          // error al registar la transferencia
          this.toastr.error('Error al registrar el Pago');
        }
      });
    }
  }


  remove_carrito() {
    this.carrito.forEach((element, index) => {
      this._carritoService.remove_carrito(element._id).subscribe(
        (response: any) => {
          this.listar_carrito();
          this.onItemRemoved();
        },
        error => {
          console.log(error);
        }
      );
    });


  }

  onItemRemoved() {
    localStorage.removeItem('bandejaItems');
    this.saveBandejaListToLocalStorage();
    this.ngOnInit();
  }

  saveBandejaListToLocalStorage() {
    try {
      localStorage.setItem('bandejaItems', JSON.stringify(this.bandejaList));
    } catch (e) {
      console.error('Error saving bandejaList to localStorage', e);
    }
  }

  listar_carrito() {
    this._carritoService.preview_carrito(this.identity.uid ?? '').subscribe(
      (response: any) => {
        this.carrito = response;
        this.subtotal = 0;
        this.carrito.forEach(element => {
          this.subtotal = Math.round(this.subtotal + (element.precio * element.cantidad));
          this.data_detalle.push({
            producto: element,
            cantidad: element.cantidad,
            precio: Math.round(element.precio),
            color: element.color,
            selector: element.selector
          })
          // console.log(this.carrito);

        });
        this.subtotal = Math.round(this.subtotal + parseInt(this.precio_envio));

      },
      error => {
        console.log(error);

      }
    );
  }





  verify_dataComplete(total_pagado: number) {
    // 1. Capturamos la dirección del select actual
    const direccionSeleccionadaId = this.formDelivery.get('deliveryAddres')?.value;

    if (direccionSeleccionadaId && direccionSeleccionadaId.trim() !== '') {
      this.msm_error = '';

      // Buscamos el objeto completo de la dirección en tu array para llenar el payload viejo
      const direccionCompleta = this.direcciones.find(d => d._id === direccionSeleccionadaId);

      if (this.data_cupon) {
        if (this.data_cupon.categoria) {
          this.info_cupon_string = this.data_cupon.descuento + '% de descuento en ' + this.data_cupon.categoria.nombre;
        } else if (this.data_cupon.subcategoria) {
          this.info_cupon_string = this.data_cupon.descuento + '% de descuento en ' + this.data_cupon.subcategoria;
        }
      }

      var fecha = new Date();
      var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Deciembre"];

      // Blindamos los días postales por si no existen en esta tienda
      const diasEnvio = this.medio_postal?.dias ? parseInt(this.medio_postal.dias) : 0;
      fecha.setDate(fecha.getDate() + diasEnvio);
      this.date_string = fecha.getDate() + ' de ' + months[fecha.getMonth()] + ' del ' + fecha.getFullYear();

      // CONSTRUCCIÓN DEL PAYLOAD HÍBRIDO (Sirve para Express y Tradicional)
      this.data_venta = {
        user: this.userId, // 🚨 AJUSTE: Usa el ID unificado (Express o tradicional)
        local: this.tiendaSelected._id,
        total_pagado: total_pagado,
        codigo_cupon: this.cupon || '',
        info_cupon: this.info_cupon_string || '',
        idtransaccion: null,
        metodo_pago: this.selectedMethod || 'Transferencia',

        tipo_envio: this.selectedDelivery || 'SI',
        precio_envio: "0",
        tiempo_estimado: this.fechaHoy || new Date(),

        // Mapeamos los datos extraídos del objeto de la dirección del select
        direccion: direccionCompleta?.direccion || 'N/A',
        destinatario: direccionCompleta?.nombres_completos || this.identity?.first_name || 'Cliente Express',
        detalles: this.data_detalle, // 🍕 ¡Aquí van tus pizzas con sus precios!
        referencia: direccionCompleta?.referencia || '',
        pais: this.tiendaSelected?.pais || 'Venezuela',
        ciudad: direccionCompleta?.ciudad || '',
        zip: direccionCompleta?.zip || '',
      }

      console.log('📦 Data Venta unificada lista para guardarse:', this.data_venta);

      // Ejecutas tu guardado original
      this.saveVenta();

    } else {
      this.toastr.warning("Seleccione una dirección de envío.", "Requerido");
      this.msm_error = "Seleccione una dirección de envío.";
    }
  }


  saveVenta() {
    this._ventaService.registro(this.data_venta).subscribe({
      next: (response: any) => {
        console.log('✅ Venta registrada con éxito en el backend:', response);

        // 🚨 EXTRAEMOS EL ID REAL DE LA VENTA (Ajusta si tu backend lo devuelve en response._id o response.id)
        const idVentaReal = response._id || response.data?._id || response.id;

        // 1. Procesamos la actualización de estadísticas y stock en segundo plano
        this.data_venta.detalles.forEach((element: { producto: { _id: any; }; cantidad: any; }) => {
          this._productoService.aumentar_ventas(element.producto._id).subscribe({
            error: (err) => console.error('Error al aumentar ventas:', err)
          });

          this._productoService.reducir_stock(element.producto._id, element.cantidad).subscribe({
            next: () => {
              // Solo limpiamos los carritos de la vista sin romper el estado actual
              this.listar_carrito();
            },
            error: (err) => console.error('Error al reducir stock:', err)
          });
        });

        // =========================================================================
        // 🇺🇸 CONDICIONAL PARA EL CARRIL A: MODO POS DIRECTO (Internacional)
        // =========================================================================
        if (this.tiendaSelected?.tipoFlujo === 'POS_DIRECTO') {
          console.log('📸 Subiendo el comprobante bancario para la venta:', idVentaReal);

          // Llamamos directamente a la subida de tu foto usando el ID real que nos dio el backend
          this.fileUploadService.actualizarFoto(this.selectedFile!, 'transferencias', idVentaReal)
            .then(imgUrl => {

              // Construimos el payload de la transferencia amarrado al ID real de la venta
              const dataTransferencia = {
                local: this.tiendaSelected._id,
                user: this.userId,
                name_person: this.identity?.first_name || 'Cliente Express',
                phone: this.identity?.telefono || 'N/A',
                amount: this.totalAmount,
                referencia: this.formTransferencia.value.referencia,
                bankName: this.paymentSelected.bankName,
                pedido: idVentaReal, // 🚨 Vinculado al ObjectId limpio como String puro
                tasa: this.tienda_moneda === 'USD'
                  ? (this.tasadollar() || 0)
                  : (this.tienda_moneda === 'EUR' ? (this.tasaeuro() || 0) : 1),
                img: imgUrl,
                ...this.formTransferencia.value
              };

              // Registramos la transferencia en tu base de datos
              this._trasferencias.createTransfer(dataTransferencia).subscribe({
                next: () => {
                  this.toastr.success('¡Transferencia y orden registradas con éxito!');

                  // Limpieza total de persistencias locales
                  localStorage.removeItem('uid_checkout_temporal');
                  localStorage.removeItem('bandejaItems');
                  this.remove_carrito();

                  this.onItemRemoved();
                  this._router.navigate(['/mis-pagos']);
                },
                error: (err) => {
                  this.toastr.error('Error al registrar el pago en el servidor');
                }
              });
            })
            .catch(err => {
              console.error('Error subiendo comprobante:', err);
              this.toastr.error('Error al subir la imagen del pago');
            });

        } else {
          // =========================================================================
          // 🇻🇪 CARRIL B: MODO WHATSAPP TRADICIONAL (Tu flujo de siempre)
          // =========================================================================
          this.remove_carrito();

          if (this.tienda && this.tienda.telefono) {
            const message = `Haz recibido una compra ${this.randomNum}, favor verifica y, procesala pronto !`;
            const url = `https://wa.me/${this.tienda.telefono}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
          }

          this.actualizarPedido();
        }
      },
      error: (err) => {
        this.toastr.error('No se pudo registrar la venta en el sistema.');
        console.error('Error en registro venta:', err);
      }
    });
  }


  actualizarPedido() {
    const data = {
      _id: this.pedido._id,
      status: 'PAYED'
    }
    this.pedidosService.actualizar(data).subscribe((resp: any) => {
    })
  }



  private renderPayPalButton() {
    if (this.selectedMethod === 'card' || this.selectedMethod === 'paypal') {
      this.habilitacionFormTransferencia = false;
      this.habilitacionFormEfectivo = false;
      this.paypal = true;
      // Config already loaded via getPaypalByTienda()
      this.initPayPalConfig();
    }
    else if (this.selectedMethod === 'transferencia') {
      // transferencia bancaria => abrir formulario (en un futuro un modal con formulario)
      this.habilitacionFormTransferencia = true;
      this.habilitacionFormEfectivo = false;
      this.paypal = false;
    }
    else if (this.selectedMethod === 'efectivo') {
      // transferencia bancaria => abrir formulario (en un futuro un modal con formulario)
      this.habilitacionFormEfectivo = true;
      this.habilitacionFormTransferencia = false;
      this.paypal = false;
    }
    else {
      this.paypal = false;
      this.habilitacionFormTransferencia = false;
      this.habilitacionFormEfectivo = false;
    }
  }


  private initPayPalConfig(): void {
    if (!this.paypalinfo!.clientIdPaypal || this.paypalinfo!.clientIdPaypal.trim() === '') {
      console.error('No valid PayPal client ID from service');
      this.toastr.error('Client ID inválido. Contacte al administrador.', 'Error de PayPal', {
        timeOut: 3000,
        progressBar: true
      });
      return;
    }

    // Determinamos el estilo visual de acuerdo al método seleccionado en el formulario
    const esTarjeta = this.selectedMethod === 'card';

    this.payPalConfig = {
      currency: this.tienda_moneda,
      clientId: this.paypalinfo!.clientIdPaypal,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: this.tienda_moneda,
            value: (this.totalAmount || this.subtotal).toString(),
            breakdown: {
              item_total: {
                currency_code: this.tienda_moneda,
                value: (this.totalAmount || this.subtotal).toString(),
              }
            }
          },
          items: this.getItemsList()
        }]
      },
      advanced: {
        commit: 'true'
      },

      // CONFIGURACIÓN VISUAL DINÁMICA DE BOTONES
      fundingSource: esTarjeta ? 'CARD' : 'PAYPAL', // Fuerza el renderizado exclusivo del botón elegido
      style: {
        label: esTarjeta ? 'buynow' : 'paypal',
        layout: 'vertical',
        color: esTarjeta ? 'black' : 'gold',
        shape: 'rect'
        // Removido disableFunding de aquí para eliminar el error ts(2353)
      },

      onApprove: (data, actions) => {
        console.log('onApprove - transaction approved', data, actions);
        actions.order.get().then((details: any) => {
          console.log('Order details:', details);
        });
      },
      onClientAuthorization: (data) => {
        console.log('Payment authorized:', data);
        this.data_venta.idtransaccion = data.id;

        // Notificación de éxito con Toastr
        this.toastr.success('¡Pago procesado con éxito!', 'Autorizado', {
          progressBar: true
        });

        this.saveVenta();
      },
      onCancel: (data, actions) => {
        console.log('Payment cancelled', data, actions);
        this.toastr.warning('El proceso de pago ha sido cancelado.', 'Pago Cancelado');
      },
      onError: err => {
        console.error('PayPal Error:', err);

        // Alerta de error con Toastr
        this.toastr.error('Transacción fallida. Intente nuevamente.', 'Error en PayPal', {
          timeOut: 4000,
          progressBar: true
        });
      },
      onClick: (data, actions) => {
        console.log('PayPal clicked', data, actions);
      },
    };
  }




  getItemsList(): any[] {

    const items: any[] = [];
    // Populate from current pedidos if cartItems empty
    const orderItems = this.cartItems.length > 0 ? this.cartItems : this.pedidos.map(p => ({
      productName: p.titulo,
      productPrice: p.precio_ahora.toString(),
      quantity: p.cantidad,
      category: 'Pedido'
    })) || [];

    orderItems.forEach((it: any) => {
      const item = {
        name: it.productName || 'Producto',
        unit_amount: {
          currency_code: this.tienda_moneda || 'USD',
          value: it.productPrice || '0.00',
        },
        quantity: it.quantity || 1,
        category: it.category || 'general',
      };
      items.push(item);
    });
    console.log('PayPal items:', items);
    return items;
  }



}
