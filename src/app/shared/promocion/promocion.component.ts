import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Promocion } from '../../models/promocion.model';
import { PromocionService } from '../../services/promocion.service';
import { Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';
import { TiendaService } from '../../services/tienda.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';

declare let tns: any;
declare let countdown: any;

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-promocion',
  standalone: true,
  imports: [CommonModule,
    RouterLink, ImagenPipe],
  templateUrl: './promocion.component.html',
  styleUrls: ['./promocion.component.css']
})
export class PromocionComponent implements OnInit {

  promocion: Promocion | null = null;
  isLoading: boolean = false;
  estado: boolean = false;
  dias: number = 0;
  horas: number = 0;
  minutos: number = 0;
  segundos: number = 0;
  private intervalId: any;

  promociones!: Promocion[];
  today: Date = new Date();
  currentSlide = 0;

  countdownValues: { [key: number]: { days: number; hours: number; minutes: number; seconds: number } } = {};
  private intervals: any[] = [];

  // public promocion:any=[];
  imagenUrl = environment.baseUrl;

  tiendaSelected: Tienda | undefined | null = null;
  private tiendaSubscription!: Subscription;
  private tiendaService = inject(TiendaService);

  constructor(
    private promocionService: PromocionService
  ) { }

  ngOnInit(): void {
    this.tiendaSubscription = this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      this.tiendaSelected = tienda;
      this.data_banner();
    });
  }


  ngAfterViewInit() {
    const USER = localStorage.getItem("user");
    // Check if dismissed
    if (localStorage.getItem('modalPromoDismissed')) {
      return;
    }
    // Auto open modal after DOM ready
    setTimeout(() => {
      const modalElement = document.getElementById('modalPromo');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 500);
  }

  onNoShowMore() {
    localStorage.setItem('modalPromoDismissed', 'true');
    const modalElement = document.getElementById('modalPromo');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  public open() {
    setTimeout(() => {
      const modalElement = document.getElementById('modalPromo') as HTMLElement;
      if (modalElement) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement) ||
          new (window as any).bootstrap.Modal(modalElement);
        bootstrapModal.show();
      }
    }, 100);
  }

  
  startCountdown(index: number, fecha: string | number | Date) {
  const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

  const countDown = new Date(fecha).getTime();

  // Si ya había un reloj corriendo en ese índice, lo limpia primero
  if (this.intervals[index]) {
    clearInterval(this.intervals[index]);
  }

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = countDown - now;

    if (distance < 0) {
      this.countdownValues[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      clearInterval(this.intervals[index]);
      return;
    }

    this.countdownValues[index] = {
      days: Math.floor(distance / day),
      hours: Math.floor((distance % day) / hour),
      minutes: Math.floor((distance % hour) / minute),
      seconds: Math.floor((distance % minute) / second)
    };
  };

  updateCountdown();
  this.intervals[index] = setInterval(updateCountdown, second);
}

  data_banner() {
  // Evita hacer la petición si aún no hay una tienda seleccionada
  if (!this.tiendaSelected?._id) {
    return;
  }

  this.isLoading = true;

  this.promocionService.getPromocionActivoByIdLocal(this.tiendaSelected._id).subscribe({
    next: (response: any) => {
      // Soporta tanto si el backend devuelve { promociones: [...] } como un arreglo directo [...]
      const listaPromociones = response?.promociones || response || [];

      if (listaPromociones.length > 0) {
        this.promocion = listaPromociones[0];
        this.promociones = listaPromociones;
        this.estado = this.promocion?.estado ?? false;

        // Solo inicia el contador si existe una fecha de finalización
        if (this.promocion?.end) {
          this.startCountdown(0, this.promocion.end);
        }
      } else {
        this.promocion = null;
        this.estado = false;
      }

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error al cargar la promoción del banner:', err);
      this.promocion = null;
      this.estado = false;
      this.isLoading = false;
    }
  });
}
  selectSlide(index: number) {
    this.currentSlide = index;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide === 0) ? this.promociones.length - 1 : this.currentSlide - 1;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide === this.promociones.length - 1) ? 0 : this.currentSlide + 1;
  }

  sanitizeEnlace(enlace: string): string {
    // Remove '../' segments to prevent router errors
    return enlace.replace(/\.\.\//g, '');
  }

  // Asegúrate de implementar OnDestroy en tu componente
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }


}
