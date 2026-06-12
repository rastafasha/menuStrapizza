import { environment } from '../../environments/environment';
import { Categoria } from './categoria.model';
import { Color } from './color.model';
import { Marca } from './marca.model';
import { Selector } from './selector.model';

const base_url = environment.mediaUrlRemoto;
export class Producto {

  // 🌐 CAMPOS INTERNACIONALIZADOS (Ahora son objetos { es, en })
  titulo!: { es: string; en: string };
  info_short!: { es: string; en: string };
  detalle!: { es: string; en: string };

  precio_ahora: number;
  precio_antes!: string;
  video_review!: string;
  comentarios!: string;
  slug!: string;
  stock!: number;
  cantidad!:number;
  categoria!: Categoria;
  // subcategoria!: string;
  subcategoria?: { es: string; en: string };
  marca!: Marca;
  color!: Color;
  nombre_selector!: string;
  selector_elegido!:string;
  isFeatured!: boolean;
  selector?: Selector;
  status!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  img!: string;
  _id?: string;
  
constructor(id: string | undefined, name: string, description: string, category: any, price: number ){
    this._id = id;
    
    // Asignamos el string plano dentro del objeto bilingüe
    this.titulo = { es: name, en: '' };
    this.detalle = { es: description, en: '' };
    
    this.categoria = category;
    this.precio_ahora = price;
}


  get imagenUrl(){

    if(!this.img){
      return `${base_url}/uploads/productos/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/uploads/productos/${this.img}`;
    }else {
      return `${base_url}/uploads/productos/no-image.jpg`;
    }

  }
}
