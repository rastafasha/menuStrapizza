import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Solicitud } from '../models/solicitud.model';
import { environment } from '../../environments/environment';

const url_servicios = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

   // Reactive cart state using BehaviorSubject
    private bandejaListPedidoSubject = new BehaviorSubject<any[]>([]);
    bandejaListPedido$ = this.bandejaListPedidoSubject.asObservable();

  constructor(
    public http: HttpClient,

  ) { 
    this.loadBandejaListFromLocalStorage();
  }

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

   // Load initial data from localStorage
  private loadBandejaListFromLocalStorage() {
    const storedItems = localStorage.getItem('bandejaPedidoItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        this.bandejaListPedidoSubject.next(items);
      } catch (e) {
        console.error('Error parsing bandejaList from localStorage', e);
        this.bandejaListPedidoSubject.next([]);
      }
    }
  }

  list() {
    const url = `${url_servicios}/solicitudes`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, solicitudes: Solicitud }) => resp.solicitudes)
      )
  }


  getSolicitud(_id: any) {
    const url = `${url_servicios}/solicitudes/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, solicitud: Solicitud }) => resp.solicitud)
      );
  }

  getSolicitudByUser(usuario: any, page: number = 1, limit: number = 6,) {
    // Construimos la URL con parámetros de paginación
    const url = `${url_servicios}/solicitudes/user/${usuario}?page=${page}&limit=${limit}`;

    return this.http.get<any>(url, this.headers)
      .pipe(
        // Importante: Si la API devuelve un array, asegúrate que el tipado sea Payment[]
        map((resp: { ok: boolean, solicitudes: any[] }) => resp.solicitudes)
      );
  }

  getByTiendaId(_id: string) {
    const url = `${url_servicios}/solicitudes/by_tiendaId/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, solicitudes: Solicitud[] }) => resp.solicitudes)
      );

  }

   // Save to localStorage and notify subscribers
  private saveBandejaListToLocalStorage(items: any[]) {
    try {
      localStorage.setItem('bandejaPedidoItems', JSON.stringify(items));
      this.bandejaListPedidoSubject.next(items);
    } catch (e) {
      console.error('Error saving bandejaList to localStorage', e);
    }
  }

  // Get current value synchronously
  getBandejaList(): any[] {
    return this.bandejaListPedidoSubject.getValue();
  }

  // Generate a unique item key that includes nombre_selector for pasta products
  private getItemKey(item: any): string {
    // For pasta items with a selector, create a composite key
    if ((item.subcategoria === 'Pastas' || item.subcategorias === 'Pastas') && item.nombre_selector) {
      return `${item._id || item.id || item.name}_${item.nombre_selector}`;
    }
    // For regular items, use just the id or name
    return item._id || item.id || item.name || JSON.stringify(item);
  }

   // Add item to cart
  addItem(producto: any): void {
    const currentList = this.getBandejaList();

    // Find index using the composite key that includes selector for pasta products
    const index = currentList.findIndex(item => this.getItemKey(item) === this.getItemKey(producto));

    if (index !== -1) {
      // Item exists - increment quantity
      if (currentList[index].cantidad) {
        currentList[index].cantidad += 1;
      } else {
        currentList[index].cantidad = 1;
      }

      // Update selector for pasta items when same product is added with different selector
      if ((producto.subcategoria === 'Pastas' || producto.subcategorias === 'Pastas') && producto.nombre_selector) {
        // Initialize selector property if not exists
        if (!currentList[index].nombre_selector) {
          currentList[index].nombre_selector = '';
        }
        currentList[index].nombre_selector = producto.nombre_selector;
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
    
    // Find index using the composite key that includes selector for pasta products
    const index = currentList.findIndex(item => this.getItemKey(item) === this.getItemKey(producto));

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

  createSolicitud(solicitud: any) {
    const url = `${url_servicios}/solicitudes/crear`;
    return this.http.post(url, solicitud, this.headers);
  }
  editSolicitud(data: any, solicitud_id: any) {
    const url = `${url_servicios}/solicitudes/editar/${solicitud_id}`;
    return this.http.put(url, data, this.headers);
  }

  updateStatus(data: any, solicitud_id: any) {
    const url = `${url_servicios}/solicitudes/update-status/${solicitud_id}`;
    return this.http.put(url, data, this.headers);
  }
  deleteSolicitud(solicitud_id: string) {
    const url = `${url_servicios}/solicitudes/remove/${solicitud_id}`;
    return this.http.delete(url, this.headers);
  }
}
