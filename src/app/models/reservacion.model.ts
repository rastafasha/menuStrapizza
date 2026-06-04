export class Reservacion{
  constructor(
    public _id: string,
    public fecha: Date,
    public personas: number,
    public hora: string,
    public listaespera: boolean,
    public first_name: string,
    public last_name: string,
    public email: string,
    public telefono: string,
    public comensal_alergia: string,
    public comentarios_alergia: string,
    public comentarios: string,
    public status: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada',
    public observaciones: string,
    public local: string,
    public usuario: string,
    public createdAt: Date,
    public updatedAt: Date,

  ){}
}