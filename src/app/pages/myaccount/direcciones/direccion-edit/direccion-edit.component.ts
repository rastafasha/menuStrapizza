import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { DireccionService } from '../../../../services/direccion.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { PaisService } from '../../../../services/pais.service';
import { Pais } from '../../../../models/pais.model';
import { WaGeolocationService } from '@ng-web-apis/geolocation';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-direccion-edit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    RouterModule
  ],
  providers: [WaGeolocationService],
  templateUrl: './direccion-edit.component.html',
  styleUrls: ['./direccion-edit.component.css']
})
export class DireccionEditComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  identity!: any;
  public direccionForm!: FormGroup;
  public direccion_id: any;
  public nombres_completos: any;
  public direccion: any;
  public referencia: any;
  public pais!: Pais;
  public ciudad: any;
  public zip: any;
  public direccion_selected: any;
  pageTitle!: string;
  public url!: any;
  public paises!: any;
  public direccion_data: any = {};
  public data_paises: any = [];

  isLoading = false;

  // Variables del mapa
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  selectedCoords: { lat: number; lng: number } | null = null;
  mapLoading = true;
  mapError = '';
  private locationSubscription: Subscription | null = null;

  // Servicios
  private geolocation$ = inject(WaGeolocationService);
  private direccionService = inject(DireccionService);

  constructor(
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private paisService: PaisService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadIdentity();
    if (this.identity) {
      this.direccion_data = {};
      this.url = environment.baseUrl;
    }
    this.getPaises();
    this.activatedRoute.params.subscribe(({ id }) => this.getDireccion(id));

    // Suscripción a geolocalización para centrar mapa inicialmente
    this.locationSubscription = this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('Initial geolocation success - Lat:', lat, 'Lng:', lng);
        // Solo usar GPS si no hay coordenadas ya seleccionadas
        if (!this.selectedCoords && this.map) {
          this.map.setView([lat, lng], 15);
        }
        this.mapLoading = false;
        this.mapError = '';
      },
      error: (error) => {
        console.error('Error de geolocalización:', error);
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

  PageSize() {
    this.ngOnInit();

  }

  ngAfterViewInit() {
    // Delay aumentado para asegurar DOM listo y logging
    setTimeout(() => {
      console.log('Attempting to init map. Container ready?', !!this.mapContainer?.nativeElement);
      this.initMap();
    }, 300);
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

  /**
   * Inicializa el mapa de Leaflet
   */
  private initMap(): void {
    console.log('Map container element:', this.mapContainer?.nativeElement);
    // Verificar que el contenedor del mapa existe
    if (!this.mapContainer?.nativeElement) {
      console.error('Contenedor del mapa no encontrado');
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
    console.log('placeMarker called with lat:', lat, 'lng:', lng);

    // Always set coords FIRST
    this.selectedCoords = { lat, lng };
    console.log('selectedCoords set:', this.selectedCoords);

    // Patch form fields
    this.direccionForm.patchValue({ latitud: lat, longitud: lng });
    console.log('Form lat/lng:', this.direccionForm.value.latitud, this.direccionForm.value.longitud);

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
        console.log('GPS Success:', lat, lng);
        this.placeMarker(lat, lng);
        this.mapLoading = false;
      },
      error: (error) => {
        console.error('GPS Error:', error);
        this.mapLoading = false;
        Swal.fire('GPS Error', 'Habilita ubicación. Usa HTTPS.', 'warning');
      }
    });
  }

  loadIdentity() {
    this.isLoading = true;
    let USER = localStorage.getItem("user");
    if (USER) {
      let user = JSON.parse(USER);
      this.usuarioService.get_user(user.uid).subscribe((resp: any) => {
        this.identity = resp.usuario;
        this.iniciarFormulario();
        this.isLoading = false;
      }, error => {
        console.error('loadIdentity error:', error);
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
    }
  }

  iniciarFormulario() {
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

  getDireccion(id: any) {
    if (id !== null && id !== undefined) {
      this.pageTitle = 'Editando';
      this.direccionService.get_direccion(id).subscribe(
        res => {
          this.direccionForm.patchValue({
            id: id,
            nombres_completos: res.nombres_completos,
            direccion: res.direccion,
            referencia: res.referencia,
            pais: res.pais,
            ciudad: res.ciudad,
            zip: res.zip,
            user: this.identity.uid,
          });
          this.direccion = res;
          if (res.latitud && res.longitud) {
            setTimeout(() => {
              this.placeMarker(Number(res.latitud), Number(res.longitud));
            }, 500);
          }
        }, error => console.error('getDireccion error:', error)
      );
    } else {
      this.pageTitle = 'Creando';
    }
  }

  onSubmit() {
    console.log('Submit debug:', {
      selectedCoords: this.selectedCoords,
      formLat: this.direccionForm.value.latitud,
      formLng: this.direccionForm.value.longitud
    });

    const data: any = {
      ...this.direccionForm.value,
      user: this.identity.uid,
      latitud: this.selectedCoords?.lat || this.direccionForm.value.latitud || 0,
      longitud: this.selectedCoords?.lng || this.direccionForm.value.longitud || 0
    };

    console.log('Final data:', data);

    if (this.direccion && this.direccion._id) {
      data._id = this.direccion._id;
      this.direccionService.update(data).subscribe(
        resp => {
          Swal.fire('¡Actualizado!', 'Dirección guardada correctamente', 'success');
          this.router.navigateByUrl('/myprofile');
        }, error => Swal.fire('Error', error.message, 'error')
      );
    } else {
      this.direccionService.registro(data).subscribe(
        resp => {
          Swal.fire('¡Creado!', 'Dirección guardada correctamente', 'success');
          this.router.navigateByUrl('/myprofile');
        }, error => Swal.fire('Error', error.message, 'error')
      );
    }
  }

  getPaises() {
    this.paisService.getPaises().subscribe(
      resp => this.paises = resp,
      error => console.error('getPaises error:', error)
    );
  }
}
