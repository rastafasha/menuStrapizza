import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';
import { Usuario } from '../../models/usuario.model';
import { CarritoService } from '../../services/carrito.service';
import { TiendaService } from '../../services/tienda.service';
import { environment } from '../../environments/environment';

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
  
    private tiendaService = inject(TiendaService);
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
  
      // this.getTiendas();
      // this.setTiendaDefault();
    }
  
    ngOnDestroy(): void {
      if (this.cartSubscription) {
        this.cartSubscription.unsubscribe();
      }
    }
  
    getTiendas() {
      this.tiendaService.cargarTiendas().subscribe((resp: Tienda[]) => {
        // Asignamos el array filtrado directamente
        this.tiendas = resp.filter((tienda: Tienda) => tienda.categoria && tienda.categoria.nombre === 'Alimentos');
        // console.log(this.tiendas);
  
        setTimeout(() => {
          this.setTiendaDefault();
        }, 1000)
  
      })
    }
  
  
  
    setTiendaDefault() {
      // Check if default tienda has already been set
      if (localStorage.getItem('defaultTiendaSet')) return;
  
      // Set default tiendaSelected to "Panaderia SlideDish" if not already set
      if (!this.tiendaSelected) {
        const defaultTienda = this.tiendas.find(tienda => tienda.nombre === this.nombreSelected);
        
        if (defaultTienda) {
          this.tiendaSelected = defaultTienda;
          this.tiendaService.setSelectedTienda(this.tiendaSelected);
          localStorage.setItem('tiendaSelected', JSON.stringify(this.tiendaSelected.subcategoria));
          localStorage.setItem('defaultTiendaSet', 'true');
        }
      }
    }
  
  
    onSelectStore(tienda: any) {
      this.tiendaSelected = tienda;
      this.tiendaService.setSelectedTienda(this.tiendaSelected);
      this.tiendaService.getTiendaById(this.tiendaSelected._id).subscribe((resp: any) => {
        // console.log(this.tiendaSelected.subcategoria);
        localStorage.setItem('tiendaSelected', JSON.stringify(this.tiendaSelected.subcategoria));
  
      })
    }
  
  
    get iconBagColorClass(): string {
      const colors = ['icon-bag-red', 'icon-bag-black', 'icon-bag-yellow'];
      if (this.totalList > 0) {
        return colors[this.totalList % colors.length];
      }
      return '';
    }
  
    openMenu() {
      const menuLateral = document.getElementsByClassName("sidemenu");
      for (let i = 0; i < menuLateral.length; i++) {
        menuLateral[i].classList.add("active");
      }
    }

}
