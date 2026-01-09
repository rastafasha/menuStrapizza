import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { SliderComponent } from "../../components/slider/slider.component";
import { FreeDeliveryComponent } from "../../components/free-delivery/free-delivery.component";
import { CasProductsComponent } from "../../components/cas-products/cas-products.component";
import { ProducListSliderComponent } from "../../components/produc-list-slider/produc-list-slider.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { ProducListComponent } from "../../components/produc-list/produc-list.component";
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, SliderComponent, FreeDeliveryComponent, CasProductsComponent, ProducListSliderComponent, HeroComponent, ProducListComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
