import { environment } from "../../environments/environment";

const base_url = environment.baseUrl;

export class Categoria{
  constructor(
    public icono : string,
    public nombre: string,
    public img: string,
    public slug: string,
    public state_banner : boolean,
    public subcategorias?: string,
    public _id?: string

  ){
  }

}

export class CatProducModel {



    constructor(
      public titulo: string,
        public precio_ahora: number,
        public precio_antes: number,
        public video_review: string,
        public info_short: string,
        public detalle: string,
        public stock: string,
        public categoria: string,
        public subcategoria: string,
        public nombre_selector: string,
        public marca: string,
        public img: string,
        public poster: string,
        public stars: string,
    public _id: string
    ){

    }

}
