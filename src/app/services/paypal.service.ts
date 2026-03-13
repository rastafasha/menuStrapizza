import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Paypal } from '../models/paypal.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  paypal!: Paypal;


  constructor(
    private http: HttpClient
  ) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }


  getPaypals() {

    const url = `${base_url}/paypal/`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, paypals: Paypal[] }) => resp.paypals)
      )

  }

  getPaypalById(_id: string) {
    const url = `${base_url}/paypal/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, paypal: Paypal }) => resp.paypal)
      );

  }

  getPaypalByTiendaId(_id: string) {
    const url = `${base_url}/paypal/tienda/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, paypals: Paypal[] }) => resp.paypals)
      );

  }

  crearPaypal(paypal: any) {
    const url = `${base_url}/paypal/store`;
    return this.http.post(url, paypal, this.headers);
  }



  actualizarPaypal(paypal: Paypal) {
    const url = `${base_url}/paypal/update/${paypal._id}`;
    return this.http.put(url, paypal, this.headers);
  }

  borrarPaypal(_id: string) {
    const url = `${base_url}/paypal/remove/${_id}`;
    return this.http.delete(url, this.headers);
  }

}
