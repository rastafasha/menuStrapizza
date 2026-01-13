import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { StorageService } from '../../services/storage.service';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modalproduct',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './modalproduct.component.html',
  styleUrl: './modalproduct.component.scss'
})
export class ModalproductComponent implements OnInit, OnDestroy {
  @Input() product!: Producto | null;

  public msm_error = false;
  public msm_success = false;
  public msm_alert = false;

  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);

  user!: Usuario;
  bandejaList: any[] = [];
  tiendaSelected: Tienda | null = null;
  tiendaNameSelected!:string;
  
  private cartSubscription!: Subscription;

  ngOnInit(): void {
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;

    if(!this.user){
      this.msm_alert = true;
    }

    // Subscribe to cart changes to keep local copy updated
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
    });

   let TIENDA = localStorage.getItem("tiendaSelected");
     this.tiendaNameSelected = TIENDA ? JSON.parse(TIENDA) : null;

      this.tiendaService.getTiendaByName(this.tiendaNameSelected).subscribe(tienda => {
       this.tiendaSelected = tienda;
      //  console.log(this.tiendaNameSelected)
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }


  total() {
    const total = this.bandejaList.reduce((sum, item) =>
      sum + item.precio_ahora * item.cantidad, 0
    );
    return total;
  }

  addItem(producto: Producto) {
    this.msm_success = false;
    this.carritoService.addItem(producto);

    setTimeout(() => {
      this.msm_success = true;
    }, 300)
    this.msm_success = false;
  }

  removeItem(producto: Producto) {
    this.carritoService.removeItem(producto);
  }

  closeAviso() {
    this.msm_success = false;
    this.msm_alert = false;
  }
}
