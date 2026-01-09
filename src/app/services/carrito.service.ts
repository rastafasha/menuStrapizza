import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Carrito } from "../models/carrito.model";
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  public url;

  public carrito!: Carrito;

  constructor(
    private _http : HttpClient,
  ) {
    this.url = environment.baseUrl;
   }

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

  registro(data:any):Observable<any>{

    const url = `${base_url}/carritos`;
    return this._http.post(url, data, this.headers);
  }

  preview_carrito(_id:string):Observable<any>{


    const url = `${base_url}/carritos/limit/data/${_id}`;
    return this._http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, carrito: Carrito}) => resp.carrito)
        );
  }

  remove_carrito(id:string):Observable<any>{

    const url = `${base_url}/carritos/delete/${id}`;
    return this._http.delete(url, this.headers);
  }

}
