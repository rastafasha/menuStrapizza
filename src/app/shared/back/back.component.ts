import { Component, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
@Component({
    selector: 'app-back',
    templateUrl: './back.component.html',
    styleUrls: ['./back.component.css']
})
export class BackComponent {
   
    @Input() pageTitle!:string
    constructor (private location: Location,) {}

    goBack() {
    this.location.back(); // <-- go back to previous location on cancel
  }
}