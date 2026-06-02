import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RedesSociales, Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { Subscription } from 'rxjs';
import { NgFor, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, NgFor, NgIf, NgStyle],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {

  // Mantenemos el @Input por si viene del padre, pero priorizamos la escucha reactiva
  @Input() tiendaSelected: any = null;
  tiendas: Tienda[] = [];
  tienda!: Tienda;
  redssociales: RedesSociales[] = [];

  private tiendaService = inject(TiendaService);
  private tiendaSubscription!: Subscription;

  ngOnInit() {
    // 🌟 CORRECCIÓN SAAS: Nos conectamos al flujo central del subdominio de internet
    this.tiendaSubscription = this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        try {
          // Procesamiento seguro de redes sociales (soporta String JSON o Array nativo de MongoDB)
          this.redssociales = tienda.redssociales && typeof tienda.redssociales === 'string' 
            ? JSON.parse(tienda.redssociales) 
            : (tienda.redssociales || []);
        } catch (e) {
          console.error('Error al procesar el JSON de redes sociales en el footer:', e);
          this.redssociales = [];
        }
        console.log('FooterComponent actualizó sus redes sociales con éxito:', this.redssociales);
      }
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }
}
