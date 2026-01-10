import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {

  @Input() product: any;
  @Output() productSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  bandejaList: Producto[] = [];
  // msm_success= false;

  openPaymentsModal(product: any): void {
    this.productSelected.emit(product);
  }

    addItem(producto:Producto){
      this.msm_success.emit(false);
      const index = this.bandejaList.findIndex(item =>
        item === producto ||
        ((item as any).id && (producto as any).id && (item as any).id === (producto as any).id) ||
        ((item as any).name && (producto as any).name && (item as any).name === (producto as any).name)
      );
  
      if (index !== -1) {
        if(this.bandejaList[index].cantidad){
          this.bandejaList[index].cantidad += 1;
        } else {
          this.bandejaList[index].cantidad = 1;
        }
      } else {
        const newItem = { ...producto, cantidad: 1 } as Producto;
        this.bandejaList.push(newItem);
      }
  
      this.saveBandejaListToLocalStorage();
      setTimeout(()=>{
        this.msm_success.emit(true);
      }, 500);
      this.msm_success.emit(false);
  
    }

    saveBandejaListToLocalStorage() {
    try {
      localStorage.setItem('bandejaItems', JSON.stringify(this.bandejaList));
    } catch (e) {
      console.error('Error saving bandejaList to localStorage', e);
    }
    //notificamos al header para actualizar el carrito
      
  }
}
