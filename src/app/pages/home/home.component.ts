import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { CasProductsComponent } from "../../components/cas-products/cas-products.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { MenuFooterComponent } from '../../shared/menu-footer/menu-footer.component';
import { Usuario } from '../../models/usuario.model';
import {  NgIf } from '@angular/common';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { PwaNotifInstallerComponent } from '../../shared/pwa-notif-installer/pwa-notif-installer.component';
import { ModalInicialComponent } from '../../components/modal-inicial/modal-inicial.component';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,
     CasProductsComponent,
    HeroComponent, FooterComponent, 
    MenuFooterComponent, NgIf,
    LoadingComponent,
    PwaNotifInstallerComponent,
    ModalInicialComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

 @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() msm_success_value: boolean = false;
  
  user!: Usuario;
  isLoading = false;
  isVisible = false;
  activeCategory!: string;
  categoriaPrincipal: string = 'all';
  
  // Variables dinámicas para el control del inquilino (Tenant)
  tiendaSelected: Tienda | null = null;
  categoriasAdicionales: Array<{ id: string, nombre: string }> = [];
  private tiendaSubscription!: Subscription;

  // Inyección del servicio de tiendas optimizado por URL
  private tiendasService = inject(TiendaService);

  // Event emitter for refreshing cas-products
  @Output() refreshCasProducts: EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() {
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;

    this.cargarDatosTiendaPorSubdominio();
  }

  private cargarDatosTiendaPorSubdominio() {
    this.isLoading = true;
    
    // El servicio inspecciona la URL, pide los datos a Render y los expone aquí
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached().subscribe({
      next: (tienda) => {
        this.tiendaSelected = tienda;
        
        if (tienda) {
          this.configurarCategoriasFiltro(tienda);
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener la tienda por subdominio:', err);
        this.isLoading = false;
      }
    });
  }

  

  /**
   * Define qué bloques de categorías extras se van a renderizar de forma perezosa en el HTML.
   */
  private configurarCategoriasFiltro(tienda: Tienda) {
  // 1. Detectamos el rubro principal basándonos en el nombre o categoría de la tienda
  // Si tu objeto tienda tiene la categoría en tienda.categoria.nombre, lo usamos:
  if (tienda.categoria && tienda.categoria.nombre) {
    this.categoriaPrincipal = tienda.categoria.nombre; // Ej: 'Pizzería'
  } else {
    // Fallback: Si no viene el objeto categoría, podemos deducirlo o usar el nombre
    this.categoriaPrincipal = tienda.nombre; // Ej: 'Pizzeria' o 'Hamburguesa'
  }

  // 2. Definimos las categorías de scroll inferior (las secundarias que sí te funcionan)
  this.categoriasAdicionales = [
    { id: '1', nombre: 'Entradas' },
    { id: '2', nombre: 'Combos' },
    { id: '3', nombre: 'Bebidas' },
    { id: '4', nombre: 'Postres' }
  ];
}

  onMsmSuccess(value: boolean): void {
    this.msm_success.emit(value);
  }

  onRefreshFromHeader() {
    this.isLoading = true;
    this.refreshCasProducts.emit();
    this.isLoading = false;
  }

  ngOnDestroy() {
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }
}

