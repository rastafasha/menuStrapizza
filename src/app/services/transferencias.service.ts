import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TransferenciasService {

  url:string;

  constructor(
    private _http: HttpClient
  ){
    this.url = environment.baseUrl;
  }

  // obtener metodos de pago cargados en BBDD
  getPayments(){
    return this._http.get<any>(`${this.url}/tipopago`);
  }
 getPaymentsActives(){
    return this._http.get<any>(`${this.url}/tipopago/actives`);
  }
 

  // registrar transferencia que hizo el usuario
  createTransfer(transfer:any){
    return this._http.post<any>(`${this.url}/transferencias/store`,transfer);
  }
}
