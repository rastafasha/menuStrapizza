import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido.model';
const base_url = environment.baseUrl;
@Injectable({
  providedIn: 'root'
})
export class PedidomenuService {

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


    gets(){
  
      const url = `${base_url}/pedidomenu`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp:{ok: boolean, pedidos: Pedido}) => resp.pedidos)
        )
  
    }
  
  
    getById(_id: string){
      const url = `${base_url}/pedidomenu/${_id}`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp:{ok: boolean, pedido: Pedido}) => resp.pedido)
          );
  
    }
    getByUserId(_id: string){
      const url = `${base_url}/pedidomenu/user/${_id}`;
      return this.http.get<any>(url, this.headers)
        .pipe(
          map((resp:{ok: boolean, pedidos: Pedido[]}) => resp.pedidos)
          );
  
    }
  
  
    create(pedido: any){
      const url = `${base_url}/pedidomenu/store`;
      return this.http.post(url, pedido, this.headers);
    }

    actualizar(pedido: Pedido){
      const url = `${base_url}/pedidomenu/update/${pedido._id}`;
      return this.http.put(url, pedido, this.headers);
    }
  
    borrarPedido(_id:string){
      const url = `${base_url}/pedidomenu/remove/${_id}`;
      return this.http.delete(url, this.headers);
    }
   
}
