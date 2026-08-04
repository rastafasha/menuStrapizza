import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Asignacion } from '../models/asignaciondelivery.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class AsignardeliveryService {

  constructor(
    private http: HttpClient
  ) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }


  gets() {

    const url = `${base_url}/asignardelivery`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, asignacions: Asignacion }) => resp.asignacions)
      )

  }


  getById(_id: string) {
    const url = `${base_url}/asignardelivery/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, asignacion: Asignacion }) => resp.asignacion)
      );

  }
  getByDriverId(_id: any) {
    const url = `${base_url}/asignardelivery/driver/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, asignacions: Asignacion }) => resp.asignacions)
      );

  }
  getByUserId(_id: any) {
    const url = `${base_url}/asignardelivery/user/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, asignacions: Asignacion }) => resp.asignacions)
      );

  }
  getByStatus(_id: string, status: string) {
    const url = `${base_url}/asignardelivery/status/${_id}/${status}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, asignacions: Asignacion }) => resp.asignacions)
      );

  }


  create(asignacion: Asignacion) {
    const url = `${base_url}/asignardelivery/store`;
    return this.http.post(url, asignacion, this.headers);
  }

  actualizar(asignacion: any) {
    const url = `${base_url}/asignardelivery/update/${asignacion._id}`;
    return this.http.put(url, asignacion, this.headers);
  }

  actualizarCoords(asignacion: any) {
    const url = `${base_url}/asignardelivery/update/coord/${asignacion._id}`;
    return this.http.put(url, asignacion, this.headers);
  }

  borrar(_id: string) {
    const url = `${base_url}/asignardelivery/remove/${_id}`;
    return this.http.delete(url, this.headers);
  }

  activar(_id: any): Observable<any> {
    const url = `${base_url}/asignardelivery/activar/${_id}`;
    return this.http.get(url, this.headers);
  }
  entregado(_id: any): Observable<any> {
    const url = `${base_url}/asignardelivery/entregado/${_id}`;
    return this.http.get(url, this.headers);
  }
  recibido(_id: any): Observable<any> {
    const url = `${base_url}/asignardelivery/recibido/${_id}`;
    return this.http.get(url, this.headers);
  }



}
