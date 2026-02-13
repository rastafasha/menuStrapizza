import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PagoEfectivo } from '../models/pagoEfectivo.model';
import { environment } from '../../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PagoEfectivoService {

  public url:any;
  
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


  registro(data:any){
    return this.http.post<any>(`${base_url}/pagoefectivo/store`,data);
  }

}
