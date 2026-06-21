import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PostalService } from '../../services/postal.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-precios-delivery',
  imports: [
    CommonModule,
    TranslatePipe
  ],
  templateUrl: './precios-delivery.component.html',
  styleUrl: './precios-delivery.component.scss'
})
export class PreciosDeliveryComponent {
@Input() tienda_moneda: any; 
  @Input() total: any; // El subtotal de las pizzas que te pasa el padre (ej: 21)
  @Input() totalAmount: any; // El subtotal de las pizzas que te pasa el padre (ej: 21)
  @Input() tiendaSelected: any; 
  @Input() listaDeliveries: any[] = []; 

  public costoDeliveryAplicado = 0;
  public totalGeneralCalculado = 0; // Variable interna para tu HTML del hijo

  // 💡 CORRECCIÓN 1: El Output correcto para enviarle el dinero final al componente Carrito Padre
  @Output() onTotalCalculado = new EventEmitter<number>();

  // 💡 ESTA ES LA FUNCIÓN CLAVE: La llamaremos desde fuera cuando el mapa se mueva
    public procesarUbicacionYCalcularPrecio(latCliente: number, lngCliente: number): void {
    if (!this.tiendaSelected) return;

    const latRestaurante = this.tiendaSelected.latitud || 10.4880;
    const lngRestaurante = this.tiendaSelected.longitud || -66.8580;

    // Fórmula Haversine (Tu lógica perfecta idéntica)
    const R = 6371;
    const dLat = (latCliente - latRestaurante) * Math.PI / 180;
    const dLng = (lngCliente - lngRestaurante) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latRestaurante * Math.PI / 180) * Math.cos(latCliente * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaRealKm = R * c;

    console.log(`Distancia calculada: ${distanciaRealKm.toFixed(2)} km`);

    let tarifaEncontrada = this.listaDeliveries.find(tarifa => {
      return distanciaRealKm <= (tarifa.distancia || tarifa.kms || 5);
    });

    if (!tarifaEncontrada && this.listaDeliveries.length > 0) {
      tarifaEncontrada = this.listaDeliveries[this.listaDeliveries.length - 1];
    }

    this.costoDeliveryAplicado = tarifaEncontrada ? (tarifaEncontrada.precio || tarifaEncontrada.monto || 0) : 0;

    // 🚀 SALVAVIDAS: Si totalAmount viene vacío, nos respaldamos con la variable 'total'
    if (!this.totalAmount || this.totalAmount === 0) {
      this.totalAmount = Number(this.total) || 0;
    }

    // =========================================================================
    // 🔒 TUS CONDICIONES PERFECTAS FORMATEADAS DE FORMA EXACTA:
    // =========================================================================
    if(this.tiendaSelected.tipoFlujo === 'WHATSAPP'){
      this.totalGeneralCalculado = Number(this.total) + Number(this.costoDeliveryAplicado);
    }
    if(this.tiendaSelected.tipoFlujo === 'POS_DIRECTO'){
      this.totalGeneralCalculado = Number(this.totalAmount) + Number(this.costoDeliveryAplicado);
    }
    // =========================================================================


    console.log(`💰 [Módulo Financiero] Total General Final del POS: $${this.totalGeneralCalculado}`);

    // Le emitimos el número limpio real al componente Carrito Padre
    this.onTotalCalculado.emit(this.totalGeneralCalculado);
  }



  

}
