import { NgModule } from '@angular/core';
// import { ImagenPipePipe } from './imagen-pipe.pipe';
// import {DateAgoPipe} from './date-ago.pipe';
import { EscapeHtmlPipe } from './keep-html.pipe';


@NgModule({
  declarations: [
    // ImagenPipePipe,
    // DateAgoPipe,
    // EscapeHtmlPipe
  ],
  exports:[
    // ImagenPipePipe,
    // DateAgoPipe,
    // EscapeHtmlPipe

  ]
})
export class PipesModule { }
