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

    return categories.filter(category => {
      // 🛡️ SOPORTE HÍBRIDO: Si es objeto usa .es, si ya es string plano lo usa directo
      let nombreEs = '';

      if (category.nombre && typeof category.nombre === 'object') {
        nombreEs = category.nombre.es || '';
      } else if (typeof category.nombre === 'string') {
        nombreEs = category.nombre;
      }

      const nombreLimpio = nombreEs.toLowerCase().trim();

      // Excluimos las categorías del negocio
      return nombreLimpio !== 'bebidas'
        && nombreLimpio !== 'postres'
        && nombreLimpio !== 'combos'
        && nombreLimpio !== 'entradas'
        && nombreLimpio !== ''; // Evita renderizar categorías vacías
    });
  }


}
