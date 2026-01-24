import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { TiposdepagoService } from '../../services/tiposdepago.service';
import { PaymentMethod } from '../../models/paymenthmethod.model';
import { TransferenciasService } from '../../services/transferencias.service';
import { CarritoService } from '../../services/carrito.service';
import Swal from 'sweetalert2';
// import io from "socket.io-client";
import { TiendaService } from '../../services/tienda.service';
import { VentaService } from '../../services/venta.service';
import { ProductoService } from '../../services/product.service';
import { Tienda } from '../../models/tienda.model';
import { CartItemModel } from '../../models/cart-item-model';
import { environment } from '../../../environments/environment';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { PedidomenuService } from '../../services/pedidomenu.service';
import { Pedido } from '../../models/pedido.model';

declare var $: any;
// declare var paypal;

@Component({
  selector: 'app-checkout',
  imports: [
    HeaderComponent, CommonModule, RouterModule,
    ReactiveFormsModule, FormsModule,
    ImagenPipe
    //  NgxPayPalModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {

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
  public whatsapp = '+584241874370';

  // public socket = io(environment.soketServer);
  public data_direccionLocal: any = {};
  public tienda_moneda: any;

  public no_direccion = 'no necesita direccion';

  // public payPalConfig ? : IPayPalConfig;
  cartItems: any[] = [];

  pedidoGuardado = false;

  public url!: string;
  public postales: any;

  pedido!: Pedido;
  tienda!: Tienda;
  tiendas: Tienda[] = [];
  nombreSelected = environment.nombreSelected;
  tiendaSelected: any;
  selectedMethod: string = 'Selecciona un método de pago';
  public clienteSeleccionado: any;

  habilitacionFormTransferencia: boolean = false;
  habilitacionFormCheque: boolean = false;

  paymentMethods: PaymentMethod[] = []; //array metodos de pago para transferencia (dolares, bolivares, movil)
  paymentSelected!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia
  paymentMethodinfo!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia


  formTransferencia = new FormGroup({
    metodo_pago: new FormControl(this.paymentMethodinfo, Validators.required),
    bankName: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    referencia: new FormControl('', Validators.required),
    name_person: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    paymentday: new FormControl('', Validators.required)
  });

  formCheque = new FormGroup({
    amount: new FormControl('', Validators.required),
    name_person: new FormControl(''),
    ncheck: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    paymentday: new FormControl('', Validators.required)
  });


  constructor(
    private _trasferencias: TransferenciasService,
    // private _pagoCheque: PagochequeService,
    private _tipoPagosService: TiposdepagoService,
    private _carritoService: CarritoService,
    private tiendaService: TiendaService,
    private pedidosService: PedidomenuService,
    private _ventaService: VentaService,
    private _productoService: ProductoService,
    private _router: Router,
    //  private _postalService :PostalService,
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
     
    this.geneardorOrdeneNumero();
    this.obtenerMetodosdePago();
    this.total();
    let USER = localStorage.getItem('user');
    if (USER) {
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }
    this.nombreSelected;
    this.userId = this.identity.uid;
    this.getTienda();
    this.loadBandejaListFromLocalStorage();
    this.pedidoGuardado = false;
    this.chekpedidoguardado();
    // this.listar_carrito();
  }

  getTienda() {
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: Tienda) => {
      // Asignamos el array filtrado directamente
      this.tiendaSelected = resp;
      this.tienda_moneda = this.tiendaSelected.moneda
      
    })
  }

  private listAndIdentify() {
    // this.listar_direcciones();
    // this.listar_postal();
    this.listar_carrito();
    this.obtenerMetodosdePago();

    if (this.clienteSeleccionado) {
      // this.socket.on('new-carrito', (data: any) => {
      //   this.listar_carrito();
      // });




      // paypal.Buttons({

      //   createOrder: (data: any,actions: { order: { create: (arg0: { purchase_units: { description: string; amount: { currency_code: string; value: number; }; }[]; }) => any; }; })=>{
      //     //VALIR STOCK DE PRODUCTOS
      //     this.data_venta.detalles.forEach((element: { producto: { stock: number; }; }) => {
      //         if(element.producto.stock == 0){
      //           this.error_stock = true;
      //         }else{
      //           this.error_stock = false;
      //         }

      //     });

      //     if(!this.error_stock){
      //       return actions.order.create({
      //         purchase_units : [{
      //           description : 'Compra en Linea',
      //           amount : {
      //             currency_code : 'USD',
      //             value: Math.round(this.subtotal),
      //           }

      //         }]
      //       });
      //     }else{
      //       this.error_stock = true;
      //       this.listar_carrito();
      //     }
      //   },
      //   onApprove : async (data: any,actions: { order: { capture: () => any; }; })=>{
      //     const order = await actions.order.capture();
      //     console.log(order);
      //     this.data_venta.idtransaccion = order.purchase_units[0].payments.captures[0].id;
      //     this._ventaService.registro(this.data_venta).subscribe(
      //       response =>{
      //         this.data_venta.detalles.forEach((element: { producto: { _id: any; }; cantidad: any; }) => {
      //           console.log(element);
      //           this._productoService.aumentar_ventas(element.producto._id).subscribe(
      //             response =>{
      //             },
      //             error=>{
      //               console.log(error);

      //             }
      //           );
      //             this._productoService.reducir_stock(element.producto._id,element.cantidad).subscribe(
      //               response =>{
      //                 this.remove_carrito();
      //                 this.listar_carrito();
      //                 this.socket.emit('save-carrito', {new:true});
      //                 this.socket.emit('save-stock', {new:true});
      //                 this._router.navigate(['/app/cuenta/ordenes']);
      //               },
      //               error=>{
      //                 console.log(error);

      //               }
      //             );
      //         });

      //       },
      //       error=>{
      //         console.log(error);

      //       }
      //     );
      //   },
      //   onError : err =>{
      //     console.log(err);

      //   }
      // }).render(this.paypalElement.nativeElement);
      //
      this.url = environment.baseUrl;

      this.carrito_real_time();

    }
    else {
      this._router.navigate(['/']);
    }
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

  total() {
    const total = this.bandejaList.reduce((sum, item) =>
      sum + item.precio_ahora * item.cantidad, 0
    );
    return total;
  }

  totalWithIva() {
    const baseTotal = this.total();
    const ivaAmount = baseTotal * this.iva / 100;
    return baseTotal + ivaAmount;
  }



  private obtenerMetodosdePago() {
    this._trasferencias.getPaymentsActives().subscribe(data => {
      this.paymentMethods = data.paymentMethods;
      // console.log('metodos de pago: ',this.paymentMethods)
    });
  }

  // metodo para el cambio del select 'tipo de transferencia'
  onChangePayment(event: Event) {
    const target = event.target as HTMLSelectElement; //obtengo el valor
    console.log(target.value)

    // guardo el metodo seleccionado en la variable de clase paymentSelected
    this.paymentSelected = this.paymentMethods.filter(method => method._id === target.value)[0]
    console.log(this.paymentSelected)
  }


  // Método que se llama cuando cambia el select
  // onPaymentMethodChange(event: any) {
  //   this.selectedMethod = event.target.value;
  //   console.log('metodo de pago seleccionado: ',this.selectedMethod)
  //   this.getPaymentMbyName(this.selectedMethod);

  //   if(this.selectedMethod==='paypal' || this.selectedMethod==='card'){
  //     // transferencia bancaria => abrir formulario (en un futuro un modal con formulario)
  //     // this.renderPayPalButton(); // Renderiza el botón de nuevo según la opción seleccionada
  //     this.habilitacionFormTransferencia = false;
  //     this.habilitacionFormCheque = false;
  //   }
  //   if(this.selectedMethod==='Transferencia Dólares' || this.selectedMethod==='Transferencia Bolivares'
  //     || this.selectedMethod==='pagomovil' || this.selectedMethod==='zelle'
  //   ){
  //     // transferencia bancaria => abrir formulario (en un futuro un modal con formulario)
  //     this.habilitacionFormTransferencia = true;
  //     this.habilitacionFormCheque = false;
  //   }
  //   else if(this.selectedMethod==='cheque'){
  //     // cheque
  //     this.habilitacionFormCheque = true;

  //     this.habilitacionFormTransferencia = false;


  //   }
  // }

  // Método que se llama cuando cambia el select
  onPaymentMethodChange(event: any) {
    this.selectedMethod = event.target.value;
    this.renderPayPalButton(); // Renderiza el botón de nuevo según la opción seleccionada
  }

  getPaymentMbyName(selectedMethod: string) {
    this.selectedMethod = selectedMethod
    this._tipoPagosService.getPaymentMethodByName(selectedMethod).subscribe((resp: any) => {
      this.paymentMethodinfo = resp[0];
      console.log(this.paymentMethodinfo);
      // Update the form control value with the selected payment method info
      this.formTransferencia.get('metodo_pago')?.setValue(this.paymentMethodinfo);
      this.formTransferencia.get('name_person')?.setValue(this.identity.first_name + '' + this.identity.last_name,);
    })
  }

  sendFormTransfer() {

    if (this.formTransferencia.valid) {

      const data = {
        localId: this.localId,
        ...this.formTransferencia.value
      }


      // llamo al servicio
      this._trasferencias.createTransfer(data).subscribe(resultado => {
        // console.log('resultado: ',resultado);
        this.verify_dataComplete(Number(this.formTransferencia.value.amount));
        if (resultado.ok || resultado.status === 200) {
          // transferencia registrada con exito
          // console.log(resultado.payment);
          // alert('Transferencia registrada con exito');
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Transferencia registrada con exito',
            showConfirmButton: false,
            timer: 1500,
          });
          this.onItemRemoved();
          this._router.navigate(['/my-account/ordenes']);
        }
        else {
          // error al registar la transferencia
          // alert('Error al registrar la transferencia');
          // console.log(resultado.msg);
          Swal.fire({
            position: 'top-end',
            icon: 'warning',
            title: 'Error al registrar la transferencia',
            text: resultado.msg,
            showConfirmButton: false,
            timer: 1500,
          });
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
        console.log(response)
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



  carrito_real_time() {
    // this.socket.on('new-carrito', function (data:any) {
    //   this.subtotal = 0;

    //   this._carritoService.preview_carrito(this.clienteSeleccionado.uid).subscribe(
    //     response =>{
    //       this.carrito = response;

    //       this.carrito.forEach(element => {
    //         this.subtotal = Math.round(this.subtotal + (element.precio * element.cantidad));
    //       });

    //     },
    //     error=>{
    //       console.log(error);

    //     }
    //   );

    // }.bind(this));
  }

  //  loadTiendaFromLocalStorage() {
  //   const storedLocal = localStorage.getItem('tiendaSelected');
  //   if (storedLocal) {
  //     this.tiendaSelect = JSON.parse(storedLocal);
  //     console.log(this.tiendaSelect)

  //   }
  // }

  // direccionTienda(){
  //   this._tiendaService.getTiendaById(this.localId).subscribe(
  //     tienda =>{
  //       this.data_direccionLocal = tienda;
  //       console.log('direccion del local', this.data_direccionLocal);
  //     }
  //   );

  // }

  verify_dataComplete(total_pagado: number) {
    debugger
    if (this.localId) {
      this.msm_error = '';



      if (this.data_cupon) {
        if (this.data_cupon.categoria) {
          this.info_cupon_string = this.data_cupon.descuento + '% de descuento en ' + this.data_cupon.categoria.nombre;
        } else if (this.data_cupon.subcategoria) {
          this.info_cupon_string = this.data_cupon.descuento + '% de descuento en ' + this.data_cupon.subcategoria;
        }
      }

      var fecha = new Date();

      var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Deciembre"];
      fecha.setDate(fecha.getDate() + parseInt(this.medio_postal.dias));
      this.date_string = fecha.getDate() + ' de ' + months[fecha.getMonth()] + ' del ' + fecha.getFullYear();


      this.data_venta = {
        user: this.identity.uid,
        local: this.data_direccionLocal._id,
        total_pagado: total_pagado,
        codigo_cupon: this.cupon,
        info_cupon: this.info_cupon_string,
        idtransaccion: null,
        metodo_pago: this.selectedMethod,
        // metodo_pago : 'Paypal',

        tipo_envio: "Pickup",
        precio_envio: "0",
        tiempo_estimado: this.fechaHoy,

        direccion: this.data_direccionLocal.direccion,
        destinatario: this.identity.first_name + '' + this.identity.last_name,
        detalles: this.data_detalle,
        referencia: this.data_direccionLocal.local,
        pais: this.data_direccionLocal.pais,
        ciudad: this.data_direccionLocal.ciudad,
        zip: this.data_direccionLocal.zip,
      }

      console.log(this.data_venta);

      this.saveVenta();

    } else {
      this.msm_error = "Seleccione una dirección de envio.";
    }

  }

  saveVenta() {
    this._ventaService.registro(this.data_venta).subscribe(response => {
      this.data_venta.detalles.forEach((element: { producto: { _id: any; }; cantidad: any; }) => {
        console.log(element);
        this._productoService.aumentar_ventas(element.producto._id).subscribe(
          response => {
          },
          error => {
            console.log(error);

          }
        );
        this._productoService.reducir_stock(element.producto._id, element.cantidad).subscribe(
          response => {
            this.remove_carrito();
            this.listar_carrito();
            // this.socket.emit('save-carrito', {new:true});
            // this.socket.emit('save-stock', {new:true});
            // this._router.navigate(['/dashboard/ventas/modulo']);
          },
          error => {
            console.log(error);

          }
        );


      });

      // Enviar mensaje de WhatsApp a la tienda
      if (this.tienda && this.tienda.telefono) {
        const message = `Haz recibido una compra ${this.randomNum}, favor verifica y, procesala pronto !`;
        const url = `https://wa.me/${this.tienda.telefono}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }

    },)
  }



  geneardorOrdeneNumero() {
    //creamos una suma de 1 a 1000 para ordenes nuevas
    const max = 1000;
    const min = 1;
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    this.randomNum = random;
    // return random;
  }

  // Generate WhatsApp message with order items
  getWhatsAppMessage(): string {

    if (!this.identity || this.bandejaList.length === 0) {
      return '';
    }

    let message = `*Nuevo Pedido desde app Menu #${this.randomNum}*\n\n`;
    message += `*Cliente:* ${this.identity.first_name} ${this.identity.last_name}\n`;
    message += `*Teléfono:* ${this.identity.telefono || 'No registrado'}\n\n`;
    message += `*Detalles del Pedido:*\n`;
    message += `─────────────────────\n`;

    this.bandejaList.forEach((item: any) => {
      const itemTotal = (item.precio_ahora * item.cantidad).toFixed(2);
      message += `• ${item.titulo || item.titulo}\n`;
      if(item.subcategoria === 'Pastas'){
        message += `• ${item.nombre_selector}\n`;
      }
      message += `  Cant: ${item.cantidad} x ${item.precio_ahora.toFixed(2)} = ${itemTotal}\n\n`;
    });

    message += `─────────────────────\n`;
    message += `*TOTAL:* ${this.tienda_moneda} ${this.total().toFixed(2)}\n\n`;
    message += `Por favor confirmar disponibilidad y método de pago.`;

    return encodeURIComponent(message);
  }

  // Open WhatsApp with pre-filled message
  sendWhatsAppOrder(): void {
    const phone = this.whatsapp.replace(/\D/g, '');
    const message = this.getWhatsAppMessage();

    if (message) {
      const url = `https://wa.me/${phone}?text=${message}`;
      window.open(url, '_blank');
    }
    // console.log(message)
    this.guardarPedido();
  }


  private renderPayPalButton() {
    // Primero, limpiar el contenedor anterior
    // this.paypalElement.nativeElement.innerHTML = '';

    if (this.selectedMethod === 'card' || this.selectedMethod === 'paypal') {
      // deshabilitar el formulario de pago con transferencia
      this.habilitacionFormTransferencia = false;
      this.paypal = true;
      // Cargar el botón de PayPal con las opciones seleccionadas
      this.initPayPalConfig();
    }
    else if (this.selectedMethod === 'transferencia') {
      // transferencia bancaria => abrir formulario (en un futuro un modal con formulario)
      this.habilitacionFormTransferencia = true;
      this.paypal = false;
    }
    else {
      this.paypal = false;
      this.habilitacionFormTransferencia = false;
    }
  }

  private initPayPalConfig(): void {
    // this.payPalConfig = {
    //   currency: 'USD',
    //   clientId: environment.clientIdPaypal,
    //   createOrderOnClient: (data) => <ICreateOrderRequest>{
    //     intent: 'CAPTURE',
    //     purchase_units: [{
    //       amount: {
    //         currency_code: 'USD',
    //         value: Math.round(this.subtotal).toString(),
    //         breakdown: {
    //           item_total: {
    //             currency_code: 'USD',
    //             value: Math.round(this.subtotal).toString(),
    //           }
    //         }
    //       },
    //       items: this.getItemsList()
    //     }]
    //   },
    //   advanced: {
    //     commit: 'true'
    //   },
    //   style: {
    //     label: 'paypal',
    //     layout: 'vertical'
    //   },
    //   onApprove: (data, actions) => {
    //     console.log('onApprove - transaction was approved, but not authorized', data, actions);
    //     actions.order.get().then((details: any) => {
    //       console.log('onApprove - you can get full order details inside onApprove: ', details);
    //     });
    //   },
    //   onClientAuthorization: (data) => {
    //     console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
    //     this.data_venta.idtransaccion = data.id;
    //     this.saveVenta();
    //   },
    //   onCancel: (data, actions) => {
    //     console.log('OnCancel', data, actions);
    //   },
    //   onError: err => {
    //     console.log('OnError', err);
    //   },
    //   onClick: (data, actions) => {
    //     console.log('onClick', data, actions);
    //   },
    // };
  }

  getItemsList(): any[] {

    const items: any[] = [];
    let item = {};
    this.cartItems.forEach((it: CartItemModel) => {
      item = {
        name: it.productName,
        unit_amount: {
          currency_code: 'USD',
          value: it.productPrice,
        },
        quantity: it.quantity,
        category: it.category,
      };
      items.push(item);
    });
    return items;
  }
  //guardamos el pedido de bandejalist para una vez confirmado, poder procesar el pago si el cliente lo quiere
  guardarPedido() {
    this.pedidoGuardado = false;
    const data = {
      user: this.identity.uid,
      tienda: this.tiendaSelected._id,
      pedido: this.bandejaList
    }
    this.pedidosService.create(data).subscribe((resp:any)=>{
      console.log(resp)
      this.pedidoGuardado = true;

    
    })
    
    
  }

  chekpedidoguardado(){
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

    this.pedidosService.getByUserId(this.userId).subscribe((resp: any) => {
      console.log('Pedidos del usuario:', resp);
      
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
      
      console.log('pedidoGuardado:', this.pedidoGuardado);
    });
  }

}
