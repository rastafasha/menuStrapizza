import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterModule, NgIf],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {

  isLogued: boolean = false;

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.isLogued = USER ? true : false;
  }

}
