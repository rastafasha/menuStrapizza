import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Reservacion } from '../models/reservacion.model';
import { environment } from '../../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ReservacionService {


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


  getReservaciones() {

    const url = `${base_url}/reservacion`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, reservaciones: Reservacion[] }) => resp.reservaciones)
      )
  }

  getReservacionById(_id: string) {
    const url = `${base_url}/reservacion/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, reservacion: Reservacion }) => resp.reservacion)
      );
  }

  getReservacionByLocal(_id: any) {
    const url = `${base_url}/reservacion/local/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, reservaciones: Reservacion[] }) => resp.reservaciones)
      );
  }

  
  getReservacionByUser(usuario: any, page: number = 1, limit: number = 6,) {
    // Construimos la URL con parámetros de paginación
    const url = `${base_url}/reservacion/by_user/${usuario}?page=${page}&limit=${limit}`;

    return this.http.get<any>(url, this.headers)
      .pipe(
        // Importante: Si la API devuelve un array, asegúrate que el tipado sea Payment[]
        map((resp: { ok: boolean, reservaciones: any[] }) => resp.reservaciones)
      );


  }

  crearReservacion(reservacion: any) {
    const url = `${base_url}/reservacion/store`;
    return this.http.post(url, reservacion, this.headers);
  }

   actualizarReservacion(data: any, reservacion_id: any) {
    // const headers = new HttpHeaders({ 'Authorization': 'Bearer' + this.authService.token })
    const URL = base_url + '/reservacion/update/' + reservacion_id;
    return this.http.put(URL, data, this.headers);
  }

  borrarReservacion(_id: string) {
    const url = `${base_url}/reservacion/delete/${_id}`;
    return this.http.delete(url, this.headers);
  }



}
