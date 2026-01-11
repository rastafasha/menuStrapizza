
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent  {

@Input()tiendaSelected:any;
tiendas: Tienda[] = [];
  tienda!: Tienda;
  nombreSelected = 'Strapizza';

private tiendaService = inject(TiendaService);

  ngOnInit(){

    this.getTiendas();
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
    // Check if default tienda has already been set
    // if (localStorage.getItem('defaultTiendaSet')) return;

    // Set default tiendaSelected to "Panaderia SlideDish" if not already set
    const defaultTienda = this.tiendas.find(tienda => tienda.nombre === this.nombreSelected);
    this.tiendaSelected = defaultTienda;
    // console.log(defaultTienda)
  }

}
