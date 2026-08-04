import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

const url_servicios = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {


  constructor(
    public http: HttpClient,
    public authService: AuthService,

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
    let headers = new HttpHeaders({ 'Authorization': 'Bearer' + this.authService.token })
    let URL = url_servicios + '/presupuestos';
    return this.http.get(URL, this.headers);
  }


  getPresupuesto(id: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer' + this.authService.token });
    let URL = url_servicios + '/presupuestos/' + id;
    return this.http.get(URL, this.headers);
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
  getPrByCliente(usuario: any, page: number = 1, limit: number = 6,) {
    // Construimos la URL con parámetros de paginación
    const url = `${url_servicios}/presupuestos/cliente/${usuario}?page=${page}&limit=${limit}`;

    return this.http.get<any>(url, this.headers)
      .pipe(
        // Importante: Si la API devuelve un array, asegúrate que el tipado sea Payment[]
        map((resp: { ok: boolean, presupuestos: any[] }) => resp.presupuestos)
      );
  }

  createPresupuesto(data: any) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer' + this.authService.token })
    const URL = url_servicios + '/presupuestos/crear';
    return this.http.post(URL, data, this.headers);
  }
  editPresupuesto(data: any, presupuesto_id: any) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer' + this.authService.token })
    const URL = url_servicios + '/presupuestos/editar/' + presupuesto_id;
    return this.http.put(URL, data, this.headers);
  }

   updateStatus(data: any, document_id: any) {
    const url = `${url_servicios}/presupuestos/update-status/${document_id}`;
    return this.http.put(url, data, this.headers);
  }
  deletePresupuesto(presupuesto_id: string) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer' + this.authService.token })
    const URL = url_servicios + '/presupuestos/borrar/' + presupuesto_id;
    return this.http.delete(URL, this.headers);
  }



}
