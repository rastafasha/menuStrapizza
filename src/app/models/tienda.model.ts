import { environment } from "../environments/environment";
import { Categoria } from "./categoria.model";

const base_url = environment.mediaUrlRemoto;

export class Tienda{
  constructor(
    public icono : string,
    public nombre: string,
    public slug: string,
    public local: string,
    public state_banner : boolean,
    public img: string,
    public redssociales?: string,
    public telefono?: string,
    public productos?: string,
    public direccion?: string,
    public pais?: string,
    public ciudad?: string,
    public moneda?: string,
    public zip?: string,
    public user?: string,
    public categoria?: Categoria,
    public subcategoria?: string,
    public isFeatured?: boolean,
    public iva?: number,
    public status?: boolean,
    public _id?: string

  ){
  }

  get imagenUrl(){

    if(!this.img){
      return `${base_url}/uploads/locaciones/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/locaciones/${this.img}`;
    }else {
      return `${base_url}/uploads/locaciones/no-image.jpg`;
    }

  }
}

