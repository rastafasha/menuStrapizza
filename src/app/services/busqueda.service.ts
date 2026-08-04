import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { of } from 'rxjs';

import { Transferencia } from '../models/transferencia';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { Reservacion } from '../models/reservacion.model';
import { Presupuesto } from '../models/presupuesto';



const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class BusquedasService {
  constructor(private http: HttpClient) {}

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token,
      },
    };
  }

  private trasnformarUsuarios(resultados: any[]): Usuario[] {
    return resultados.map(
      (user) =>
        new Usuario(
          user.first_name,
          user.last_name,
          user.pais,
          user.telefono,
          user.email,
          user.numdoc || '',
          user.img,
          undefined, // password
          user.google || false,
          user.role,
          user.uid,
          user.createdAt ? new Date(user.createdAt) : undefined,
        )
    );
  }

  
  private trasnformarTransferencias(resultados: any[]): Transferencia[] {
  // Aquí podrías agregar lógica de fechas si tu modelo Facturacion la requiere
  return resultados; 
}
  private trasnformarReservaciones(resultados: any[]): Reservacion[] {
  // Aquí podrías agregar lógica de fechas si tu modelo Facturacion la requiere
  return resultados; 
}
  private trasnformarPresupuesto(resultados: any[]): Presupuesto[] {
  // Aquí podrías agregar lógica de fechas si tu modelo Facturacion la requiere
  return resultados; 
}

 


 buscar(
    tipo: 'usuarios' | 'transferencias'|'reservaciones'|'presupuestos' ,
    termino: string = ''
  ) {
    // Si el término está vacío, podrías retornar un array vacío o manejarlo según tu UX
   if (!termino || termino.trim().length === 0) { 
        return of([]); 
    }

    const url = `${base_url}/todo/coleccion/${tipo}/${termino}`;
    
    return this.http.get<any>(url, this.headers).pipe(
      map((resp: any) => {
        switch (tipo) {
          case 'usuarios':
            return this.trasnformarUsuarios(resp.resultados);
          case 'transferencias':
            return this.trasnformarTransferencias(resp.resultados);
          case 'reservaciones':
            return this.trasnformarReservaciones(resp.resultados);
          case 'presupuestos':
            return this.trasnformarPresupuesto(resp.resultados);
          default:
            return [];
        }
      })
    );
  }

  searchGlobal(termino: string) {
    const url = `${base_url}/todo/${termino}`;
    return this.http.get<any[]>(url, this.headers);
  }

 
    
}
