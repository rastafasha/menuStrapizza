import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  openPaymentsModal(product: any): void {
    this.productSelected.emit(product);
  }
}
