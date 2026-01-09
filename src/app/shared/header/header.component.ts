import { Component, inject } from '@angular/core';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, ReactiveFormsModule,
    FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  totalList : number = 0;
   tiendas: Tienda[] = [];
  tienda!:Tienda;
  tiendaSelected!:Tienda;
   bandejaList: any[] = [];

   year: number = new Date().getFullYear();
    public user!: Usuario;

  private tiendaService = inject(TiendaService);


   ngOnInit(): void {
     let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
    
    this.loadBandejaListFromLocalStorage();
      this.getTiendas();
      this.setTiendaDefault();
    }

      loadBandejaListFromLocalStorage() {
    const storedItems = localStorage.getItem('bandejaItems');
    if (storedItems) {
      this.bandejaList = JSON.parse(storedItems);
      //contamos el total de items
      this.totalList = this.bandejaList.length;

    }
  }

    getTiendas(){
    this.tiendaService.cargarTiendas().subscribe((resp: Tienda[]) => {
      // Asignamos el array filtrado directamente
      this.tiendas = resp.filter((tienda: Tienda) => tienda.categoria && tienda.categoria.nombre=== 'Alimentos');
      // console.log(this.tiendas);

      setTimeout(()=>{
        this.setTiendaDefault();
      },1000)

    })
  }

 

  setTiendaDefault(){
    // Check if default tienda has already been set
    if (localStorage.getItem('defaultTiendaSet')) return;

    // Set default tiendaSelected to "Panaderia SlideDish" if not already set
    if (!this.tiendaSelected) {
      const defaultTienda = this.tiendas.find(tienda => tienda.nombre === 'Strapizza');
      if (defaultTienda) {
        this.tiendaSelected = defaultTienda;
        this.tiendaService.setSelectedTienda(this.tiendaSelected);
        localStorage.setItem('tiendaSelected', JSON.stringify(this.tiendaSelected.subcategoria));
        localStorage.setItem('defaultTiendaSet', 'true');
      }
    }
  }


   onSelectStore(tienda:any){
    this.tiendaSelected = tienda;
    this.tiendaService.setSelectedTienda(this.tiendaSelected);
    this.tiendaService.getTiendaById(this.tiendaSelected._id).subscribe((resp:any)=>{
      // console.log(this.tiendaSelected.subcategoria);
      localStorage.setItem('tiendaSelected', JSON.stringify(this.tiendaSelected.subcategoria));

    })
  }


  get iconBagColorClass(): string {
    const colors = ['icon-bag-red', 'icon-bag-black', 'icon-bag-yellow'];
    if(this.totalList > 0){
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
