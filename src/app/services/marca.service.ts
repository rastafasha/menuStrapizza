import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Marca } from '../models/marca.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class MarcaService {


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


  cargarMarcas(){

    const url = `${base_url}/marcas`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, marcas: Marca[]}) => resp.marcas)
      )

  }


  getMarcaById(_id: string){
    const url = `${base_url}/marcas/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, marca: Marca}) => resp.marca)
        );

  }


  crearMarca(marca: {nombre: string, descripcion: string}){
    const url = `${base_url}/marcas`;
    return this.http.post(url, marca, this.headers);
  }

  actualizarMarca(marca: Marca){
    const url = `${base_url}/marcas/${marca._id}`;
    return this.http.put(url, marca, this.headers);
  }

  borrarMarca(_id:string){
    const url = `${base_url}/marcas/${_id}`;
    return this.http.delete(url, this.headers);
  }



}
