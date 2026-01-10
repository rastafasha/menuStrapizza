import { NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnChanges {
 @Input() msm_success: boolean = false;

 ngOnChanges(changes: SimpleChanges): void {
   if (changes['msm_success']) {
     console.log('Footer received msm_success:', this.msm_success);
     // You can add additional logic here if needed
   }
 }

 ngOnInit(){
  console.log('Footer initialized with msm_success:', this.msm_success);
 }

}
