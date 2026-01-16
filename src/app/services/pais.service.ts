import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Pais } from '../models/pais.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;
@Injectable({
  providedIn: 'root'
})
export class PaisService {

  
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
  
  
    getPaises(){
  
      const url = `${base_url}/paises`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp:{ok: boolean, paises: Pais}) => resp.paises)
        )
  
    }
  
  
    getPageById(_id: string){
      const url = `${base_url}/paises/${_id}`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp:{ok: boolean, pais: Pais}) => resp.pais)
          );
  
    }
    getPageByCode(code: string){
      const url = `${base_url}/paises/code/${code}`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp:{ok: boolean, pais: Pais}) => resp.pais)
          );
  
    }
}
