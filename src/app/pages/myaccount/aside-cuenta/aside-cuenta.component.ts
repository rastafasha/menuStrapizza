import { Component, Input, OnInit } from '@angular/core';
import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Tienda } from '../../../models/tienda.model';
import { TiendaService } from '../../../services/tienda.service';

@Component({
  selector: 'app-aside-cuenta',
  imports:[
    CommonModule,
    RouterModule,
    TranslatePipe

  ],
  templateUrl: './aside-cuenta.component.html',
  styleUrls: ['./aside-cuenta.component.scss']
})
export class AsideCuentaComponent implements OnInit {

  @Input() isNotvisible:boolean =false;
  public url!:string;
  public identity!: Usuario;
  tiendaSelected!:Tienda;

  public activeLang = 'es';
    flag = false;
    is_visible: boolean = false;
    langs: string[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private translate: TranslateService,
    private tiendaService: TiendaService,
    
  ) {
    let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }

      // 1. Detectar idioma: Primero localStorage, si no, el navegador, y si no, 'es'
    const browserLang = this.translate.getBrowserLang(); // Jala 'en', 'es', etc.
    const savedLang = localStorage.getItem('lang') || browserLang || 'es';

    // Nos aseguramos de soportar solo los idiomas que tienes listos (ej: es y en)
    this.activeLang = savedLang.match(/es|en/) ? savedLang : 'es';

    // 2. Activar el idioma correspondiente (Ya no se usa setDefaultLang aquí)
    this.translate.use(this.activeLang);
   }

  ngOnInit(): void {
    // 1. Comenzamos a escuchar el observable del servicio
    this.escucharTiendaActiva();

    // 2. Disparamos la petición inicial (usa el slug automático 'pizzeria')
    // Esto llenará el BehaviorSubject interno de tu servicio
    this.tiendaService.getTiendaByNameCached().subscribe();
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

  slir(){
    this.usuarioService.logout()
  }

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
