# TODO - Implementar tiendaSelected desde TiendaService

## Objetivo
Hacer que `product-item` y `modalproduct` usen `TiendaService` para obtener `tiendaSelected` en lugar de duplicar lógica.

## Tareas

- [x] 1. Crear este archivo TODO.md
- [x] 2. Agregar método `getSelectedTiendaSync()` en `tienda.service.ts`
- [x] 3. Actualizar `product-item.component.ts` para usar `selectedTiendaObservable$`
- [x] 4. Actualizar `modalproduct.component.ts` para usar `selectedTiendaObservable$`
- [x] 5. Actualizar `cas-products.component.ts` para usar `TiendaService`
- [x] 6. Actualizar `home.component.ts` para remover `tiendaSelected` heredado
- [x] 7. Actualizar `cas-products.component.html` para remover binding `[tiendaSelected]`

## Resumen de cambios

### tienda.service.ts
- Agregar `getSelectedTiendaSync()` para obtener valor sin suscripción

### product-item.component.ts
- Remover `@Input() tiendaSelected`
- Suscribirse a `selectedTiendaObservable$`

### modalproduct.component.ts
- Remover `tiendaSelected` local y métodos duplicados (`getTiendas()`, `setTiendaDefault()`)
- Suscribirse a `selectedTiendaObservable$`

### cas-products.component.ts
- Remover `@Input() tiendaSelected`
- Suscribirse a `selectedTiendaObservable$` y obtener `tiendaSelected` del servicio

### home.component.ts
- Remover `@Output() tiendaSelected`, imports de `Tienda` y `TiendaService`, y propiedades no usadas

### cas-products.component.html
- Remover `[tiendaSelected]="tiendaSelected"` del `<app-product-item>`

