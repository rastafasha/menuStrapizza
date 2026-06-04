import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { CasProductsComponent } from "../../components/cas-products/cas-products.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { MenuFooterComponent } from '../../shared/menu-footer/menu-footer.component';
import { Usuario } from '../../models/usuario.model';
import { NgIf } from '@angular/common';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { PwaNotifInstallerComponent } from '../../shared/pwa-notif-installer/pwa-notif-installer.component';
import { ModalInicialComponent } from '../../components/modal-inicial/modal-inicial.component';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { CatAdicionalesComponent } from '../../components/cat-adicionales/cat-adicionales.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    CasProductsComponent,
    HeroComponent, FooterComponent,
    MenuFooterComponent, NgIf,
    LoadingComponent,
    PwaNotifInstallerComponent,
    ModalInicialComponent,
    CatAdicionalesComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() msm_success_value: boolean = false;

  user!: any;
  isLoading = false;
  isVisible = false;
  activeCategory!: string;
  categoriaPrincipal: string = 'all';

  // Variables dinámicas para el control del inquilino (Tenant)
  tiendaSelected: Tienda | null = null;
  categoriasAdicionales: Array<{ id: string, nombre: string }> = [];
  private tiendaSubscription!: Subscription;

  categoriaActiva: string = '';

  // Inyección del servicio de tiendas optimizado por URL
  private tiendasService = inject(TiendaService);
  private titleService = inject(Title);
  private authService = inject(AuthService);

  // Event emitter for refreshing cas-products
  @Output() refreshCasProducts: EventEmitter<void> = new EventEmitter<void>();

 ngOnInit() {
    this.isLoading = true;
    this.user = this.authService.getLocalStorage();
  this.cargarDatosTiendaPorSubdominio();
    
  }
  // TU FUNCIÓN NATIVA CORREGIDA CON LOS DOS ENDPOINTS CLAROS:
  private cargarDatosTiendaPorSubdominio() {
    this.isLoading = true;

    // 1. Capturamos el host del navegador (ej: pizzeria.onrender.com o localhost)
    const host = window.location.hostname.toLowerCase().trim();
    const primerSegmento = host.split('.')[0]; // Captura 'pizzeria', 'hamburguesa', etc.

    // 2. DICCIONARIO PARA LAS TIENDAS (Siempre en minúsculas y limpio para la URL de tiendas)
    let nombreTiendaReal = 'pizzeria'; // Fallback por si estás en localhost
    if (primerSegmento !== 'localhost' && primerSegmento !== '127') {
      nombreTiendaReal = primerSegmento;
    }

    // 3. DICCIONARIO PARA LAS CATEGORÍAS (Para traducir al texto exacto que pide el endpoint de platos)
    const mapaCategorias: { [key: string]: string } = {
      'pizzeria': 'Pizzería',
      'hamburguesa': 'Hamburguesa',
      'hamburgueseria': 'Hamburguesa',
      'panaderia': 'Panadería',
      'slidedish': 'Panadería',
      'churros': 'Churros'
    };

    // console.log(`📡 Buscando tienda en la API con el slug: ${nombreTiendaReal}`);

    // 4. Invocamos tu servicio de tiendas original pasándole el parámetro plano en minúsculas
    // URL resultante: https://back-ecomm-mall.onrender.com/api/tiendas/by_nombre/nombre/pizzeria
    this.tiendaSubscription = this.tiendasService.getTiendaByNameCached(nombreTiendaReal).subscribe({
      next: (tienda: any) => {
        this.tiendaSelected = tienda;

        if (tienda) {
          // 🌟 ASIGNACIÓN MAESTRA: Asignamos el término con el acento correcto para los productos
          // URL resultante en cas-products: .../category_by_nombre/nombre/Pizzería
          this.categoriaActiva = mapaCategorias[nombreTiendaReal] || tienda.categoria?.nombre || 'Pizzería';

          this.titleService.setTitle(`Zlipmenu | ${tienda.nombre || nombreTiendaReal}`);
          
          if (typeof (this as any).configurarCategoriasFiltro === 'function') {
            (this as any).configurarCategoriasFiltro(tienda);
          }

          // 🎨 INYECCIÓN DE CSS DINÁMICO SAAS INTACTO
          const estiloPrevio = document.getElementById('css-dinamico-tienda');
          if (estiloPrevio) estiloPrevio.remove();

          if (tienda.css_personalizado) {
            const estilo = document.createElement('style');
            estilo.id = 'css-dinamico-tienda'; 
            estilo.innerHTML = tienda.css_personalizado;
            document.head.appendChild(estilo);
          }
        } else {
          // Fallback por si la respuesta viene vacía en tus pruebas locales
          this.categoriaActiva = mapaCategorias[nombreTiendaReal] || 'Pizzería';
        }

        this.isLoading = false;
        // console.log(`✅ Tienda encontrada. Categoria asignada a los productos: ${this.categoriaActiva}`);
      },
      error: (err) => {
        console.error('Error al obtener la tienda por subdominio:', err);
        this.isLoading = false;
      }
    });
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
    // 1. Armamos el objeto manifest en caliente con los datos vivos de la BD
    const miManifestDinamico = {
      name: tienda.nombre || 'Zlipmenu',
      short_name: tienda.nombre || 'Zlipmenu',
      theme_color: tienda.color_primario || '#333',
      background_color: '#fafafa',
      display: 'standalone',
      orientation: 'portrait',
      start_url: './',
      scope: './',
      icons: [

        // {
        // Usamos el logo que el restaurante subió a Cloudinary como icono de la App
        //   src: tienda.img || 'assets/icons/icon-72x72.png',
        //   sizes: '72x72',
        //   type: 'image/png',
        //   purpose: 'any maskable'
        // },
        {
          src: 'assets/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: 'assets/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    // 2. Convertimos el objeto en un archivo Blob de texto plano en memoria
    const stringManifest = JSON.stringify(miManifestDinamico);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const urlManifest = URL.createObjectURL(blob);

    // 3. Reemplazamos el manifest estático por nuestra versión viva
    const etiquetaManifest = document.getElementById('pwa-manifest') as HTMLLinkElement;
    if (etiquetaManifest) {
      etiquetaManifest.href = urlManifest;
      console.log('¡Manifest PWA actualizado dinámicamente para:', tienda.nombre);
    }
  }


}

