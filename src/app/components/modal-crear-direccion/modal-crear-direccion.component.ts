import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DireccionService } from '../../services/direccion.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { WaGeolocationService } from '@ng-web-apis/geolocation';
import * as L from 'leaflet';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-crear-direccion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './modal-crear-direccion.component.html',
  styleUrl: './modal-crear-direccion.component.scss'
})
export class ModalCrearDireccionComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() dieccionSeleccionado!: any;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Output() refreshPostList: EventEmitter<void> = new EventEmitter<void>();

  user: any;
  public direccionForm!: FormGroup;
  public direccion: any;
  isLoading = false;
  pageTitle!: string;
  isEditing = false;

  // Variables del mapa
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  selectedCoords: { lat: number; lng: number } | null = null;
  mapLoading = true;
  mapError = '';
  private locationSubscription: Subscription | null = null;

  constructor(
    public direccionService: DireccionService,
    public authService: AuthService,
    public router: Router,
    public toastr: ToastrService,
    private geolocation$: WaGeolocationService,
    public fb: FormBuilder,
  ) {
    this.user = this.authService.getLocalStorage();
  }

  ngOnInit() {
    this.subscrpGPS();
    this.validarFormulario();
  }

  subscrpGPS() {
    // Suscripción a geolocalización para centrar mapa inicialmente
    this.locationSubscription = this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // console.log('Initial geolocation success - Lat:', lat, 'Lng:', lng);
        // Solo usar GPS si no hay coordenadas ya seleccionadas
        if (!this.selectedCoords && this.map) {
          this.map.setView([lat, lng], 15);
        }
        this.mapLoading = false;
        this.mapError = '';
      },
      error: (error) => {
        // console.error('Error de geolocalización:', error);
        this.mapLoading = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.mapError = 'Permiso de geolocalización denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            this.mapError = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            this.mapError = 'Tiempo de espera agotado';
            break;
          default:
            this.mapError = 'Error desconocido';
        }
        // Centrar en ubicación por defecto (Venezuela) si hay error
        if (this.map) {
          this.map.setView([10.4806, -66.9036], 15);
        }
      }
    });
  }

  

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;

    if (
      changes['dieccionSeleccionado'] &&
      changes['dieccionSeleccionado'].currentValue
    ) {
      this.pageTitle = 'Editando Dirección';
      const direccion = changes['dieccionSeleccionado'].currentValue;

      this.direccionForm.patchValue({
        id: direccion.id,
        nombres_completos: direccion.nombres_completos,
        direccion: direccion.direccion,
        referencia: direccion.referencia,
        pais: direccion.pais,
        ciudad: direccion.ciudad,
        zip: direccion.zip,
        user: this.user.uid,
      });
      this.dieccionSeleccionado = direccion;
      this.isEditing = true;
      this.pageTitle = 'Editando Dirección';
    } else {
      this.isEditing = false;
      this.pageTitle = 'Creando Dirección';
    }
    this.isLoading = false;
  }


  onClose() {
    this.dieccionSeleccionado = null;
    this.direccionForm.reset();
    this.pageTitle = 'Creando Dirección';
    // Also reset default values if needed
    this.direccionForm.patchValue({
      id: null,
      nombres_completos: null,
      direccion: null,
      referencia: null,
      pais: null,
      ciudad: null,
      zip: null,
      user: null,
    });
    // Emit event to parent to reset the projectSeleccionado variable

    this.closeModal.emit();
  }

  validarFormulario() {
    this.direccionForm = this.fb.group({
      nombres_completos: ['', Validators.required],
      direccion: ['', Validators.required],
      referencia: ['', Validators.required],
      pais: [''],
      ciudad: [''],
      latitud: [''],
      longitud: [''],
      zip: [''],
      user: [''],
    })
  }

 inicializarMapa() {
  // Verificamos de forma segura si el contenedor HTML ya existe en el DOM visible
  if (this.mapContainer && this.mapContainer.nativeElement) {
    console.log('✅ Contenedor listo y visible en el hijo. Despertando initMap()...');
    
    // Llamas a tu función nativa que dibuja el mapa
    this.initMap();
    
  } else {
    console.error('❌ El contenedor mapContainer aún no está listo en el DOM.');
  }
}

  /**
    * Inicializa el mapa de Leaflet
    */
  private initMap(): void {
    // console.log('Map container element:', this.mapContainer?.nativeElement);
    // Verificar que el contenedor del mapa existe
    if (!this.mapContainer?.nativeElement) {
      // console.error('Contenedor del mapa no encontrado');
      this.mapError = 'Contenedor del mapa no disponible. Recarga la página.';
      this.mapLoading = false;
      return;
    }

    // Centro inicial: Venezuela por defecto
    const centerLat = 10.4806;
    const centerLng = -66.9036;

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

    // Evento click en el mapa para colocar marcador
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng.lat, e.latlng.lng);
    });

    // Si hay coordenadas en la dirección existente, mostrar marcador
    if (this.direccion?.latitud && this.direccion?.longitud) {
      this.placeMarker(this.direccion.latitud, this.direccion.longitud);
      this.map.setView([this.direccion.latitud, this.direccion.longitud], 15);
    }

    this.mapLoading = false;
  }

  /**
   * Coloca o mueve el marcador en las coordenadas especificadas
   */
  placeMarker(lat: number, lng: number): void {
    // console.log('placeMarker called with lat:', lat, 'lng:', lng);

    // Always set coords FIRST
    this.selectedCoords = { lat, lng };
    console.log('selectedCoords set:', this.selectedCoords);

    // Patch form fields
    this.direccionForm.patchValue({ latitud: lat, longitud: lng });
    // console.log('Form lat/lng:', this.direccionForm.value.latitud, this.direccionForm.value.longitud);

    if (!this.map) {
      console.error('Map not ready - coords saved anyway');
      this.fetchAddress(lat, lng);
      return;
    }

    // Marker
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('<b>Ubicación GPS</b>')
        .openPopup();
    }

    this.map.setView([lat, lng], 15);

    // Address
    this.fetchAddress(lat, lng);
  }

  fetchAddress(lat: number, lng: number): void {
    console.log('Geocoding', lat, lng);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        const address = data.display_name || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
        this.direccionForm.patchValue({ direccion: `📍 ${address}` });
        console.log('Address:', address);
      })
      .catch(() => {
        this.direccionForm.patchValue({ direccion: `📍 GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      });
  }

  /**
   * Usa la ubicación actual del GPS
   */
  useCurrentLocation(): void {
    this.mapLoading = true;
    console.log('Starting GPS location');
    this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // console.log('GPS Success:', lat, lng);
        this.placeMarker(lat, lng);
        this.mapLoading = false;
      },
      error: (error) => {
        // console.error('GPS Error:', error);
        this.mapLoading = false;
        this.toastr.warning('GPS Error', 'Habilita ubicación. Usa HTTPS.')
      }
    });
  }

  onSubmit() {
    console.log('Submit debug:', {
      selectedCoords: this.selectedCoords,
      formLat: this.direccionForm.value.latitud,
      formLng: this.direccionForm.value.longitud
    });

    const data: any = {
      ...this.direccionForm.value,
      user: this.user.uid,
      latitud: this.selectedCoords?.lat || this.direccionForm.value.latitud || 0,
      longitud: this.selectedCoords?.lng || this.direccionForm.value.longitud || 0
    };

    // console.log('Final data:', data);

    if (this.direccion && this.direccion._id) {
      data._id = this.direccion._id;
      this.direccionService.update(data).subscribe(
        resp => {
          this.toastr.success('¡Actualizado!', 'Dirección guardada correctamente')
          // Close modal programmatically
          const modalElement = document.getElementById('add_direccion');
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();

          }
          // Emit event to refresh project list
          this.refreshPostList.emit();
          this.onClose();
        }, error => this.toastr.error('Error', error.message)
      );
    } else {
      this.direccionService.registro(data).subscribe(
        resp => {
          this.toastr.success('¡Creado!', 'Dirección guardada correctamente')
          // Close modal programmatically
          const modalElement = document.getElementById('add_direccion');
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();

          }
          // Emit event to refresh project list
          this.refreshPostList.emit();
          this.onClose();
        }, error => this.toastr.error('Error', error.message)
      );
    }
  }


  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

}
