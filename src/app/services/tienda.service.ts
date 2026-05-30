import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, BehaviorSubject, shareReplay, tap } from 'rxjs';
import { Tienda } from '../models/tienda.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class TiendaService {

  private selectedTiendaSubject = new BehaviorSubject<Tienda | null>(null);
  selectedTiendaObservable$ = this.selectedTiendaSubject.asObservable();
  
  // Cache for tienda by name to avoid redundant API calls
  private tiendaCache = new Map<string, Observable<Tienda | null>>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_SIZE = 10;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  constructor(
    private http: HttpClient
  ) { }

  get token():string{
    return localStorage.getItem('token') || '';
  }

  get headers(){
    return{
      headers: {
        'x-token': this.token
      }
    }
  }

  /**
   * Extrae dinámicamente el slug/subdominio desde la URL del navegador.
   */
  private obtenerSlugDeUrl(): string {
    const hostname = window.location.hostname; // Ej: ://zlipmenu.com o localhost
    const partes = hostname.split('.');

    // 1. Control para desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'Pizzeria'; // Pon aquí el nombre de una tienda real de tu Mongo Atlas para pruebas locales
    }
    
    // 2. Control para subdominios desplegados en Vercel
    if (partes.length >= 3) {
      const subdominio = partes[0];
      if (subdominio !== 'www' && subdominio !== 'zlipmenu') {
        return subdominio; // Retorna el subdominio dinámico (ej: 'pizzeria')
      }
    }

    // 3. Fallback por si entran sin subdominio o falla el parseo
    return environment.nombreSelected;
  }

  /**
   * Get tienda by name with caching to avoid redundant API calls.
   * Modificado: 'nombre' ahora es opcional. Si no se envía, se calcula desde la URL.
   */
  getTiendaByNameCached(nombre?: string): Observable<Tienda | null> {
    // Si no se proporciona un nombre, extraemos el slug dinámico del subdominio
    const nombreTienda = nombre || this.obtenerSlugDeUrl();

    const now = Date.now();
    const cached = this.tiendaCache.get(nombreTienda);
    const cachedTimestamp = this.cacheTimestamps.get(nombreTienda);
    
    // Check if cache is valid (exists and not expired)
    if (cached && cachedTimestamp && (now - cachedTimestamp) < this.CACHE_TTL) {
      return cached;
    }
    
    // Check if cache is full, remove oldest entry
    if (this.tiendaCache.size >= this.CACHE_SIZE) {
      const oldestKey = this.cacheTimestamps.keys().next().value as string;
      if (oldestKey) {
        this.tiendaCache.delete(oldestKey);
        this.cacheTimestamps.delete(oldestKey);
      }
    }
    
    const url = `${base_url}/tiendas/by_nombre/nombre/${nombreTienda}`;
    const request = this.http.get<any>(url, this.headers).pipe(
      map((resp:{ok: boolean, tienda: Tienda}) => resp.tienda),
      tap(tienda => {
        // Update the BehaviorSubject with the fetched tienda
        this.selectedTiendaSubject.next(tienda);
      }),
      shareReplay(1)
    );
    
    // Store in cache
    this.tiendaCache.set(nombreTienda, request);
    this.cacheTimestamps.set(nombreTienda, now);
    
    return request;
  }

  /**
   * Clear the cache - useful for testing or when tienda data changes
   */
  clearCache(): void {
    this.tiendaCache.clear();
    this.cacheTimestamps.clear();
    this.selectedTiendaSubject.next(null);
  }

  /**
   * Force refresh the cached tienda for a specific name
   */
  refreshTienda(nombre?: string): Observable<Tienda | null> {
    const nombreTienda = nombre || this.obtenerSlugDeUrl();

    const url = `${base_url}/tiendas/by_nombre/nombre/${nombreTienda}`;
    const request = this.http.get<any>(url, this.headers).pipe(
      map((resp:{ok: boolean, tienda: Tienda}) => resp.tienda),
      tap(tienda => {
        this.selectedTiendaSubject.next(tienda);
        // Update cache
        this.tiendaCache.set(nombreTienda, request);
        this.cacheTimestamps.set(nombreTienda, Date.now());
      }),
      shareReplay(1)
    );
    
    // Remove old cache entry and set new one
    this.tiendaCache.delete(nombreTienda);
    this.tiendaCache.set(nombreTienda, request);
    this.cacheTimestamps.set(nombreTienda, Date.now());
    
    return request;
  }

  cargarTiendas(){
    const url = `${base_url}/tiendas`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, tiendas: Tienda[]}) => resp.tiendas)
      )
  }

  getTiendaById(_id: any){
    const url = `${base_url}/tiendas/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, tienda: Tienda}) => resp.tienda)
        );
  }
  
  getTiendaByName(nombre?: any){
    const nombreTienda = nombre || this.obtenerSlugDeUrl();
    const url = `${base_url}/tiendas/by_nombre/nombre/${nombreTienda}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, tienda: Tienda}) => resp.tienda)
        );
  }

  crearTienda(tienda: Tienda){
    const url = `${base_url}/tiendas/store`;
    return this.http.post(url, tienda, this.headers);
  }

  actualizarTienda(tienda: Tienda){
    const url = `${base_url}/tiendas/update/${tienda._id}`;
    return this.http.put(url, tienda, this.headers);
  }

  borrarTienda(_id:string){
    const url = `${base_url}/tiendas/delete/${_id}`;
    return this.http.delete(url, this.headers);
  }

  get_car_slide():Observable<any>{
    const url = `${base_url}/tiendas/slider`;
    return this.http.get(url, this.headers);
  }

  list_one(id:string):Observable<any>{
    const url = `${base_url}/tiendas/one/${id}`;
    return this.http.get(url, this.headers);
  }

  desactivar(id:string):Observable<any>{
    const url = `${base_url}/tiendas/admin/desactivar/`+id;
    return this.http.get(url,  this.headers);
  }

  activar(id:string):Observable<any>{
    const url = `${base_url}/tiendas/admin/activar/`+id;
    return this.http.get(url,  this.headers);
  }

  setSelectedTienda(tienda: Tienda | null) {
    this.selectedTiendaSubject.next(tienda);
  }

  getSelectedTiendaSync(): Tienda | null {
    return this.selectedTiendaSubject.value;
  }
}
