import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Selector } from "../models/selector.model";
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SelectorService {


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


  cargarSelectors(){

    const url = `${base_url}/selectors`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, selectors: Selector[]}) => resp.selectors)
      )

  }

  selectorByProduct(id:string){
    const url = `${base_url}/selectors/selector_producto/find/${id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, selector: Selector}) => resp.selector)
        );
  }

  crearSelector(data:any):Observable<any>{
    const url = `${base_url}/selectors`;
    return this.http.post(url, data, this.headers);
  }

  actualizarSelector(_id:string, titulo: string, producto: string){
    const url = `${base_url}/selectors/${_id}`;
    return this.http.put(url, {titulo, producto}, this.headers);
  }

  borrarSelector(_id:string){
    const url = `${base_url}/selectors/${_id}`;
    return this.http.delete(url, this.headers);
  }

  listar(id:string):Observable<any>{
    const url = `${base_url}/selectors/${id}`;
    return this.http.get(url, this.headers);
  }

  estado(id:string):Observable<any>{
    const url = `${base_url}/selectors/${id}`;
    return this.http.put(url, this.headers);
  }


}
