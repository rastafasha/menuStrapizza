import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WaGeolocationService } from '@ng-web-apis/geolocation';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { NgIf } from '@angular/common';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../models/usuario.model';
import { AsignardeliveryService } from '../../../../services/asignardelivery.service';
import { DireccionService } from '../../../../services/direccion.service';
import { Direccion } from '../../../../models/direccion.model';
import { BackComponent } from '../../../../shared/back/back.component';
import { MenuFooterComponent } from '../../../../shared/menu-footer/menu-footer.component';

@Component({
  selector: 'app-mapa',
  imports: [
    RouterModule, NgIf,
    BackComponent, MenuFooterComponent
],
  providers: [WaGeolocationService],
  templateUrl: './mapa.component.html',
  styleUrls: ['mapa.component.css']
})
export class MapaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private readonly geolocation$ = inject(WaGeolocationService);
  private map: L.Map | null = null;
  private driverMarker: L.Marker | null = null;
  private deliveryMarker: L.Marker | null = null;
  private routeLine: L.Polyline | null = null;
  private locationSubscription: Subscription | null = null;
  private asignacionSubscription: Subscription | null = null;
  private refreshInterval: any = null;

  // Estado para mostrar coordenadas
  driverPosition: { lat: number; lng: number } | null = null;
  deliveryPosition: { lat: number; lng: number } | null = null;
  loading = true;
  errorMessage = '';

  identity!: Usuario;
  asignacion!: any;
  asignacionId!: any;
  user!: any;
  driver!: any;
  direccion!: string;
  direccionAddres!: any;

  private usuarioService = inject(UsuarioService);
  private asignacionService = inject(AsignardeliveryService);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private direccionService = inject(DireccionService);

  // Configuración de iconos personalizados
  private driverIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private deliveryIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngOnInit() {

    let USER = localStorage.getItem("usuario");
    this.user = JSON.parse(USER || '{}');

    this.activatedRoute.params.subscribe(params => {
      let orderId = params['id'];
      this.asignacionId = orderId;
      // Load asignacion data after getting ID
      this.loadAsignacion();
    });

    // Suscripción continua a la ubicación
    this.locationSubscription = this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Use setTimeout to defer the update and avoid expression changed error
        setTimeout(() => {
          // CHOFER: Only update own position (driverPosition) with GPS
          // deliveryPosition should come from direccionAddres 
          if (this.user.role == 'CHOFER') {
            this.driverPosition = { lat, lng };
            this.updateDriverPosition(lat, lng);
            console.log('Posición driverPosition (CHOFER):', this.driverPosition);

            // Also update the asignacion with new driver position
            this.updateAsignacionWithPosition();
          }

          // USER: Don't update any position from GPS
          // All positions (driverPosition and deliveryPosition) should come from asignacion
          // deliveryPosition is the DESTINATION (from asignacion), not USER's GPS

          this.loading = false;
          this.errorMessage = '';

          // Actualizar mapa si ya está inicializado
          if (this.map) {
            this.updateMap();
          }

          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        console.error('Error de geolocalización:', error);

        setTimeout(() => {
          this.loading = false;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.errorMessage = 'Permiso de geolocalización denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              this.errorMessage = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              this.errorMessage = 'Tiempo de espera agotado';
              break;
            default:
              this.errorMessage = 'Error desconocido';
          }
          // Usar ubicación por defecto para demo (Venezuela)
          // this.driverPosition = { lat: 10.4806, lng: -66.9036 }; // Caracas, Venezuela
          if (this.map) {
            this.updateMap();
          }
          this.cdr.markForCheck();
        });
      }
    });

  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.asignacionSubscription) {
      this.asignacionSubscription.unsubscribe();
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Helper method to parse position strings from "lat,lng" format
   */
  private parsePosition(positionStr: string | null | undefined): { lat: number; lng: number } | null {
    if (!positionStr) return null;

    const parts = positionStr.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  }

  /**
   * Load asignacion data and set positions based on user role
   */
  private loadAsignacion(): void {
    if (!this.asignacionId) return;

    this.asignacionSubscription = this.asignacionService.getById(this.asignacionId).subscribe({
      next: (resp: any) => {
        if (resp.ok && resp.asignacion) {
          // Mantenemos el setTimeout general para diferir la asignación inicial
          setTimeout(() => {
            this.asignacion = resp.asignacion;
            this.direccion = resp.pedido.direccion;

            this.direccionService.get_direccion(this.direccion).subscribe((dirResp: any) => {
              this.direccionAddres = dirResp;

              const parsedDriverPos = this.parsePosition(this.asignacion.driverPosition);
              const parsedDeliveryPos = this.parsePosition(this.direccionAddres.deliveryPosition);

              if (this.user.role == 'CHOFER') {
                if (parsedDriverPos) this.driverPosition = parsedDriverPos;
                if (parsedDeliveryPos) this.deliveryPosition = parsedDeliveryPos;
              }

              if (this.user.role == 'USER') {
                if (parsedDriverPos) this.driverPosition = parsedDriverPos;
                if (parsedDeliveryPos) this.deliveryPosition = parsedDeliveryPos;
                this.startRefreshAsignacion();
              }

              this.loading = false;
              if (this.map) {
                this.updateMap();
              }

              // 3. CLAVE: Reemplaza markForCheck() por detectChanges() aquí adentro
              // Esto obliga a Angular a procesar las coordenadas del mapa en este preciso instante
              this.cdr.detectChanges();
            });
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar asignacion:', error);
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }




  /**
   * Start periodic refresh of asignacion for USER role
   * to see driver's updated location
   */
  private startRefreshAsignacion(): void {
    // Limpiar cualquier intervalo previo por seguridad si se vuelve a llamar esta función
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refrescar cada 10 segundos
    this.refreshInterval = setInterval(() => {
      if (this.user.role == 'USER' && this.asignacionId) {
        this.asignacionService.getById(this.asignacionId).subscribe({
          next: (resp: any) => {
            if (resp.ok && resp.asignacion) {
              const parsedDriverPos = this.parsePosition(resp.asignacion.driverPosition);

              if (parsedDriverPos) {
                // Validar si la posición del repartidor realmente cambió
                if (!this.driverPosition ||
                  parsedDriverPos.lat !== this.driverPosition.lat ||
                  parsedDriverPos.lng !== this.driverPosition.lng) {

                  // 1. ELIMINAMOS EL SETTIMEOUT INTERNO: Asignamos el valor directamente
                  this.driverPosition = parsedDriverPos;
                  console.log('Posición repartidor actualizada de forma síncrona:', this.driverPosition);

                  if (this.map) {
                    this.updateMap();
                  }

                  // 2. FORZAMOS EL CHEQUEO DE CAMBIOS INMEDIATO para actualizar el marcador en el mapa
                  this.cdr.detectChanges();
                }
              }
            }
          },
          error: (error) => {
            console.error('Error al actualizar posición del chofer:', error);
          }
        });
      }
    }, 10000);
  }


  /**
   * Update asignacion with current driver position
   */
  private updateAsignacionWithPosition(): void {
    if (!this.asignacionId || !this.driverPosition) return;


    // Update silently without showing alert
    this.updateAsignacion();
  }

  private initMap(): void {
    // Esperar a tener posición del conductor
    if (!this.driverPosition) {
      // Posición por defecto mientras carga (Venezuela)
      // this.driverPosition = { lat: 10.4806, lng: -66.9036 }; // Caracas, Venezuela
      const parsed = this.asignacion?.driverPosition ? this.parsePosition(this.asignacion.driverPosition) : null;
      this.driverPosition = parsed ?? { lat: 10.4806, lng: -66.9036 };
    }

    // Inicializar mapa centrado en posición del conductor (usar fallback si es null)
    const centerLat = this.driverPosition?.lat ?? 10.4806;
    const centerLng = this.driverPosition?.lng ?? -66.9036;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [centerLat, centerLng],
      zoom: 15,
      zoomControl: true
    });

    // Agregar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Actualizar marcadores y ruta
    this.updateMap();
  }
  private updateMap(): void {
    if (!this.map) return;

    // COORDENADAS DE PRUEBA (Inserta esto temporalmente antes de llamar a updateMap)
    // this.driverPosition = { lat: 10.5015, lng: -66.8850 }; // Unas cuadras hacia Plaza Venezuela
    // this.deliveryPosition = { lat: 10.5046, lng: -66.8940 }; // Tu dirección real en la Av. Andrés Bello


    // Necesitamos la posición del repartidor para operar el mapa
    if (!this.driverPosition) return;

    // 1. Actualizar o crear marcador del repartidor
    if (this.driverMarker) {
      this.driverMarker.setLatLng([this.driverPosition.lat, this.driverPosition.lng]);
    } else {
      // Corregimos la etiqueta dinámica según el rol para evitar confusiones
      const driverLabel = this.user.role === 'CHOFER' ? '<b>Tu ubicación (Repartidor)</b>' : '<b>Ubicación del Repartidor</b>';

      this.driverMarker = L.marker([this.driverPosition.lat, this.driverPosition.lng], { icon: this.driverIcon })
        .addTo(this.map)
        .bindPopup(driverLabel);
    }

    // 2. Actualizar o crear marcador de entrega
    if (this.deliveryPosition) {
      if (this.deliveryMarker) {
        this.deliveryMarker.setLatLng([this.deliveryPosition.lat, this.deliveryPosition.lng]);
      } else {
        const deliveryLabel = this.user.role === 'USER' ? '<b>Tu dirección de entrega</b>' : '<b>Punto de Destino</b>';

        this.deliveryMarker = L.marker([this.deliveryPosition.lat, this.deliveryPosition.lng], { icon: this.deliveryIcon })
          .addTo(this.map)
          .bindPopup(deliveryLabel);
      }

      // 3. Dibujar o actualizar línea de ruta
      const routeCoords: L.LatLngExpression[] = [
        [this.driverPosition.lat, this.driverPosition.lng],
        [this.deliveryPosition.lat, this.deliveryPosition.lng]
      ];

      if (this.routeLine) {
        this.routeLine.setLatLngs(routeCoords);
      } else {
        this.routeLine = L.polyline(routeCoords, {
          color: '#007bff', // Un azul más moderno y estético
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10'
        }).addTo(this.map);
      }

      // 4. Ajustar vista de manera inteligente (¡EVITA EL TIRÓN DEL ZOOM CADA 10 SEGUNDOS!)
      // Solo hacemos fitBounds la primera vez que se dibuja el mapa para no interrumpir al usuario
      if (!this.map.hasLayer(this.routeLine)) {
        const bounds = L.latLngBounds(routeCoords);
        this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    } else {
      // Si por alguna razón no hay posición de entrega, limpiamos los gráficos viejos
      if (this.deliveryMarker) { this.map.removeLayer(this.deliveryMarker); this.deliveryMarker = null; }
      if (this.routeLine) { this.map.removeLayer(this.routeLine); this.routeLine = null; }

      // Si solo hay chofer, centramos la cámara exclusivamente en él
      this.map.setView([this.driverPosition.lat, this.driverPosition.lng], 15);
    }
  }




  /**
   * Comparte las coordenadas usando la API nativa de Web Share
   * o copia al portapapeles como alternativa
   */
  async shareCoordinates(): Promise<void> {
    const shareData = this.buildShareData();

    // Verificar si la API de Web Share está disponible
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        console.log('Coordenadas compartidas exitosamente');
        //verificamos el rol del usuario para mostrar mensaje adecuado
        if (this.user.role == 'CHOFER') {
          alert('✅ Coordenadas del repartidor compartidas exitosamente');
        } else {
          alert('✅ Coordenadas de la entrega compartidas exitosamente');
        }


      } catch (error: any) {
        // El usuario canceló el compartir o hubo un error
        if (error.name !== 'AbortError') {
          console.error('Error al compartir:', error);
          this.copyToClipboard(shareData.text || '');
        }
      }
    } else {
      // Usar fallback: copiar al portapapeles
      this.copyToClipboard(shareData.text || '');
    }
  }

  /**
   * Construye el objeto de datos para compartir
   */
  private buildShareData(): ShareData {
    let title = '📍 Coordenadas de Entrega - Zlipmenu';
    let text = this.buildCoordinateText();

    // Crear URL con coordenadas para abrir en Google Maps
    let mapsUrl = '';
    if (this.driverPosition) {
      mapsUrl = `https://www.google.com/maps?q=${this.driverPosition.lat},${this.driverPosition.lng}`;
    }

    return {
      title: title,
      text: text,
      url: mapsUrl
    };
  }

  /**
   * Construye el texto con las coordenadas formateadas
   */
  private buildCoordinateText(): string {
    let text = '🛵 **Ruta de Entrega - MallConnect**\n\n';

    if (this.driverPosition) {
      text += `📍 **Repartidor:** ${this.driverPosition.lat.toFixed(6)}, ${this.driverPosition.lng.toFixed(6)}\n`;
      text += `[Ver en Google Maps](https://www.google.com/maps?q=${this.driverPosition.lat},${this.driverPosition.lng})\n\n`;
    }

    if (this.deliveryPosition) {
      text += `🏠 **Entrega:** ${this.deliveryPosition.lat.toFixed(6)}, ${this.deliveryPosition.lng.toFixed(6)}\n`;
      text += `[Ver en Google Maps](https://www.google.com/maps?q=${this.deliveryPosition.lat},${this.deliveryPosition.lng})`;
    }

    text += '\n\n📱 Compartido desde MallConnect Delivery';
    return text;
  }

  /**
   * Copia las coordenadas al portapapeles
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Coordenadas copiadas al portapapeles\n\nPuedes pegarlas en WhatsApp, SMS o cualquier aplicación');
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      alert('❌ No se pudieron copiar las coordenadas');
    }
  }

  updateDriverPosition(lat: number, lng: number): void {
    this.driverPosition = { lat, lng };
    this.updateMap();
  }

  updateDeliveryPosition(lat: number, lng: number): void {
    this.deliveryPosition = { lat, lng };
    this.updateMap();
  }

  updateAsignacion(): void {
    // CHOFER: Only update driverPosition (own GPS location)
    if (this.user.role == 'CHOFER' && this.driverPosition) {
      const data = {
        _id: this.asignacionId,
        driverPosition: `${this.driverPosition.lat},${this.driverPosition.lng}`,
      };
      this.asignacionService.actualizarCoords(data).subscribe((resp: any) => {
        console.log('Asignación actualizada driverPosition:', this.driverPosition);
        this.asignacion = resp.asignacionActualizada;
      });
    }

    // USER: Don't update deliveryPosition from GPS
    // deliveryPosition should be set by the CLIENT when creating the order
    // and should NOT be changed by the USER's GPS
  }
}

