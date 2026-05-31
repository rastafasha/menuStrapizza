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
import { DireccionService } from '../../services/direccion.service';
import { Direccion } from '../../models/direccion.model';

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
  pedidos!: Pedido;
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

  

  paymentMethods: PaymentMethod[] = []; //array metodos de pago para transferencia (dolares, bolivares, movil)
  paymentSelected!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia
  paymentMethodinfo!: PaymentMethod; //metodo de pago seleccionado por el usuario para transferencia


  constructor(
    private _trasferencias: TransferenciasService,
    // private _pagoCheque: PagochequeService,
    private _tipoPagosService: TiposdepagoService,
    private _carritoService: CarritoService,
    private tiendaService: TiendaService,
    private pedidosService: PedidomenuService,
    private _direccionService: DireccionService,
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
    this.total();
    let USER = localStorage.getItem('user');
    if (USER) {
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }
    this.userId = this.identity.uid;
    this.escucharTiendaActiva();
    this.loadBandejaListFromLocalStorage();
    this.pedidoGuardado = false;

    setTimeout(()=>{
      this.chekpedidoguardado();
      }, 500)
    // this.listar_carrito();
  }

  

  escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        console.log('LoginComponent sincronizado con la tienda:', this.tiendaSelected.nombre);
      }
    });
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

    let message = `*Nuevo Pedido desde App Menu #${this.randomNum}*\n\n`;
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
    // console.log(message)
    this.actualizarPedido();
    this._carritoService.clearCart();
    
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
  actualizarPedido() {
    if (!this.pedido || !this.pedido._id) {
      console.error('Error: No hay pedido guardado o falta el _id');
      return;
    }

    const data = {
      _id: this.pedido._id,
      user: this.identity.uid,
      tienda: this.tiendaSelected._id,
      pedidoList: this.bandejaList,
      status: 'PENDING'
    }
     this.pedidosService.actualizar(data).subscribe((resp:any)=>{
          
          this._router.navigate(['/my-account/pedidos']);
          localStorage.removeItem('bandejaItems');
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
      // console.log('Pedidos del usuario:', resp);
      
      // resp es un array de pedidos
      // Si el array está vacío, no hay pedido guardado
      if (!resp || resp.length === 0) {
        this.pedidoGuardado = false;
        return;
      }

      // Asignamos el primer pedido del array
      this.pedido = resp[0];
      
      console.log('Pedido ID:', this.pedido._id);

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

  getDireccionId(){
    this._direccionService.get_direccion(this.deliveryAddres).subscribe((resp:any)=>{
      this.direccion = resp;
      // console.log(this.direccion)
    })
  }

}
