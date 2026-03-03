import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hero',
  imports: [RouterModule, NgIf],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {

  isLogued: boolean = false;
  nombreSelected = environment.nombreSelected;

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.isLogued = USER ? true : false;
  }

}
