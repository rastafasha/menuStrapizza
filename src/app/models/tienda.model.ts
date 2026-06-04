
import { environment } from "../../environments/environment";
import { Categoria } from "./categoria.model";

const base_url = environment.mediaUrlRemoto;

export class Tienda{
  constructor(
    public icono : string,
    public nombre: string,
    public slug: string,
    public local: string,
    public img: string,
    public img_hero: string,
    public descripcion_hero: string,
    public texto_hero_uno: string,
    public texto_hero_destacado: string,
    public texto_hero_dos: string,
    public color_fondo: string,
    public color_primario: string,
    public theme: string,
    public css_personalizado: string,
    public has_reservacion: boolean,
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
    public status?: string,
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

export class RedesSociales{
  constructor(
    public index?: string,
    public name_red?: string,
    public icono?: string,
    public usuario_red?: string,
  ){}
}

