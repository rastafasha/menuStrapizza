import { environment } from "../../environments/environment";

const base_url = environment.mediaUrlRemoto;
export class Usuario {
  constructor(
    public first_name: string,
    public last_name: string,
    public pais: string,
    public telefono: string,
    public numdoc: string,
    public email: string,
    public password?: string,
    public img?: string,
    public google?: boolean,
    public role?: 'ADMIN' | 'USER' | 'VENTAS',
    public uid?: string
  ){}

  get imagenUrl(){

    if(!this.img){
      return `${base_url}/uploads/usuarios/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/uploads/usuarios/${this.img}`;
    }else {
      return `${base_url}/uploads/usuarios/no-image.jpg`;
    }

  }




}
