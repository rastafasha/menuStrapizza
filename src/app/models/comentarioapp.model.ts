import { Usuario } from "./usuario.model";

export class ComentarioApp{
    constructor(
        public _id: string,
        public comentario: string,
        public pros: string,
        public cons: number,
        public estrellas: string,
        public user: Usuario,
        public createdAt: Date,
        public updatedAt: Date,
    ){
    }
}