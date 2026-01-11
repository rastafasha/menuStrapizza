import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { SliderComponent } from "../../components/slider/slider.component";
import { FreeDeliveryComponent } from "../../components/free-delivery/free-delivery.component";
import { CasProductsComponent } from "../../components/cas-products/cas-products.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, SliderComponent, FreeDeliveryComponent, CasProductsComponent, 
     HeroComponent,  FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  @Output() tiendaSelected!: string ;
  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() msm_success_value: boolean = false;

  onMsmSuccess(value: boolean): void {
    this.msm_success.emit(value);
  }

}
