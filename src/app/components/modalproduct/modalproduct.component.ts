import { CommonModule } from '@angular/common';
import { Component, inject, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { StorageService } from '../../services/storage.service';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';
import { SelectorService } from '../../services/selector.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';

@Component({
  selector: 'app-modalproduct',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe
  ],
  templateUrl: './modalproduct.component.html',
  styleUrl: './modalproduct.component.scss'
})
export class ModalproductComponent implements OnInit, OnDestroy {
  @Input() product: any ;
  @Input() selectedProduct: any ;
  @Input() tienda_moneda!: any;
  @Input() activeCategory!: string;
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();

  public msm_error = false;
  public msm_success = false;
  public msm_alert = false;

  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);
  private selectorService = inject(SelectorService);

  user!: Usuario;
  bandejaList: any[] = [];
  tiendaSelected: Tienda | null = null;
  tiendaNameSelected!:string;
 img:string | null = './assets/images/no-image.jpg';

  public selector_to_cart = ' ';
  public selector_error = false;
  public selectores : any = [];
  
  private cartSubscription!: Subscription;
  // private modalInstance: any = null; - removed

  ngOnInit(): void {
    this.msm_alert = false;
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
    // Subscribe to cart changes to keep local copy updated
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
    });

    this.product;
    this.activeCategory;
    if(!this.product?.img){
      this.img = '../assets/images/no-image.jpg';
    }
    this.getSelectorProducto();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    // Cleanup orphan Bootstrap backdrops (fixes stuck backdrop issue)
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach((backdrop: Element) => backdrop.remove());
  }

  // ngOnChanges removed - no longer needed with Bootstrap data attributes


  onModalHidden(): void {
    this.modalClosed.emit();
    this.selector_to_cart = ' ';
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

    if(producto.subcategoria === 'Pastas'){
      // Validar que se haya seleccionado un selector
      if(!this.selector_to_cart || this.selector_to_cart === ' '){
        this.selector_error = true;
         setTimeout(() => {
          this.selector_error = false;
        }, 3000)
        return;
      }

      // Agregamos el selector al producto
      producto.nombre_selector = this.selector_to_cart;
      
    }

    this.carritoService.addItem(producto);
    
    // Reset selector after adding
    this.selector_to_cart = ' ';
    
    this.msm_success = true;
    setTimeout(() => {
      this.msm_success = false;
    }, 3000)
  }

  removeItem(producto: Producto) {
    this.carritoService.removeItem(producto);
  }

  closeAviso() {
    this.msm_success = false;
    this.msm_alert = false;
    this.selector_error = false;
  }

  getSelectorProducto(){
    this.selector_to_cart = ' ';
    this.selectorService.selectorByProduct(this.product._id).subscribe(
      response =>{
        this.selectores = response;
        console.log(this.selectores)
      },
      error=>{

      }
    );
  }
}
