import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.baseUrl

@Pipe({
  name: 'imagenPipe'
})
export class ImagenPipe implements PipeTransform {

  transform(img: string, tipo: 'usuarios'|'categorias'|'marcas'|'productos'|'congenerals'
  |'promocions'|'galerias'|'ingresos'|'blogs' |'pages' |'cursos'|'sliders'|'tiendas'): string {

    if(!img){
      return `${base_url}/uploads/categorias/no-image.jpg`;
    } else if(img.includes('https')){
      return img;
    } else if(img){
      return `${base_url}/uploads/${tipo}/${img}`;
    }else {
      return `${base_url}/uploads/no-image.jpg`;
    }


  }

}
