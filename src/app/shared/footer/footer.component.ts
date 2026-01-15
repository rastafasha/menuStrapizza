
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { environment } from '../../environments/environment';

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
  nombreSelected = environment.nombreSelected;
  tiendaNameSelected!:string;

private tiendaService = inject(TiendaService);

  ngOnInit(){
    this.nombreSelected;
      this.tiendaService.getTiendaByName(this.nombreSelected).subscribe(tienda => {
       this.tiendaSelected = tienda;
      //  console.log(this.tiendaNameSelected)
    });
  }


}
