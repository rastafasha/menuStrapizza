import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { DireccionService } from '../../services/direccion.service';
import { Direccion } from '../../models/direccion.model';
import { PagoEfectivoService } from '../../services/pago-efectivo.service';

declare var $: any;
// declare var paypal;

@Component({
  selector: 'app-pay',
  imports: [
    HeaderComponent, CommonModule, RouterModule,
    ReactiveFormsModule, FormsModule,
    ImagenPipe
    //  NgxPayPalModule
  ],
  templateUrl: './pay.component.html',
  styleUrl: './pay.component.scss'
})
export class PayComponent {

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

  // public payPalConfig ? : IPayPalConfig;
  cartItems: any[] = [];

  pedidoGuardado = false;

  public url!: string;
  public postales: any;

  pedido!: Pedido;
  pedidos!: Producto[];
  totalAmount: number = 0;
  delivery!: string;
  deliveryAddres!: string;
  tienda!: Tienda;
  tiendas: Tienda[] = [];
  nombreSelected = environment.nombreSelected;
  tiendaSelected: any;
  selectedMethod: string = 'Selecciona un método de pago';
  public clienteSeleccionado: any;

  habilitacionFormTransferencia: boolean = false;
  habilitacionFormCheque: boolean = false;
  habilitacionFormEfectivo: boolean = false;

  selectedDelivery: string = 'Deseas Delivery?';
    habilitacionAddresLocal: boolean = false;
    habilitacionFormDelivery: boolean = false;
  
    direcciones:Direccion[] = [];
    direccionSelected!:Direccion;
    efectivo:string = 'efectivo'
  

  paymentMethods: PaymentMethod[] = []; //array metodos de pago para transferencia (dolares, bolivares, movil)
  paymentSelected!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia
  paymentMethodinfo!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia
  

  formTransferencia = new FormGroup({
    metodo_pago: new FormControl(this.paymentMethodinfo, Validators.required),
    bankName: new FormControl('', Validators.required),
    // amount: new FormControl('', Validators.required),
    referencia: new FormControl('', Validators.required),
    // name_person: new FormControl('', Validators.required),
    // phone: new FormControl('', Validators.required),
    paymentday: new FormControl('', Validators.required)
  });

  formDelivery = new FormGroup({
      delivery: new FormControl('', Validators.required),
      deliveryAddres: new FormControl('', Validators.required),
    });

  // formCheque = new FormGroup({
  //   amount: new FormControl('', Validators.required),
  //   name_person: new FormControl(''),
  //   ncheck: new FormControl('', Validators.required),
  //   phone: new FormControl('', Validators.required),
  //   paymentday: new FormControl('', Validators.required)
  // });

  formEfectivo = new FormGroup({
    paymentday: new FormControl('', Validators.required)
  });


  constructor(
    private _trasferencias: TransferenciasService,
    private _efectivo: PagoEfectivoService,
    // private _pagoCheque: PagochequeService,
    private _tipoPagosService: TiposdepagoService,
    private _carritoService: CarritoService,
    private tiendaService: TiendaService,
    private pedidosService: PedidomenuService,
    private _direccionService: DireccionService,
    private _ventaService: VentaService,
    private _productoService: ProductoService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
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
     
    this.obtenerMetodosdePago();
    let USER = localStorage.getItem('user');
    if (USER) {
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }
    this.userId = this.identity.uid;
    this.nombreSelected;
    this.getTienda();
    this.getDireccionbyUser();
    this._activatedRoute.params.subscribe( ({id}) => this.loadPedido(id));

  }

