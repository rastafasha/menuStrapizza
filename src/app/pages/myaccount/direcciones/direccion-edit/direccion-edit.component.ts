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

  identity!:any;
  public direccionForm!: FormGroup;
  public direccion_id:any;
  public nombres_completos:any;
  public direccion:any;
  public referencia:any;
  public pais!: Pais;
  public ciudad:any;
  public zip:any;
  public direccion_selected:any;
  pageTitle!:string;
  public url!:any;
  public paises!:any;
  public direccion_data : any = {};
  public data_paises : any = [];

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
  ) {}

  ngOnInit(): void {
    this.loadIdentity();
    if(this.identity){
      this.direccion_data = {};
      this.url = environment.baseUrl;
    }
    this.getPaises();
    this.activatedRoute.params.subscribe( ({id}) => this.getDireccion(id));
    
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
  private async placeMarker(lat: number, lng: number): Promise<void> {
    if (!this.map) return;

    this.selectedCoords = { lat, lng };

    // Patch form fields explicitly
    this.direccionForm.patchValue({ latitud: lat, longitud: lng });

    if (this.marker) {
      // Mover marcador existente
      this.marker.setLatLng([lat, lng]);
    } else {
      // Crear nuevo marcador
      this.marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('<b>Ubicación seleccionada</b><br>Haz clic en otro lugar para cambiar')
        .openPopup();
    }

    // Obtener dirección legible desde coordenadas
    await this.fetchAddress(lat, lng);

    // Actualizar referencia con dirección o coordenadas
    const refText = this.direccionForm.value.referencia || `📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    this.direccionForm.patchValue({
      referencia: refText
    });
  }

  /**
   * Obtiene dirección legible de coordenadas usando Nominatim (OpenStreetMap)
   */
  private async fetchAddress(lat: number, lng: number): Promise<void> {
    try {
      console.log('Fetching reverse geocode for:', lat, lng);
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      let address = data.display_name || 'Dirección aproximada no disponible';
      if (data.address) {
        const parts = [];
        if (data.address.road) parts.push(data.address.road);
        if (data.address.house_number) parts.push(data.address.house_number);
        if (data.address.city || data.address.town || data.address.village) parts.push(data.address.city || data.address.town || data.address.village);
        if (data.address.country) parts.push(data.address.country);
        address = parts.filter(Boolean).join(', ');
      }
      
      console.log('Reverse geocoded address:', address);
      // Update referencia with full address + coords
      const currentRef = this.direccionForm.get('referencia')?.value || '';
      this.direccionForm.patchValue({
        referencia: `${currentRef ? currentRef + ' | ' : ''}📍 ${address} [${lat.toFixed(6)}, ${lng.toFixed(6)}]`
      });
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      // Fallback: just coords
      this.direccionForm.patchValue({
        referencia: `📍 Coords: ${lat.toFixed(6)}, ${lng.toFixed(6)} (geocode failed)`
      });
    }
  }

  /**
   * Usa la ubicación actual del GPS
   */
  useCurrentLocation(): void {
    this.mapLoading = true;
    this.geolocation$.subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('GPS Success - Lat:', lat, 'Lng:', lng);
        this.placeMarker(lat, lng);
        if (this.map) {
          this.map.setView([lat, lng], 15);
        }
        this.mapLoading = false;
      },
      error: (error) => {
        console.error('Error de geolocalización:', error);
        this.mapLoading = false;
        let msg = 'No se pudo obtener tu ubicación actual. ';
        if (error.code === error.PERMISSION_DENIED) {
          msg += 'Habilita permisos de ubicación (candado en barra de direcciones). Usa HTTPS.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg += 'Ubicación no disponible en este dispositivo.';
        } else if (error.code === error.TIMEOUT) {
          msg += 'Timeout - intenta de nuevo.';
        }
        Swal.fire('Error GPS', msg, 'warning');
      }
    });
  }

  loadIdentity(){
    this.isLoading = true;
    let USER = localStorage.getItem("user");
    if(USER){
      let user = JSON.parse(USER);
      this.usuarioService.get_user(user.uid).subscribe((resp:any)=>{
        this.identity = resp.usuario;
        this.iniciarFormulario();
        this.isLoading = false;
      })
    }
  }

  iniciarFormulario(){
    this.direccionForm = this.fb.group({
      nombres_completos: ['',Validators.required],
      direccion: ['',Validators.required],
      referencia: ['',Validators.required],
      pais: [''],
      ciudad: [''],
      latitud: [''],
      longitud: [''],
      zip: [''],
      user: [this.identity?.uid],
    })
  }

  getDirecction(){
    this.direccionService.get_direccion(this.direccion_id).subscribe((resp:any)=>{
      console.log(resp);
      this.direccion_selected = resp;
    })
  }

  getDireccion(id:any){
    if(id !== null && id !== undefined){
      this.pageTitle = 'Editing';
      this.direccionService.get_direccion(id).subscribe(
        res => {
          this.direccionForm.patchValue({
            id: this.direccion_id,
            nombres_completos: res.nombres_completos,
            direccion: res.direccion,
            referencia: res.referencia,
            pais: res.pais,
            ciudad: res.ciudad,
            zip: res.zip,
            user: this.identity.uid,
          });
          this.direccion = res;
          console.log('Dirección cargada:', this.direccion);
          
          // Si hay coordenadas, actualizar el mapa después de que se inicialice
          if (res.latitud && res.longitud) {
            const lat = Number(res.latitud);
            const lng = Number(res.longitud);
            setTimeout(() => {
              if (this.map) {
                this.placeMarker(lat, lng);
                this.map.setView([lat, lng], 15);
              }
            }, 500);
          }
        }
      );
    } else {
      this.pageTitle = 'Creating';
    }
  }

  onSubmit(){debugger
    const {nombres_completos, direccion, referencia, pais,
      ciudad, zip, user } = this.direccionForm.value;

    // Incluir coordenadas si están disponibles
    const data: any = {
      ...this.direccionForm.value,
      latitud: this.selectedCoords?.lat || this.direccion?.latitud, 
      longitud: this.selectedCoords?.lng || this.direccion?.longitud
    };

    if(this.direccion){
      // Actualizar
      data._id = this.direccion._id;
      this.direccionService.update(data).subscribe(
        resp =>{
          Swal.fire('Actualizado', `${nombres_completos} actualizado correctamente`, 'success');
          this.router.navigateByUrl(`/myprofile`);
        });
    } else {
      // Crear
      this.direccionService.registro(data)
        .subscribe((resp: any) => {
          Swal.fire('Creado', `${nombres_completos} creado correctamente`, 'success');
          this.router.navigateByUrl(`/myprofile`);
        });
    }
  }

  getPaises() {
    this.paisService.getPaises().subscribe(
      (resp:any) => {
        this.paises = resp;
      }
    );
  }
}

