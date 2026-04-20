
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RedesSociales, Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, NgFor, NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {

@Input()tiendaSelected:any;
tiendas: Tienda[] = [];
  tienda!: Tienda;
  nombreSelected = environment.nombreSelected;
  tiendaNameSelected!:string;
  redssociales: RedesSociales[] = [];

private tiendaService = inject(TiendaService);
private tiendaSubscription!: Subscription;

  ngOnInit(){
    this.nombreSelected;
    // Use cached observable to avoid redundant API calls
    this.tiendaSubscription = this.tiendaService.getTiendaByNameCached(this.nombreSelected).subscribe(tienda => {
      this.tiendaSelected = tienda;
      try {
        this.redssociales = tienda?.redssociales && typeof tienda.redssociales === 'string' 
          ? JSON.parse(tienda.redssociales) 
          : (tienda?.redssociales || []);
      } catch (e) {
        console.error('Invalid JSON in redssociales:', this.tiendaSelected.redssociales);
        this.redssociales = [];
      }
      // console.log(this.redssociales)
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }
}
