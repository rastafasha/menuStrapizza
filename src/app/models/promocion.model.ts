import { environment } from "../../environments/environment";


const base_url = environment.baseUrl;
export class Promocion {
  constructor(
    public producto_title: string,
    public first_title: string,
    public etiqueta: string,
    public subtitulo: string,
    public end: string,
    public enlace: string,
    public estado: boolean,
    public colorfondo: string,
    public tipo: 'DESING' |'IMAGEN' ,
    public img: string,
    public _id?: string
  ){}

  get imagenUrl(){

    if(!this.img){
      return `assets/image/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/uploads/promocions/${this.img}`;
    }else {
      return `${base_url}/uploads/promocions/no-image.jpg`;
    }

  }




}
