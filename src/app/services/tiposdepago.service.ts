import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PaymentMethod } from '../models/paymenthmethod.model';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class TiposdepagoService {

    paymentMethods!: PaymentMethod;

  
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


  getPaymentMethods(){

    const url = `${base_url}/tipopago/`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, paymentMethods: PaymentMethod[]}) => resp.paymentMethods)
      )

  }


  getPaymentMethodById(_id: string){
    const url = `${base_url}/tipopago/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, paymentMethod: PaymentMethod}) => resp.paymentMethod)
        );

  }
  getPaymentMethodByName(name: string){
    const url = `${base_url}/tipopago/name/${name}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, paymentMethod: PaymentMethod}) => resp.paymentMethod)
        );

  }
  getPaymentMethodByUserId(_id: string){
    const url = `${base_url}/tipopago/user/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, paymentMethods: PaymentMethod[]}) => resp.paymentMethods)
        );

  }

  crearPaymentMethod(paymentMethod: any){
    const url = `${base_url}/tipopago/store`;
    return this.http.post(url, paymentMethod, this.headers);
  }

  



  actualizarPaymentMethod(paymentMethod: PaymentMethod){
    const url = `${base_url}/tipopago/update/${paymentMethod._id}`;
    return this.http.put(url, paymentMethod, this.headers);
  }

  borrarPaymentMethod(_id:string){
    const url = `${base_url}/tipopago/remove/${_id}`;
    return this.http.delete(url, this.headers);
  }

  updateStatus(paymentMethod: PaymentMethod){
    const url = `${base_url}/tipopago/statusupdate/${paymentMethod._id}`;
    return this.http.put(url, paymentMethod, this.headers);
  }


}
