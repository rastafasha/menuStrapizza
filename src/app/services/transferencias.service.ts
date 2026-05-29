import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TransferenciasService {

  url: string;

  constructor(
    private _http: HttpClient
  ) {
    this.url = environment.baseUrl;
  }

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


  // registrar transferencia que hizo el usuario
  createTransfer(transfer: any) {
    return this._http.post<any>(`${this.url}/transferencias/store`, transfer);
  }

  getByUser(usuario: any, page: number = 1, limit: number = 6,) {
    // Construimos la URL con parámetros de paginación
    const url = `${this.url}/transferencias/user/${usuario}?page=${page}&limit=${limit}`;

    return this._http.get<any>(url, this.headers)
      .pipe(
        // Importante: Si la API devuelve un array, asegúrate que el tipado sea Payment[]
        map((resp: { ok: boolean, transferencias: any[] }) => resp.transferencias)
      );


  }



}
