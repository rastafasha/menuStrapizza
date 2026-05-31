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
import { Title } from '@angular/platform-browser';

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
  private titleService = inject(Title);

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
          this.titleService.setTitle(`Zlipmenu | ${tienda.nombre}`);
          this.configurarCategoriasFiltro(tienda);

          this.configurarManifestDinamico(tienda);
          // 🌟 INYECCIÓN DE CSS DINÁMICO SAAS AQUÍ:
        // Si el restaurante VIP guardó estilos exclusivos en el CRM, se aplican en caliente
        if (tienda.css_personalizado) {
          const estilo = document.createElement('style');
          estilo.id = 'css-dinamico-tienda'; // Le ponemos un ID para poder identificarlo
          estilo.innerHTML = tienda.css_personalizado;
          document.head.appendChild(estilo);
        }
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
  // 🌟 CORRECCIÓN MAESTRA SAAS:
  // Si 'categoria' es un objeto y tiene slug, lo usamos. 
  // Si viene solo el ID en String, usamos el subcategory o el propio slug de la tienda como fallback
  if (tienda.categoria && typeof tienda.categoria === 'object' && (tienda.categoria as any).slug) {
    this.categoriaPrincipal = (tienda.categoria as any).slug;
  } else {
    // Si viene solo el ID string, usamos la subcategoría limpia o el slug de la tienda
    this.categoriaPrincipal = tienda.subcategoria === 'hamburgueseria' ? 'hamburguesa' : (tienda.slug || 'pizzeria');
  }

  console.log('Filtrando el catálogo superior con el slug de categoría:', this.categoriaPrincipal);

  // Ajustamos los bloques inferiores dinámicos para este restaurante
  if (this.categoriaPrincipal === 'hamburguesa') {
    this.categoriasAdicionales = [
      { id: '1', nombre: 'entradas' },
      { id: '2', nombre: 'combos' },
      { id: '3', nombre: 'bebidas' }
    ];
  } else {
    this.categoriasAdicionales = [
      { id: '1', nombre: 'pastas' },
      { id: '2', nombre: 'pizza' },
      { id: '3', nombre: 'bebidas' },
      { id: '4', nombre: 'postres' }
    ];
  }
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

  // 🧼 Limpieza de seguridad de estilos inyectados
  const estiloPrevio = document.getElementById('css-dinamico-tienda');
  if (estiloPrevio) {
    estiloPrevio.remove(); // Borra el CSS del head al salir del menú del restaurante
  }
}

private configurarManifestDinamico(tienda: any) {
  
  // 🌟 CORRECCIÓN DE RUTAS PÚBLICAS DE ANGULAR:
  // Eliminamos el prefijo 'src/' porque en producción la carpeta 'assets' queda expuesta en la raíz pública
  const icono72 = 'assets/icons/icon-72x72.png';
  const icono96 = 'assets/icons/icon-96x96.png';
  const icono128 = 'assets/icons/icon-128x128.png';
  const icono144 = 'assets/icons/icon-144x144.png';
  const icono152 = 'assets/icons/icon-152x152.png';
  const icono192 = 'assets/icons/icon-192x192.png';
  const icono384 = 'assets/icons/icon-384x384.png';
  const icono512 = 'assets/icons/icon-512x512.png';

  // Armamos el objeto manifest en caliente con las rutas públicas oficiales
  const miManifestDinamico = {
    name: tienda.nombre || 'Zlipmenu',
    short_name: tienda.nombre || 'Zlipmenu',
    theme_color: tienda.color_primario || '#e74c3c',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    // Usamos el origen actual de la URL dinámica
    start_url: window.location.origin + '/', 
    icons: [
      {
        src: icono72,
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono96,
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono128,
        sizes: "128x128",
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono144,
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono152,
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono384,
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: icono512,
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };

  // Convertimos el objeto manifest en un archivo Blob de memoria
  const stringManifest = JSON.stringify(miManifestDinamico);
  const blobManifest = new Blob([stringManifest], { type: 'application/json' });
  const urlManifest = URL.createObjectURL(blobManifest);

  // Inyectamos el manifest limpio en el HTML
  const etiquetaManifest = document.getElementById('pwa-manifest') as HTMLLinkElement;
  if (etiquetaManifest) {
    etiquetaManifest.href = urlManifest;
    console.log('¡Manifest PWA con iconos locales validado con éxito para:', tienda.nombre);
  }
}



}

