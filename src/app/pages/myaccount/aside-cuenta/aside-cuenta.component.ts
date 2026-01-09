import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aside-cuenta',
  imports:[
    CommonModule,
    ImagenPipe,
    RouterModule
  ],
  templateUrl: './aside-cuenta.component.html',
  styleUrls: ['./aside-cuenta.component.scss']
})
export class AsideCuentaComponent implements OnInit {

  public url!:string;
  public identity!: Usuario;

  constructor(
    private usuarioService: UsuarioService,
  ) {
    let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      console.log(this.identity);
    }
   }

  ngOnInit(): void {
  }

}
