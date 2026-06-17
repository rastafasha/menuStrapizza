import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { ReservaCrearComponent } from '../../pages/myaccount/reserva/reserva-crear/reserva-crear.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalInicialComponent } from '../modal-inicial/modal-inicial.component';

@Component({
  selector: 'app-hero',
  imports: [RouterModule, CommonModule, NgStyle, ReservaCrearComponent, TranslatePipe, ModalInicialComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {

  isLogued: boolean = false;
  public activeLang = 'es';
    flag = false;
    is_visible: boolean = false;
    langs: string[] = [];

  tiendaSelected: Tienda | null = null;
  private tiendaSubscription!: Subscription;
  private tiendasService = inject(TiendaService);
  constructor(
    // Debe ser public para que el HTML pueda leer "translate.currentLang"
    public translate: TranslateService
  ) { }

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

  obtenerTextoPrevio(_lang?: any): string {
    // Detectamos el idioma actual del sistema ('en' o 'es')

    const lang = this.translate.currentLang() === 'en' ? 'en' : 'es';

    // 1. Prioridad máxima al texto del CRM usando el idioma activo
    if (this.tiendaSelected?.texto_hero_uno) {
      return this.tiendaSelected.texto_hero_uno[lang] || this.tiendaSelected.texto_hero_uno.es || '';
    }

    // 2. Fallback inteligente según el rubro de la tienda
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    if (rubro === 'panaderia' || rubro === 'pasteleria' || rubro === 'hamburgueseria') {
      // Si estás en inglés puedes poner el fallback en inglés también
      return lang === 'en' ? 'Delights' : 'Delicias';
    }

    return lang === 'en' ? 'The Best' : 'Las Mejores';
  }

  obtenerTextoDestacado(_lang?: any): string {
    // Detectamos si el idioma actual del sistema es inglés
    const isEnglish = this.translate.currentLang() === 'en';

    // 1. Prioridad máxima al texto personalizado del CRM en el idioma correcto
    if (this.tiendaSelected?.texto_hero_destacado) {
      return isEnglish
        ? (this.tiendaSelected.texto_hero_destacado.en || this.tiendaSelected.texto_hero_destacado.es || '')
        : (this.tiendaSelected.texto_hero_destacado.es || '');
    }

    // 2. Fallback inteligente traducido según el rubro de la tienda
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    if (rubro === 'panaderia' || rubro === 'pasteleria' || rubro === 'hamburgueseria') {
      return isEnglish ? 'Fresh ones' : 'Frescas';
    }

    return isEnglish ? 'Pizzas' : 'Pizzas'; // 'Pizzas' se escribe igual en ambos idiomas
  }

  obtenerTextoPost(_lang?: any): string {
    // Detectamos si el idioma actual del sistema es inglés
    const isEnglish = this.translate.currentLang() === 'en';

    // 1. Prioridad máxima al texto personalizado del CRM en el idioma correcto
    if (this.tiendaSelected?.texto_hero_dos) {
      return isEnglish
        ? (this.tiendaSelected.texto_hero_dos.en || this.tiendaSelected.texto_hero_dos.es || '')
        : (this.tiendaSelected.texto_hero_dos.es || '');
    }

    // 2. Fallback inteligente traducido según el rubro de la tienda
    const rubro = this.tiendaSelected?.subcategoria?.toLowerCase().trim() || '';
    if (rubro === 'panaderia' || rubro === 'pasteleria' || rubro === 'hamburgueseria') {
      return isEnglish ? 'every Day' : 'cada Día';
    }

    return isEnglish ? 'in Town' : 'de la Ciudad';
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

    // 🌐 Función para alternar el idioma con el Switch
setLanguage(lang: 'es' | 'en') {
  // Asignamos el idioma seleccionado de forma directa
  this.activeLang = lang;
  
  // Actualizamos el flag booleano por si lo sigues usando en la vista (true para 'en')
  this.flag = (lang === 'en'); 

  // Ejecutamos el cambio en la librería ngx-translate
  this.translate.use(lang);
  
  // Guardamos la preferencia en el almacenamiento local
  localStorage.setItem('lang', lang);
}



}
