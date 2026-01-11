import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { Tienda } from '../../models/tienda.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    RouterModule
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
  user!:Usuario;
  isUserLogged=false;
  isProductAdded=false;
  tiendaSelected!:Tienda;

  ngOnInit(): void {
     let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
    
    // Load bandejaList from localStorage
    const storedItems = localStorage.getItem("bandejaItems");
    if (storedItems) {
      try {
        this.bandejaList = JSON.parse(storedItems);
      } catch (e) {
        console.error('Error parsing bandejaList from localStorage', e);
        this.bandejaList = [];
      }
    }
  }

  openPaymentsModal(product: any): void {
    this.productSelected.emit(product);
  }

    addItem(producto:Producto){
        
      if(this.user == null){
        setTimeout(()=>{
          this.isUserLogged = true;
          
        }, 300);
        this.isUserLogged = false;

        return;
      }else{

        this.msm_success.emit(false);
        const index = this.bandejaList.findIndex(item =>
          item === producto ||
          ((item as any)._id && (producto as any)._id && (item as any)._id === (producto as any)._id) ||
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
          // this.msm_success.emit(true);
          this.isProductAdded =true
        }, 5000);
        // this.msm_success.emit(false);
        this.isProductAdded =false
      }
  
    }

    saveBandejaListToLocalStorage() {
    try {
      localStorage.setItem('bandejaItems', JSON.stringify(this.bandejaList));
    } catch (e) {
      console.error('Error saving bandejaList to localStorage', e);
    }
    //notificamos al header para actualizar el carrito
      
  }
  closeAviso(){
    this.isUserLogged = false;
    this.isProductAdded = false;
  }
}
