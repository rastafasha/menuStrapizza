import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { Tienda } from '../../models/tienda.model';
import {  RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { ColorService } from '../../services/color.service';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any;
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
  @Output() onVerDetalles = new EventEmitter<any>();

  user!: Usuario;
  isUserLogged = false;
  isProductAdded = false;
  tiendaSelected: Tienda | null = null;
  tiendaNameSelected!: string;
  img: string | null = '../assets/images/no-image.jpg';

  public colores: any = [];
  public color_to_cart!:string;
  public productoId!:any;
  // productSelected = signal<any>(null);

  private carritoService = inject(CarritoService);
  private _colorService = inject(ColorService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
    if (!this.product?.img) {
  this.img = '../assets/images/no-image.jpg';
}
  }


  addItem(producto: Producto) {
      this.productoId = producto._id;
      this._colorService.colorByProduct(this.productoId).subscribe(
        response => {
          this.colores = response;
          this.color_to_cart = this.colores[0]?.color || '#333333';
          let data = {
            ...producto,
            color: this.color_to_cart,
          }
          this.carritoService.addItem(data);
          this.toastr.success('Artículo agregado al carrito');
        },
      );
  }

  openPaymentsModal(product: any): void {
    this.productSelected.emit(product);
  }

  closeAviso() {
    this.isUserLogged = false;
    this.isProductAdded = false;
  }

    verDetalles() {
    // Le enviamos este producto al componente padre
    this.onVerDetalles.emit(this.product);
  }


}
