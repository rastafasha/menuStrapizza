import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { Presupuesto } from '../models/presupuesto';

const url_servicios = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {


  constructor(
    public http: HttpClient,

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

  list() {

    const url = `${url_servicios}/presupuestos`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, presupuestos: Presupuesto }) => resp.presupuestos)
      )
  }


  getPresupuesto(_id: any) {
    const url = `${url_servicios}/presupuestos/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, presupuesto: Presupuesto }) => resp.presupuesto)
      );
  }

  getPrByUser(usuario: any, page: number = 1, limit: number = 6,) {
    // Construimos la URL con parámetros de paginación
    const url = `${url_servicios}/presupuestos/user/${usuario}?page=${page}&limit=${limit}`;

    return this.http.get<any>(url, this.headers)
      .pipe(
        // Importante: Si la API devuelve un array, asegúrate que el tipado sea Payment[]
        map((resp: { ok: boolean, presupuestos: any[] }) => resp.presupuestos)
      );
  }

  getByTiendaId(_id: string) {
    const url = `${url_servicios}/presupuestos/by_tiendaId/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, presupuestos: Presupuesto[] }) => resp.presupuestos)
      );

  }

  createPresupuesto(presupuesto: any) {
    const url = `${url_servicios}/presupuestos/crear`;
    return this.http.post(url, presupuesto, this.headers);
  }
  editPresupuesto(data: any, presupuesto_id: any) {
    const url = `${url_servicios}/presupuestos/editar/${presupuesto_id}`;
    return this.http.put(url, data, this.headers);
  }

  updateStatus(data: any, document_id: any) {
    const url = `${url_servicios}/presupuestos/update-status/${document_id}`;
    return this.http.put(url, data, this.headers);
  }
  deletePresupuesto(presupuesto_id: string) {
    const url = `${url_servicios}/presupuestos/remove/${presupuesto_id}`;
    return this.http.delete(url, this.headers);
  }



}
