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
  @Output() productSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  user!:Usuario;
  isUserLogged=false;
  isProductAdded=false;
  tiendaSelected:any;

  tiendas: Tienda[] = [];
    nombreSelected = 'Strapizza';

  private carritoService = inject(CarritoService);
  private tiendaService = inject(TiendaService);

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
        }, 5000);
        this.isProductAdded =false
      }
  
    }

  closeAviso(){
    this.isUserLogged = false;
    this.isProductAdded = false;
  }

   getTiendas() {
      this.tiendaService.cargarTiendas().subscribe((resp: Tienda[]) => {
        // Asignamos el array filtrado directamente
        this.tiendas = resp.filter((tienda: Tienda) => tienda.categoria && tienda.categoria.nombre === 'Alimentos');
        // console.log(this.tiendas);
  
        this.setTiendaDefault();
  
      })
    }

    setTiendaDefault() {
    // Set default tiendaSelected to "Panaderia SlideDish" if not already set
    const defaultTienda = this.tiendas.find(tienda => tienda.nombre === this.nombreSelected);
    this.tiendaSelected = defaultTienda;

    console.log(defaultTienda)
  }
  
}
