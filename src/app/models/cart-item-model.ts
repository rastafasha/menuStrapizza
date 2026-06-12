import { Categoria } from "./categoria.model";
import { Producto } from "./producto.model";

export class CartItemModel {

    productId?: string;
    productName: string;
    productPrice:number;
    description:string;
    quantity:number;
    category_name!:string;
    category!:Categoria;
    img!:string;

   constructor(product: Producto){
  this.productId = product._id;
  
  // Extraemos la propiedad .es del objeto bilingüe
  this.productName = product.titulo ? product.titulo.es : '';
  this.description = product.detalle ? product.detalle.es : '';
  
  this.productPrice = product.precio_ahora;
  this.quantity = 1;
}



}
