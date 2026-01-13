
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
  tiendaNameSelected!:string;

private tiendaService = inject(TiendaService);

  ngOnInit(){

    let TIENDA = localStorage.getItem("tiendaSelected");
     this.tiendaNameSelected = TIENDA ? JSON.parse(TIENDA) : null;

      this.tiendaService.getTiendaByName(this.tiendaNameSelected).subscribe(tienda => {
       this.tiendaSelected = tienda;
      //  console.log(this.tiendaNameSelected)
    });
  }


}
