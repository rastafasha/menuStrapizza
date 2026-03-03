import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { SliderComponent } from "../../components/slider/slider.component";
import { FreeDeliveryComponent } from "../../components/free-delivery/free-delivery.component";
import { CasProductsComponent } from "../../components/cas-products/cas-products.component";
import { HeroComponent } from "../../components/hero/hero.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { MenuFooterComponent } from '../../shared/menu-footer/menu-footer.component';
import { Usuario } from '../../models/usuario.model';
import { NgIf } from '@angular/common';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { ProducListSliderComponent } from '../../components/produc-list-slider/produc-list-slider.component';
import { PwaNotifInstallerComponent } from '../../shared/pwa-notif-installer/pwa-notif-installer.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,
    //  SliderComponent, 
    //  FreeDeliveryComponent, 
     CasProductsComponent,
    HeroComponent, FooterComponent, MenuFooterComponent, NgIf, LoadingComponent,
    PwaNotifInstallerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  @Output() msm_success: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() msm_success_value: boolean = false;
  user!:Usuario;
  isLoading=false;
  isVisible=false;
  activeCategory!:string;
  nombreSelected = environment.nombreSelected;

  // Event emitter for refreshing cas-products
  @Output() refreshCasProducts: EventEmitter<void> = new EventEmitter<void>();

  onMsmSuccess(value: boolean): void {
    this.msm_success.emit(value);
  }

  onRefreshFromHeader() {
    this.isLoading = true;
    this.refreshCasProducts.emit();
    this.isLoading = false;
  }

  ngOnInit(){
    let USER = localStorage.getItem("user");
    this.user = USER ? JSON.parse(USER) : null;
  }
}

