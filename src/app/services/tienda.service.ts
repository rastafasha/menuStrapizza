import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, BehaviorSubject } from 'rxjs';
import { Tienda } from '../models/tienda.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class TiendaService {

  private selectedTiendaSubject = new BehaviorSubject<Tienda | null>(null);
  selectedTiendaObservable$ = this.selectedTiendaSubject.asObservable();

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
  getTiendaByName(nombre: any){
    const url = `${base_url}/tiendas/by_nombre/nombre/${nombre}`;
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
