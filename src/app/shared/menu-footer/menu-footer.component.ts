import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';
import { Usuario } from '../../models/usuario.model';
import { CarritoService } from '../../services/carrito.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu-footer',
  imports:[RouterModule, CommonModule],
  templateUrl: './menu-footer.component.html',
  styleUrls: ['./menu-footer.component.scss']
})
export class MenuFooterComponent {

    totalList: number = 0;
    tiendas: Tienda[] = [];
    tienda!: Tienda;
    tiendaSelected!: Tienda;
    bandejaList: any[] = [];
  
    year: number = new Date().getFullYear();
    nombreSelected = environment.nombreSelected;
    public user!: Usuario;
  
    private carritoService = inject(CarritoService);
    private cartSubscription!: Subscription;
  
    ngOnInit(): void {
      let USER = localStorage.getItem("user");
      this.user = USER ? JSON.parse(USER) : null;
  
      // Subscribe to cart changes
      this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
        this.bandejaList = items;
        this.totalList = items.length;

      });
    }
  
    ngOnDestroy(): void {
      if (this.cartSubscription) {
        this.cartSubscription.unsubscribe();
      }
    }
  
  
  
    openMenu() {
      const menuLateral = document.getElementsByClassName("sidemenu");
      for (let i = 0; i < menuLateral.length; i++) {
        menuLateral[i].classList.add("active");
      }
    }

}
