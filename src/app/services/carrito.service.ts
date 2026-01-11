import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Carrito } from "../models/carrito.model";
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  public url;

  public carrito!: Carrito;

  // Reactive cart state using BehaviorSubject
  private bandejaListSubject = new BehaviorSubject<any[]>([]);
  bandejaList$ = this.bandejaListSubject.asObservable();

  constructor(
    private _http : HttpClient,
  ) {
    this.url = environment.baseUrl;
    this.loadBandejaListFromLocalStorage();
   }

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

  // Load initial data from localStorage
  private loadBandejaListFromLocalStorage() {
    const storedItems = localStorage.getItem('bandejaItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        this.bandejaListSubject.next(items);
      } catch (e) {
        console.error('Error parsing bandejaList from localStorage', e);
        this.bandejaListSubject.next([]);
      }
    }
  }

  // Save to localStorage and notify subscribers
  private saveBandejaListToLocalStorage(items: any[]) {
    try {
      localStorage.setItem('bandejaItems', JSON.stringify(items));
      this.bandejaListSubject.next(items);
    } catch (e) {
      console.error('Error saving bandejaList to localStorage', e);
    }
  }

  // Get current value synchronously
  getBandejaList(): any[] {
    return this.bandejaListSubject.getValue();
  }

  // Add item to cart
  addItem(producto: any): void {
    const currentList = this.getBandejaList();
    
    const index = currentList.findIndex(item =>
      item === producto ||
      ((item as any)._id && (producto as any)._id && (item as any)._id === (producto as any)._id) ||
      ((item as any).name && (producto as any).name && (item as any).name === (producto as any).name)
    );

    if (index !== -1) {
      if (currentList[index].cantidad) {
        currentList[index].cantidad += 1;
      } else {
        currentList[index].cantidad = 1;
      }
    } else {
      const newItem = { ...producto, cantidad: 1 };
      currentList.push(newItem);
    }

    this.saveBandejaListToLocalStorage(currentList);
  }

  // Remove item from cart
  removeItem(producto: any): void {
    const currentList = this.getBandejaList();
    
    const index = currentList.findIndex(item =>
      item === producto ||
      ((item as any)._id && (producto as any)._id && (item as any)._id === (producto as any)._id) ||
      ((item as any).name && (producto as any).name && (item as any).name === (producto as any).name)
    );

    if (index === -1) return;

    if (currentList[index].cantidad && currentList[index].cantidad > 1) {
      currentList[index].cantidad -= 1;
    } else {
      currentList.splice(index, 1);
    }

    this.saveBandejaListToLocalStorage(currentList);
  }

  // Clear entire cart
  clearCart(): void {
    this.saveBandejaListToLocalStorage([]);
  }

  // Get total items count
  getTotalItems(): number {
    return this.getBandejaList().length;
  }

  registro(data:any):Observable<any>{

    const url = `${base_url}/carritos`;
    return this._http.post(url, data, this.headers);
  }

  preview_carrito(_id:string):Observable<any>{


    const url = `${base_url}/carritos/limit/data/${_id}`;
    return this._http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, carrito: Carrito}) => resp.carrito)
        );
  }

  remove_carrito(id:string):Observable<any>{

    const url = `${base_url}/carritos/delete/${id}`;
    return this._http.delete(url, this.headers);
  }

}
