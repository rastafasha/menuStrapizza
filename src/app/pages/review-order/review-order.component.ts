import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterModule } from '@angular/router';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';
import { Producto } from '../../models/producto.model';


@Component({
  selector: 'app-review-order',
  imports: [
    HeaderComponent,
    CommonModule,
    RouterModule,
    ImagenPipe

  ],
  templateUrl: './review-order.component.html',
  styleUrl: './review-order.component.scss'
})
export class ReviewOrderComponent {
  bandejaList: Producto[] = [];
  fechaHoy: string = new Date().toISOString().split('T')[0];
  randomNum:number = 0;
  isbandejaList:boolean = false;
  
    constructor(
      private router: Router
    ) {
      window.scrollTo(0,0);
    }
    ngOnInit(){
      this.loadBandejaListFromLocalStorage();
      this.geneardorOrdeneNumero();

    }

    loadBandejaListFromLocalStorage() {
    const storedItems = localStorage.getItem('bandejaItems');
    if (storedItems) {
      this.bandejaList = JSON.parse(storedItems);
      
    }
    if(this.bandejaList.length > 0){
      this.isbandejaList = true;
    }
  }
   onItemsChange(items: any[]) {
    this.bandejaList = items;
    this.saveBandejaListToLocalStorage();
  }

  onItemRemoved(item: any) {
    this.bandejaList = this.bandejaList.filter(i => i._id !== item.id);

   localStorage.removeItem('bandejaItems');
    this.saveBandejaListToLocalStorage();
    this.ngOnInit();
    this.removeItem(item, this.bandejaList.indexOf(item));
    //si la bandejaList queda vacia, cambiar isbandejaList a false
    if(this.bandejaList.length === 0){
      this.isbandejaList = false;
      
    }
    setTimeout(()=>{
      this.router.navigate(['/home']);
    }, 500)
    //si es falso enviar al home
    if(!this.isbandejaList){
     this.router.navigate(['/home']);
    }
  }

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

  addItem(item:Producto, index:any){
    if(this.bandejaList[index].cantidad){
      this.bandejaList[index].cantidad += 1;
    } else {
      this.bandejaList[index].cantidad = 1;
    }
    this.saveBandejaListToLocalStorage();

  }
removeItem(item:Producto, index:any){
  if(this.bandejaList[index].cantidad && this.bandejaList[index].cantidad > 1){
    this.bandejaList[index].cantidad -= 1;
  } else {
    this.bandejaList.splice(index, 1);
  }
  this.saveBandejaListToLocalStorage();
  this.ngOnInit()

  if(this.bandejaList.length === 0){
      this.isbandejaList = false;
    }
    //si es falso enviar al home
    if(!this.isbandejaList){
     this.router.navigate(['/']);
    }

}

geneardorOrdeneNumero(){
  //creamos una suma de 1 a 1000 para ordenes nuevas
  const max = 1000;
  const min = 1;
  const random = Math.floor(Math.random() * (max - min + 1)) + min
  this.randomNum = random;
  // return random;
}

}
