import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TrackByFunction } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Categoria } from '../../models/categoria.model';
import { Producto } from '../../models/producto.model';
import { Tienda } from '../../models/tienda.model';
import { CategoriasPipePipe } from '../../pipes/categorias-pipe.pipe';
import { CategoryService } from '../../services/category.service';
import { ProductoService } from '../../services/product.service';
import { TiendaService } from '../../services/tienda.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ModalproductComponent } from '../modalproduct/modalproduct.component';
import { ProductItemComponent } from '../product-item/product-item.component';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from '../../models/usuario.model';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { CarritoService } from '../../services/carrito.service';
import { ColorService } from '../../services/color.service';
import { RatingStarComponent } from '../ratingStar/ratingStar.component';
import { SolicitudService } from '../../services/solicitud.service';
declare var bootstrap: any;

@Component({
  selector: 'app-products-bajo-pedido',
   imports: [
    CommonModule,
    RouterModule,
    ImagenPipe,
    RatingStarComponent
  ],
  templateUrl: './products-bajo-pedido.component.html',
  styleUrl: './products-bajo-pedido.component.scss'
})
export class ProductsBajoPedidoComponent {

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

  private solicitudService = inject(SolicitudService);
  private _colorService = inject(ColorService);
  private toastr = inject(ToastrService);
  constructor(
  // Debe ser public para que el HTML pueda leer "translate.currentLang"
  public translate: TranslateService 
) {}

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
          this.solicitudService.addItem(data);
          this.toastr.success('Artículo agregado al pedido');
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
