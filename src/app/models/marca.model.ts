import { environment } from "../../environments/environment";

const base_url = environment.baseUrl;
export class Marca {
  constructor(
    public nombre: string,
    public descripcion: string,
    public img: string,
    public slug: string,
    public _id?: string
  ){}

  get imagenUrl(){

    if(!this.img){
      return `${base_url}/uploads/marcas/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/uploads/marcas/${this.img}`;
    }else {
      return `${base_url}/uploads/marcas/no-image.jpg`;
    }

  }




}
