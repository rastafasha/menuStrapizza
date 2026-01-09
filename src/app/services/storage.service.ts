import { Injectable } from '@angular/core';
import { CartItemModel } from '../models/cart-item-model';
import { Producto } from '../models/producto.model';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  productos: Producto[] = [];

  constructor() { }

  existCart():boolean{
    return localStorage.getItem('cart') != null;
  }

  setCart(cart: CartItemModel[]): void{
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  getCart(): CartItemModel[]{
    return JSON.parse(localStorage.getItem('cart') || '{}');

  }
  clear():void{
    localStorage.removeItem('cart');
  }

  guardarProducto(producto: Producto){

    const existe = this.productos.find( prod => prod.titulo ===  producto.titulo);

    if(!existe) {
      this.productos.unshift(producto);
      localStorage.setItem('bandejaItems', JSON.stringify(producto));

    }

    // this.presentToast('Agregado a Favoritos');

  }

  guardarProductoFav(producto: Producto){

    const existe = this.productos.find( prod => prod.titulo ===  producto.titulo);

    if(!existe) {
      this.productos.unshift(producto);
      localStorage.setItem('favoritos', JSON.stringify(producto));

    }

    // this.presentToast('Agregado a Favoritos');

  }

  async cargarFavoritos(){
    const favoritos = await localStorage.getItem('favoritos');

    // if(favoritos){
    //   this.productos = favoritos;
    // }

  }

  borrarFavorito( producto: Producto){
    this.productos = this.productos.filter(prod => prod.titulo !== producto.titulo);


  }



  // async presentToast(message: string) {
  //   const toast = await this.toastController.create({
  //     message,
  //     duration: 2000
  //   });
  //   toast.present();
  // }
}
