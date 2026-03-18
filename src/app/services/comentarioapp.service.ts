import { Injectable } from '@angular/core';
import { ComentarioApp } from '../models/comentarioapp.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ComentarioappService {

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
  
    create(data: any){
      const url = `${base_url}/comentariosapp/store`;
      return this.http.post(url, data, this.headers);
    }

   
}