  getTienda() {
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: Tienda) => {
      // Asignamos el array filtrado directamente
      this.tiendaSelected = resp;
      this.tienda_moneda = this.tiendaSelected.moneda
      
    })
  }

  loadPedido(id:string){
    this.pedidosService.getById(id).subscribe((resp:any)=>{
      this.pedido = resp;
      this.pedidos = resp.pedidoList;
      this.totalAmount = this.pedidos.reduce((sum, item) => 
        sum + item.precio_ahora * item.cantidad, 0
      );

      
      console.log(this.pedidos);

      this.pedidos.forEach(element => {
          this.subtotal = Math.round(this.subtotal + (element.precio_ahora * element.cantidad));
          this.data_detalle.push({
            producto: element,
            cantidad: element.cantidad,
            precio: Math.round(element.precio_ahora),
            color: element.color,
            selector: element.nombre_selector
          });
      })
    })
  }


  total() {
    if (!this.pedidos) return 0;
    const total = this.pedidos.reduce((sum, item) =>
      sum + item.precio_ahora * item.cantidad, 0
    );
    return total;
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
  onPaymentMethodChange(event: any) {
    this.selectedMethod = event.target.value;
    console.log(this.selectedMethod)
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

  sendFormTransfer() {

    if (this.formTransferencia.valid) {

      const data = {
        localId: this.tiendaSelected._id,
        user: this.identity.uid,
        name_person: this.identity.first_name + this.identity.last_name,
        phone: this.identity.telefono,
        amount: this.totalAmount,
        ...this.formTransferencia.value
      }


      // llamo al servicio
      this._trasferencias.createTransfer(data).subscribe(resultado => {
        // console.log('resultado: ',resultado);
        // this.verify_dataComplete(Number(this.formTransferencia.value.amount));
        this.verify_dataComplete(Number(this.totalAmount));
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
          // console.log(resultado.payment);
          // alert('Transferencia registrada con exito');
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Pago registrada con exito',
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
            title: 'Error al registrar el Pago',
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

   


   // Método que se llama cuando cambia el select
  onDeliveryMethodChange(event: any) {
    this.selectedDelivery = event.target.value;
     this.renderDelivery(); // Renderiza el botón de nuevo según la opción seleccionada
  }
  

   private renderDelivery() {
    // Primero, limpiar el contenedor anterior
    // this.paypalElement.nativeElement.innerHTML = '';

    if (this.selectedDelivery === 'Delivery' ) {
      // deshabilitar el formulario de pago con transferencia
      this.habilitacionAddresLocal = false;
      this.habilitacionFormDelivery = true;
      // Cargar el botón de PayPal con las opciones seleccionadas
      // this.initPayPalConfig();
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

  getDireccionbyUser(){
    this._direccionService.listarUsuario(this.userId).subscribe((resp:any)=>{
      this.direcciones = resp.direcciones;
    })
  }

  // metodo para el cambio del select 'tipo de transferencia'
  onChangeDireccion(event: Event) {
    const target = event.target as HTMLSelectElement; //obtengo el valor
    // guardo el metodo seleccionado en la variable de clase direccionSelected
    this.direccionSelected = this.direcciones.filter(method => method._id === target.value)[0]
    this.get_direccion(this.direccionSelected)
  }

  get_direccion(direccionSelected:any){
    this.data_direccion = direccionSelected._id;
    this._direccionService.get_direccion(this.data_direccion).subscribe(
      response =>{
        this.data_direccion = response;
        console.log(this.data_direccion)
      }
    );

  }


  verify_dataComplete(total_pagado: number) {
    if (this.direccionSelected) {
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
        local: this.tiendaSelected._id,
        total_pagado: total_pagado,
        codigo_cupon: this.cupon,
        info_cupon: this.info_cupon_string,
        idtransaccion: null,
        metodo_pago: this.selectedMethod,
        // metodo_pago : 'Paypal',

        tipo_envio:this.selectedDelivery,
        precio_envio: "0",
        tiempo_estimado: this.fechaHoy,

        direccion: this.data_direccion.direccion,
        destinatario: this.data_direccion.nombres_completos,
        detalles:this.data_detalle,
        referencia: this.data_direccion.referencia,
        pais: this.data_direccion.pais,
        ciudad: this.data_direccion.ciudad,
        zip: this.data_direccion.zip,
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

      this.actualizarPedido();

    },)
  }

  actualizarPedido(){
    const data ={
      _id:this.pedido._id,
      status: 'PAYED'
    }
    this.pedidosService.actualizar(data).subscribe((resp:any)=>{
    })  
  }

 

  private renderPayPalButton() {
    // Primero, limpiar el contenedor anterior
    // this.paypalElement.nativeElement.innerHTML = '';

    if (this.selectedMethod === 'card' || this.selectedMethod === 'paypal') {
      // deshabilitar el formulario de pago con transferencia
      this.habilitacionFormTransferencia = false;
      this.habilitacionFormEfectivo = false;
      this.paypal = true;
      // Cargar el botón de PayPal con las opciones seleccionadas
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




}
