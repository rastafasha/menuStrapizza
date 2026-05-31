import { NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';

@Component({
  selector: 'app-hero',
  imports: [RouterModule, NgIf],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {

  isLogued: boolean = false;

  tiendaSelected: Tienda | null = null;
  private tiendaSubscription!: Subscription;
  private tiendasService = inject(TiendaService);

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.isLogued = USER ? true : false;

    // Escuchamos de forma reactiva la tienda que resolvió el subdominio de la URL [1]
    this.tiendaSubscription = this.tiendasService.selectedTiendaObservable$.subscribe(tienda => {
      this.tiendaSelected = tienda;
    });
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }


   // ==========================================
  // LÓGICA DE FALLBACKS PARA MARCAS HISTÓRICAS
  // ==========================================

  obtenerTextoPrevio(): string {
    // 1. Si el usuario personalizó el texto en el CRM, tiene prioridad máxima
    if (this.tiendaSelected?.texto_hero_uno) return this.tiendaSelected.texto_hero_uno;
    
    // 2. Fallback inteligente según el rubro de la tienda
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    if (rubro === 'panaderia' || rubro === 'pasteleria' || rubro === 'hamburgueseria') {
      return 'Delicias';
    }
    return 'Las Mejores'; // Caso por defecto (Pizzerías o generales)
  }

  obtenerTextoDestacado(): string {
    if (this.tiendaSelected?.texto_hero_destacado) return this.tiendaSelected.texto_hero_destacado;
    
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    if (rubro === 'panaderia' || rubro === 'pasteleria' || rubro === 'hamburgueseria') {
      return 'Frescas';
    }
    return 'Pizzas';
  }

  obtenerTextoPost(): string {
    if (this.tiendaSelected?.texto_hero_dos) return this.tiendaSelected.texto_hero_dos;
    
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    if (rubro === 'panaderia' || rubro === 'pasteleria' || rubro === 'hamburgueseria') {
      return 'cada Día';
    }
    return 'de la Ciudad';
  }

  obtenerImagenPorDefecto(): string {
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    
    // Filtramos la imagen de marcador de posición (placeholder) por tipo de negocio
    if (rubro === 'panaderia' || rubro === 'pasteleria') {
      return 'assets/images/croisant.png';
    }
    if (rubro === 'hamburgueseria' || rubro === 'fastfood') {
      return 'assets/images/hamburguesa.png';
    }
    // Imagen de respaldo global por si el rubro es nuevo o es una pizzería
    return 'assets/images/pizza-queso.png';
  }

}
