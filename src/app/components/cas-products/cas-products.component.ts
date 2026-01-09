import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProducListComponent } from "../produc-list/produc-list.component";

@Component({
  selector: 'app-cas-products',
  imports: [CommonModule, ProducListComponent],
  templateUrl: './cas-products.component.html',
  styleUrl: './cas-products.component.scss'
})
export class CasProductsComponent {
  option_selectedd =1;

  optionSelected(option_selectedd:number){

  }

}
