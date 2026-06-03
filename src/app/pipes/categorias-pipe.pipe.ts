import { Pipe, PipeTransform } from '@angular/core';
import { Categoria } from '../models/categoria.model';

@Pipe({
  name: 'categoriasPipe'
})

export class CategoriasPipePipe implements PipeTransform {

  transform(categories: Categoria[]): Categoria[] {
      if (!categories) {
        return [];
      }
      return categories.filter(
        category => category.nombre !== 'bebidas' 
        && category.nombre !== 'postres'
        && category.nombre !== 'combos'
        && category.nombre !== 'entradas'
      );
    }
  

}
