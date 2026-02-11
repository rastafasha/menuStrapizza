
import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {

@Input()tiendaSelected:any;
tiendas: Tienda[] = [];
  tienda!: Tienda;
  nombreSelected = environment.nombreSelected;
  tiendaNameSelected!:string;

private tiendaService = inject(TiendaService);
private tiendaSubscription!: Subscription;

  ngOnInit(){
    this.nombreSelected;
    // Use cached observable to avoid redundant API calls
    this.tiendaSubscription = this.tiendaService.getTiendaByNameCached(this.nombreSelected).subscribe(tienda => {
      this.tiendaSelected = tienda;
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }
}
