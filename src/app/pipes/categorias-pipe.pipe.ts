import { Pipe, PipeTransform } from '@angular/core';
import { Categoria } from '../models/categoria.model';

@Pipe({
  name: 'categoriasPipe',
  standalone: true // Cambia a false si lo declaras en un NgModule tradicional
})
export class CategoriasPipePipe implements PipeTransform {

  // Lista centralizada de secciones secundarias (ES / EN, singular y plural)
  private readonly seccionesSecundarias = new Set([
    'bebida', 'bebidas', 'drink', 'drinks', 'beverage', 'beverages',
    'postre', 'postres', 'dessert', 'desserts',
    'combo', 'combos',
    'entrada', 'entradas', 'starter', 'starters', 'appetizer', 'appetizers',
    'extra', 'extras', 'adicional', 'adicionales', 'side', 'sides'
  ]);

  transform(categories: any[]): any[] {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }

    const vistas = new Set<string>();

    return categories.filter(category => {
      if (!category) return false;

      // 1. Extraemos el nombre base en español (o string plano)
      let nombreBase = '';
      if (category.nombre && typeof category.nombre === 'object') {
        nombreBase = category.nombre.es || category.nombre.en || '';
      } else if (typeof category.nombre === 'string') {
        nombreBase = category.nombre;
      }

      // 2. Normalizamos: minúsculas, sin espacios extra y sin tildes
      const nombreLimpio = nombreBase
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // 3. Descartamos vacíos o secciones secundarias
      if (!nombreLimpio || this.seccionesSecundarias.has(nombreLimpio)) {
        return false;
      }

      // 4. Evitamos duplicados en la barra de categorías principales
      if (vistas.has(nombreLimpio)) {
        return false;
      }

      vistas.add(nombreLimpio);
      return true;
    });
  }
}
