import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Color } from '../models/color.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ColorService {


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


  cargarColors(){

    const url = `${base_url}/colors`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, colors: Color[]}) => resp.colors)
      )

  }


  getColorById(_id: string){
    const url = `${base_url}/colors/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, color: Color}) => resp.color)
        );

  }

  listar(id:string):Observable<any>{
    const url = `${base_url}/colors/${id}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, color: Color}) => resp.color)
      );
  }

  colorByProduct(id:string){
    const url = `${base_url}/colors/color_producto/find/${id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, color: Color}) => resp.color)
        );
  }



  crearColor(data:any):Observable<any>{
    const url = `${base_url}/colors`;
    return this.http.post(url, data, this.headers);
  }

  actualizarColor(color: Color){
    const url = `${base_url}/colors/${color._id}`;
    return this.http.put(url, color, this.headers);
  }

  borrarColor(_id:string){
    const url = `${base_url}/colors/${_id}`;
    return this.http.delete(url, this.headers);
  }

  estado(id:string):Observable<any>{
    const url = `${base_url}/colors/${id}`;
    return this.http.put(url, this.headers);

  }



}
