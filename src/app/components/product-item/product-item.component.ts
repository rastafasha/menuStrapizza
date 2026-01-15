import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { Tienda } from '../../models/tienda.model';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { TiendaService } from '../../services/tienda.service';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    RouterModule,
    ImagenPipe
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {

  @Input() product: any;
  @Input() tienda_moneda: any;
  @Input() activeCategory!: string;
  @Output() productSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  user!:Usuario;
  isUserLogged=false;
  isProductAdded=false;
  tiendaSelected: Tienda | null = null;
  tiendaNameSelected!:string;

  private carritoService = inject(CarritoService);

  ngOnInit(): void {
     let USER = localStorage.getItem("user");
     this.user = USER ? JSON.parse(USER) : null;
  }

  openPaymentsModal(product: any): void {
    this.productSelected.emit(product);
  }

    addItem(producto:Producto){
        
      if(this.user == null){
        setTimeout(()=>{
          this.isUserLogged = true;
          
        }, 300);
        this.isUserLogged = false;

        return;
      }else{

        this.msm_success.emit(false);
        this.carritoService.addItem(producto);
        
        setTimeout(()=>{
          this.isProductAdded =true
        }, 300)
        this.isProductAdded =false
      }
  
    }

  closeAviso(){
    this.isUserLogged = false;
    this.isProductAdded = false;
  }

  
  
}
