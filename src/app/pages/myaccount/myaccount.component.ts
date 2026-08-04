
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { HeaderComponent } from "../../shared/header/header.component";
import { environment } from '../../../environments/environment';
import { CommonModule, NgIf } from '@angular/common';
import { MenuFooterComponent } from "../../shared/menu-footer/menu-footer.component";
import { PushNotificationService } from '../../services/push-notification.service';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';

@Component({
  selector: 'app-myaccount',
  imports: [
    RouterModule,
    NgIf,
    HeaderComponent,
    MenuFooterComponent,
    CommonModule,
    TranslatePipe
],
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss'],
})
export class MyaccountComponent implements OnInit {

  identity!: Usuario;
  imagenSerUrl = environment.mediaUrl;
  public isLoading:boolean = false;
  user_id:any;
  
  public activeLang = 'es';
    flag = false;
    is_visible: boolean = false;
    langs: string[] = [];
    tiendaSelected!:Tienda;

  constructor(
    public router: Router,
    public http: HttpClient,
    private usuarioService: UsuarioService,
    private tiendaService: TiendaService,
    public activatedRoute: ActivatedRoute,
    public pushService: PushNotificationService,
    public toastr: ToastrService,
    public translate: TranslateService,
    handler: HttpBackend
  ) {
    this.http = new HttpClient(handler);

     // 1. Detectar idioma: Primero localStorage, si no, el navegador, y si no, 'es'
    const browserLang = this.translate.getBrowserLang(); // Jala 'en', 'es', etc.
    const savedLang = localStorage.getItem('lang') || browserLang || 'es';

    // Nos aseguramos de soportar solo los idiomas que tienes listos (ej: es y en)
    this.activeLang = savedLang.match(/es|en/) ? savedLang : 'es';

    // 2. Activar el idioma correspondiente (Ya no se usa setDefaultLang aquí)
    this.translate.use(this.activeLang);
  }

  ngOnInit(): void {
    window.scrollTo(0,0);

    let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
      this.user_id = this.identity.uid;
      this.getUser()
    }else{
     this.router.navigateByUrl('/login');
    }
    // 1. Comenzamos a escuchar el observable del servicio
    this.escucharTiendaActiva();

    // 2. Disparamos la petición inicial (usa el slug automático 'pizzeria')
    // Esto llenará el BehaviorSubject interno de tu servicio
    this.tiendaService.getTiendaByNameCached().subscribe();
  }

  logout(){
    this.usuarioService.logout()
  }

   getUser(){
    this.usuarioService.get_user(this.user_id).subscribe((resp:any)=>{
      this.identity = resp.usuario;
      // console.log(this.identity)
     
    })
  }

  escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      // Al principio será null, pero en cuanto getTiendaByNameCached responda, 
      // el tap del servicio emitirá la tienda real aquí.
      if (tienda) {
        this.tiendaSelected = tienda;
        
      }
    });
}

  


  async togglePush() {
    this.pushService.isProcessing$.next(true); // Activa el cargando

    try {
      const estaSuscrito = this.pushService.isSubscribed$.value;
      if (estaSuscrito) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          // Llamada opcional a tu backend para limpiar
          this.pushService.setSubscriptionStatus(false);
        }
      } else {
        await this.pushService.subscribeToNotifications();
      }
    } finally {
      this.pushService.isProcessing$.next(false); // Desactiva el cargando
    }
  }

  

  // 🌐 Función para alternar el idioma con el Switch
toggleLanguageSwitch(event: Event) {
  const input = event.target as HTMLInputElement;
  
  // Si está marcado (true) cambiamos a inglés ('en'), si no, a español ('es')
  this.activeLang = input.checked ? 'en' : 'es';
  
  // Actualizamos el flag por si lo usas en otra parte de la vista
  this.flag = input.checked; 

  // Ejecutamos el cambio en la librería ngx-translate
  this.translate.use(this.activeLang);
  
  // Guardamos la preferencia en el almacenamiento local
  localStorage.setItem('lang', this.activeLang);
}




}
