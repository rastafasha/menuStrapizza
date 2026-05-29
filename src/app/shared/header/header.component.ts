import { Component, inject, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { TiendaService } from '../../services/tienda.service';
import { CarritoService } from '../../services/carrito.service';
import { Tienda } from '../../models/tienda.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { Observable, Subscription } from 'rxjs';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { environment } from '../../../environments/environment';
import { AvisoComponent } from '../aviso/aviso.component';
import { LoadingComponent } from '../loading/loading.component';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, ReactiveFormsModule,
    FormsModule, ImagenPipe, AvisoComponent, LoadingComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {

  tiendaSelected: Tienda | undefined | null;
  @Output() refreshApp: EventEmitter<void> = new EventEmitter<void>();
  totalList: number = 0;
  tiendas: Tienda[] = [];
  tienda!: Tienda;
  bandejaList: any[] = [];
  public user!: Usuario;
  img:string | null = '../assets/images/no-image.jpg';
  isLoading=false;

  year: number = new Date().getFullYear();
  nombreSelected = environment.nombreSelected;
  titleapp = environment.nombreSelected;
  

  // Pull-to-refresh tracking
  private touchStartY: number = 0;
  private touchStartX: number = 0;
  private readonly PULL_THRESHOLD = 100; // pixels needed to trigger refresh

  isReloadig=false;

   isAviso:boolean = false;
   aviso: string = 'Hala desde el header, para refrescar la pagina';

   public unreadCount$!: Observable<number>;

  private tiendaService = inject(TiendaService);
  private carritoService = inject(CarritoService);
  private cartSubscription!: Subscription;
  private tiendaSubscription!: Subscription;
   private notifService = inject(NotificacionService);
  

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndX = event.changedTouches[0].clientX;

    const deltaY = touchEndY - this.touchStartY;
    const deltaX = Math.abs(touchEndX - this.touchStartX);

    // Detect downward pull (jale hacia abajo) with minimal horizontal movement
    if (deltaY > this.PULL_THRESHOLD && deltaX < 50) {
      this.onPullRefresh();
    }
  }

  ngOnInit(): void {
    // 2. Vinculamos el flujo del servicio y disparamos la petición
    this.unreadCount$ = this.notifService.unreadCount$;
    this.notifService.cargarContador();
    // Show aviso only once on initial app start
    const avisoShown = localStorage.getItem('avisoShown');
    if (!avisoShown) {
      this.isAviso = true;
      setTimeout(() => {
        this.isAviso = false;
        localStorage.setItem('avisoShown', 'true');
      }, 3000);
    } else {
      this.isAviso = false;
    }
    
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;

    // Subscribe to cart changes
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
      this.totalList = items.length;
    });

    this.nombreSelected;
    
    // Use cached observable to avoid redundant API calls
    this.tiendaSubscription = this.tiendaService.getTiendaByNameCached(this.nombreSelected).subscribe(tienda => {
      this.tiendaSelected = tienda;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.tiendaSubscription) {
      this.tiendaSubscription.unsubscribe();
    }
  }
  
  getTiendas() {
    this.tiendaService.cargarTiendas().subscribe((resp: Tienda[]) => {
      // Asignamos el array filtrado directamente
      this.tiendas = resp.filter((tienda: Tienda) => tienda.subcategoria && tienda.subcategoria === 'Pizzería');
      // console.log(this.tiendas);

      this.setTiendaDefault();

    })
  }



  setTiendaDefault() {
    // Check if TiendaService already has a selected tienda
    const serviceTienda = this.tiendaService.getSelectedTiendaSync();
    if (serviceTienda) {
      this.tiendaSelected = serviceTienda;
      localStorage.setItem('tiendaSelected', JSON.stringify(this.tiendaSelected.nombre));
      console.log('Tienda from service:', this.tiendaSelected);
      return;
    }
  }



  get iconBagColorClass(): string {
    const colors = ['icon-bag-red', 'icon-bag-black', 'icon-bag-yellow'];
    if (this.totalList > 0) {
      return colors[this.totalList % colors.length];
    }
    return '';
  }

openMenu() {
    const menuLateral = document.getElementsByClassName("sidemenu");
    for (let i = 0; i < menuLateral.length; i++) {
      menuLateral[i].classList.add("active");
    }
  }

  onPullRefresh() {
    const headerReload = document.querySelector('.header-container');
    const logotext = document.querySelector('.logo-text');
    headerReload?.animate([{ background: '#ccc', color: '#f2f2f2' }], { duration: 300 });

    // Update title and animate logo text opacity
    this.titleapp = 'Cargando';
    if (logotext instanceof HTMLElement) {
      logotext.animate([{ opacity: '0.5' }, { opacity: '1' }], { duration: 300 });
      logotext.textContent = this.titleapp;
    }

    this.isReloadig = true;
    this.refreshApp.emit();
    location.reload();
    this.isReloadig = false;
  }
}
