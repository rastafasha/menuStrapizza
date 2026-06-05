import { Usuario } from "./usuario.model";

export class Comentario{
    _id!:string;
    comentario!:string;
    pros!:string;
    cons!:string;
    estrellas!:string;
    user!:Usuario;
    producto!:string;
    local!:string;
    
}
