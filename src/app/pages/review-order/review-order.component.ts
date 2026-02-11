import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DireccionService } from '../../services/direccion.service';
import { Direccion } from '../../models/direccion.model';


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
  bandejaList: Producto[] = [];
  fechaHoy: string = new Date().toISOString().split('T')[0];
  randomNum: number = 0;
  isbandejaList: boolean = false;

  tiendaSelected: any;
  tienda_moneda: any;

  tiendas: Tienda[] = [];
  nombreSelected = environment.nombreSelected;
  identity: any;
  userId : any;
  pedido: any;

  pedidoGuardado = false;

  selectedDelivery: string = 'Deseas Delivery?';
  habilitacionAddresLocal: boolean = false;
  habilitacionFormDelivery: boolean = false;

  direcciones:Direccion[] = [];
  direccionSelected!:Direccion;

  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidomenuService);
  private direccionService = inject(DireccionService);
  
  private cartSubscription!: Subscription;

  formDelivery = new FormGroup({
      delivery: new FormControl('', Validators.required),
      deliveryAddres: new FormControl('', Validators.required),
    });

  constructor(
    private router: Router
  ) {
    window.scrollTo(0, 0);
  }
  ngOnInit() {
    let USER = localStorage.getItem('user');
    if (USER) {
      this.identity = JSON.parse(USER);
    }
    this.userId = this.identity.uid;
    // Subscribe to cart changes from CarritoService
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
      this.isbandejaList = items.length > 0;

      // If cart becomes empty, navigate to home
      if (items.length === 0 && this.router.url.includes('/review')) {
        this.router.navigate(['/home']);
      }
    });

    this.geneardorOrdeneNumero();
    this.nombreSelected;
    this.getTienda();
    this.chekpedidoguardado();
    this.getDireccionbyUser();

  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
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

  geneardorOrdeneNumero() {
    //creamos una suma de 1 a 1000 para ordenes nuevas
    const max = 1000;
    const min = 1;
    const random = Math.floor(Math.random() * (max - min + 1)) + min
    this.randomNum = random;
  }

  getTienda() {
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: Tienda) => {
      // Asignamos el array filtrado directamente
      this.tiendaSelected = resp;
      this.tienda_moneda = this.tiendaSelected.moneda
      
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
    this.pedidoService.getByUserId(this.userId).subscribe((resp:any)=>{
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

   //guardamos el pedido de bandejalist para una vez confirmado, poder procesar el pago si el cliente lo quiere
  guardarPedido() {
    this.pedidoGuardado = false;
    const data = {
      user: this.identity.uid,
      tienda: this.tiendaSelected._id,
      pedido: this.bandejaList,
      delivery: this.formDelivery.value.delivery,
      deliveryAddres: this.formDelivery.value.deliveryAddres,
      status: 'ONDEVICE'
    }
    this.pedidoService.create(data).subscribe((resp:any)=>{
      console.log(resp)
      this.pedidoGuardado = true;
    })
    
    
  }

  borrarPedido(){
    this.pedidoService.borrarPedido(this.pedido._id).subscribe((resp:any)=>{
    })  
  }


  makeRequest(){
    if(!this.pedidoGuardado){
      this.guardarPedido(); 
    }
    this.router.navigateByUrl('/checkout');
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
    this.direccionService.listarUsuario(this.userId).subscribe((resp:any)=>{
      this.direcciones = resp.direcciones;
    })
  }

  // metodo para el cambio del select 'tipo de transferencia'
  onChangeDireccion(event: Event) {
    const target = event.target as HTMLSelectElement; //obtengo el valor
    // console.log(target.value)

    // guardo el metodo seleccionado en la variable de clase direccionSelected
    this.direccionSelected = this.direcciones.filter(method => method._id === target.value)[0]
    // console.log(this.direccionSelected)
  }

  
}

