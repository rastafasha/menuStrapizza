import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Observable } from "rxjs";
import { Categoria } from '../models/categoria.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  serverUrl = environment.baseUrl;



  public categoria!: Categoria;

  constructor(private http: HttpClient) { }

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

  
  private url: string = 'json/categories.json';

  getCategorieslocal() {
    return this.http.get<Categoria[]>(this.url);
  }

  getCategories() {
    const url = `${base_url}/categorias`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, categorias: Categoria[]}) => resp.categorias)
      )
  }

  getCategoriesActivas() {
    const url = `${base_url}/categorias/cat/activas`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, categorias: Categoria[]}) => resp.categorias)
      )
  }
  getCategoriaById(_id: string){
    const url = `${base_url}/categorias/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, categoria: Categoria}) => resp.categoria)
        );

  }

   find_by_nombre(nombre:string):Observable<any>{
    const url = `${base_url}/categorias/category_by_nombre/nombre/${nombre}`;
    return this.http.get<any>(url)
    .pipe(
      map((resp:{ok: boolean, categoria:any}) => resp)
      );
  }
   find_by_subcategory(id:string):Observable<any>{
    const url = `${base_url}/categorias/category_by_subcategoria/${id}`;
    return this.http.get<any>(url)
    .pipe(
      map((resp:{ok: boolean, categoria:any}) => resp)
      );
  }


}
