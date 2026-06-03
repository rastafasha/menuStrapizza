import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Producto } from '../../../models/producto.model';
import { FavoritoService } from '../../../services/favorito.service';
import { UsuarioService } from '../../../services/usuario.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { AuthService } from '../../../services/auth.service';
import { MenuFooterComponent } from '../../../shared/menu-footer/menu-footer.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { ToastrService } from 'ngx-toastr';
import { SelectorService } from '../../../services/selector.service';
import { CarritoService } from '../../../services/carrito.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterModule, LoadingComponent,
    ImagenPipe, MenuFooterComponent, HeaderComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  public usuario: any;
  public productos!: Producto;
  public favoritos: any = [];
  public isLoading = false;
  public msm_success_fav = false;
  tienda_moneda!: string;
  selectedProduct!: Producto;

  public msm_error = false;
  public msm_success = false;
  public msm_alert = false;
  public selector_to_cart = ' ';
  public selector_error = false;
  public selectores: any = [];
  
  constructor(
    private http: HttpClient,
    public favoritosService: FavoritoService,
    public usuarioService: UsuarioService,
    public activatedRoute: ActivatedRoute,
    public authService: AuthService,
    public selectorService: SelectorService,
    public carritoService: CarritoService,
    public toastr: ToastrService,
    handler: HttpBackend
  ) {
    this.http = new HttpClient(handler);
  }

  ngOnInit(): void {

    window.scrollTo(0, 0);
    this.usuario = this.authService.getLocalStorage();
    this.getFavoritos();
  }

  getFavoritos() {
    this.isLoading = true;
    this.favoritosService.listarFaoritosporUsuario(this.usuario.uid).subscribe((resp: any) => {
      this.favoritos = resp.favoritos;
      this.isLoading = false;
    })
  }

  removeFavorito(_id: string) {
    this.favoritosService.eliminar(_id).subscribe(
      res => {
        this.toastr.success('Favorito eliminado correctamente', 'Éxito');
        this.getFavoritos();
      }
    );
  }


  verDetalles(product: Producto) {
    this.selectedProduct = product;

    const el = document.getElementById('offcanvasProducto');
    const bsOffcanvas = new bootstrap.Offcanvas(el);
    bsOffcanvas.show();
   }


   addItem(producto: Producto) {
    this.selector_error = false;

    if (producto.subcategoria === 'Pastas') {
      // Validar que se haya seleccionado un selector
      if (!this.selector_to_cart || this.selector_to_cart === ' ') {
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
    this.toastr.success('Artículo agregado al carrito');
  }
  closeAviso() {
    this.msm_success = false;
    this.msm_alert = false;
    this.selector_error = false;
  }

}
