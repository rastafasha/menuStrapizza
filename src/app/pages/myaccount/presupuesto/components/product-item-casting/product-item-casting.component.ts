import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Producto } from '../../../../../models/producto.model';
import { Tienda } from '../../../../../models/tienda.model';
import { Usuario } from '../../../../../models/usuario.model';
import { ImagenPipe } from '../../../../../pipes/imagen-pipe.pipe';
import { ColorService } from '../../../../../services/color.service';
import { RatingStarComponent } from '../../../../../components/ratingStar/ratingStar.component';
import { CastingService } from '../../../../../services/casting.service';
declare var bootstrap: any;
@Component({
  selector: 'app-product-item-casting',
  imports: [
    CommonModule,
    RouterModule,
    ImagenPipe,
    RatingStarComponent
  ],
  templateUrl: './product-item-casting.component.html',
  styleUrl: './product-item-casting.component.scss'
})
export class ProductItemCastingComponent {


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

  private castingService = inject(CastingService);
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
          this.castingService.addItem(data);
          this.toastr.success('Artículo agregado al presupuesto');
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
