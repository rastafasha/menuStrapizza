import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { TasaEurobcv } from '../models/tasaeurobcv';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class TasaeurobcvService {

  public tasaeurobcv!: TasaEurobcv;

  constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  get headers() {
    return {
      headers: {
        'auth_token': this.token
      }
    }
  }


  getTasas() {
    const url = `${baseUrl}/tasaeurobcv`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, tasas: TasaEurobcv }) => resp.tasas)
      )
  }
  getUltimaTasa() {
    const url = `${baseUrl}/tasaeurobcv/ultimatasa`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, tasa: TasaEurobcv }) => resp.tasa)
      )
  }

  createTasaBcv(tasa: any) {
    const url = `${baseUrl}/tasaeurobcv/crear`;
    return this.http.post(url, tasa, this.headers);
  }


  updateTasaBcv(tasa: TasaEurobcv, id: number) {
    return this.http.put<any>(baseUrl + '/tasaeurobcv/editar/' + id, tasa, this.headers)
  }

  deleteTasaBcv(tasa: any) {
    const url = `${baseUrl}/tasaeurobcv/borrar/${tasa}`;
    return this.http.delete(url, this.headers);
  }
}
