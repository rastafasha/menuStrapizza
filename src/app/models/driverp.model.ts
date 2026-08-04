import { Asignacion } from "./asignaciondelivery.model";
import { Usuario } from "./usuario.model";
import { environment } from "../../environments/environment";

const base_url = environment.mediaUrlRemoto;
export class Driver {
     constructor(
        public user : Usuario,
        public tipo_vehiculo: string,
        public placa: string,
        public color: string,
        public year: string,
        public marca: string,
        public modelo: string,
        public asignaciones: Asignacion,
        public status: string,
        public licencianum: string,
        public img?: string,
        public _id?: string

    
      ){}

      get imagenUrl(){

    if(!this.img){
      return `${base_url}/uploads/drivers/no-image.jpg`;
    } else if(this.img.includes('https')){
      return this.img;
    } else if(this.img){
      return `${base_url}/uploads/drivers/${this.img}`;
    }else {
      return `${base_url}/uploads/drivers/no-image.jpg`;
    }

  }

}