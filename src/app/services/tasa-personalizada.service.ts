import { Injectable } from '@angular/core';
import { TasaPersonalizada } from '../models/tasaPersonalizada.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class TasaPersonalizadaService {
public tasapersonalizada!: TasaPersonalizada;

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


  getTasasByUser(iduser: string) {
    const url = `${baseUrl}/tasapersonalizada/${iduser}`;
    return this.http.get<any>(url, this.headers);
  }


  createTasa(tasa: any) {
    const url = `${baseUrl}/tasapersonalizada/crear`;
    return this.http.post(url, tasa, this.headers);
  }


  updateTasa(tasa: TasaPersonalizada, id: number) {
    return this.http.put<any>(baseUrl + '/tasapersonalizada/editar/' + id, tasa, this.headers)
  }


  deleteTasaPersonalizada(tasa: any) {
    const url = `${baseUrl}/tasapersonalizada/borrar/${tasa}`;
    return this.http.delete(url, this.headers);
  }
}
