import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { StorageService } from '../../services/storage.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-modalproduct',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './modalproduct.component.html',
  styleUrl: './modalproduct.component.scss'
})
export class ModalproductComponent {
  @Input() product!:Producto|null;
  bandejaList: Producto[] = [];
public msm_error = false;
  public msm_success = false;
  private storageService = inject(StorageService);

  
  saveBandejaListToLocalStorage() {
    try {
      localStorage.setItem('bandejaItems', JSON.stringify(this.bandejaList));
    } catch (e) {
      console.error('Error saving bandejaList to localStorage', e);
    }
  }

  total() {
    const total = this.bandejaList.reduce((sum, item) => 
      sum + item.precio_ahora * item.cantidad, 0
  );
  return total;
  }

  addItem(producto:Producto){
    this.msm_success = false;
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
      this.msm_success = true;
      
    }, 500)
    this.msm_success = false;
  }
removeItem(producto:Producto){
  const index = this.bandejaList.findIndex(item =>
    item === producto ||
    ((item as any).id && (producto as any).id && (item as any).id === (producto as any).id) ||
    ((item as any).name && (producto as any).name && (item as any).name === (producto as any).name)
  );
  if (index === -1) return;

  if(this.bandejaList[index].cantidad && this.bandejaList[index].cantidad > 1){
    this.bandejaList[index].cantidad -= 1;
  } else {
    this.bandejaList.splice(index, 1);
  }
  this.saveBandejaListToLocalStorage();
  // this.ngOnInit()

  
}


  
}
