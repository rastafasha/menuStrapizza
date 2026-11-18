import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Producto } from '../models/producto.model';
import { Observable } from "rxjs";
import { Categoria, CatProducModel } from '../models/categoria.model';
import { environment } from '../../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  serverUrl = environment.baseUrl;


  public producto!: Producto;
  public categoria!: CatProducModel;
  private cacheTiendaId: string | null = null;
private productosTiendaCache$: Observable<Producto[]> | null = null;

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

  getProductos() {
    const url = `${base_url}/productos`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, productos: Producto[]}) => resp.productos)
      )
  }

  getProductosActivos() {
    const url = `${base_url}/productos/activos`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, productos: Producto[]}) => resp.productos)
      )
  }
  getProductosDestacados() {
    const url = `${base_url}/productos/destacados`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, productos: Producto[]}) => resp.productos)
      )
  }

  getProductoById(_id: string){
    const url = `${base_url}/productos/${_id}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, producto: Producto}) => resp.producto)
      );

  }

  
  
  listar_newest():Observable<any>{
    const url = `${base_url}/productos/productos_nuevos/show_producto`;
    return this.http.get<any>(url,  this.headers)
    .pipe(
      map((resp:{ok: boolean, productos: Producto}) => resp.productos)
      );
  }

  findProducto_by_Categorynombre(nombre: any):Observable<any>{
    const url = `${base_url}/productos/producto_by_categorynombre/${nombre}`;
    return this.http.get<any>(url)
  }
  bypedido(localId: any):Observable<any>{

     const url = `${base_url}/productos/bypedido/${localId}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, products: Producto}) => resp.products)
      );
  }


  // cat_by_name(name):Observable<any>{
  //   const url = `${base_url}/productos/categoria/name/`+name;
  //   return this.http.get(url, this.headers)
  //   .pipe(
  //     map((resp:{ok: boolean, producto: Producto}) => resp.producto)
  //     );
  // }
/**
   * @method: Método que obtiene producto por categoria
   * @author: malcolmc
   * @since 21/06/2022
   * @param _id {_id}: objeto a obtener
   */

  listar_productoCat(_id: any): Observable<Producto>{
    const url = `${base_url}/productos/productos_general/cat/${_id}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, productos: Producto}) => resp.productos)
      );

  }

  find_by_slug(slug: any):Observable<any>{
    const url = `${base_url}/productos/producto_by_slug/${slug}`;
    return this.http.get<any>(url)
    .pipe(
      map((resp:{ok: boolean, producto: Producto}) => resp.producto)
      );
  }
  find_by_branding(marca: any):Observable<any>{
    const url = `${base_url}/productos/producto_by_branding/${marca}`;
    return this.http.get<any>(url)
    .pipe(
      map((resp:{ok: boolean, productos: Producto}) => resp.productos)
      );
  }
  find_by_storeId(tienda: any):Observable<any>{
    const url = `${base_url}/productos/producto_by_tiendaId/${tienda}`;
    return this.http.get<any>(url)
    .pipe(
      map((resp:{ok: boolean, productos: Producto}) => resp.productos)
      );
  }

  

  // 1. Método para cat-adicionales (con caché para que 4 secciones hagan solo 1 petición)
find_by_storeIdActive(tienda: any): Observable<Producto[]> {
  if (!tienda) return of([]);

  // Si es la misma tienda y ya tenemos la petición en caché, la reutilizamos
  if (this.cacheTiendaId === tienda && this.productosTiendaCache$) {
    return this.productosTiendaCache$;
  }

  this.cacheTiendaId = tienda;
  const url = `${base_url}/productos/by_tiendaId_active/${tienda}`;
  
  this.productosTiendaCache$ = this.http.get<any>(url).pipe(
    map((resp: any) => Array.isArray(resp) ? resp : (resp?.productos || [])),
    shareReplay(1) // Comparte el resultado entre todas las instancias de cat-adicionales
  );

  return this.productosTiendaCache$;
}

// 2. Método exclusivo para el Infinite Scroll de cas-products.component.ts
find_by_storeIdActivePaginado(tienda: any, page: number = 1, limit: number = 20): Observable<any> {
  const url = `${base_url}/productos/by_tiendaId_active/${tienda}`;
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  return this.http.get<any>(url, { params });
}



  reducir_stock(id: any,cantidad: any):Observable<any>{

    const url = `${base_url}/productos/productos_stock/reducir/${id}/${cantidad}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, producto_data: Producto}) => resp.producto_data)
      );
  }

  aumentar_stock(id: any,cantidad: any):Observable<any>{

    const url = `${base_url}/productos/productos_stock/aumentar/${id}/${cantidad}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, producto_data: Producto}) => resp.producto_data)
      );
  }

  aumentar_ventas(id: any):Observable<any>{

    const url = `${base_url}/productos/productos_ventas/aumentar/${id}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, producto_data: Producto}) => resp.producto_data)
      );
  }

  listar_autocomplete():Observable<any>{
    const url = `${base_url}/productos/producto_cliente_autocomplete`;
    return this.http.get(url,  this.headers);
  }

  getProductoByCategoryName(nombre:any):Observable<any>{

    const url = `${base_url}/productos/producto_by_categorynombre/${nombre}`;
    return this.http.get<any>(url, this.headers)
    .pipe(
      map((resp:{ok: boolean, productos: Producto}) => resp.productos)
      );
  }


  search(query=''){
    return this.http.get(`${base_url}/productos/search`, {params: {buscar: query}})

  }







}
