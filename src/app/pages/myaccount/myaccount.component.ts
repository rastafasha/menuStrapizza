
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { HeaderComponent } from "../../shared/header/header.component";
import { AsideCuentaComponent } from './aside-cuenta/aside-cuenta.component';
import { environment } from '../../environments/environment';
import { NgIf } from '@angular/common';
import { MenuFooterComponent } from "../../shared/menu-footer/menu-footer.component";

@Component({
  selector: 'app-myaccount',
  imports: [
    RouterModule,
    NgIf,
    HeaderComponent,
    MenuFooterComponent
],
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss'],
})
export class MyaccountComponent implements OnInit {

  identity!: Usuario;
  imagenSerUrl = environment.mediaUrl;

  user_id:any;

  constructor(
    public router: Router,
    public http: HttpClient,
    private usuarioService: UsuarioService,
    public activatedRoute: ActivatedRoute,
    handler: HttpBackend
  ) {
    this.http = new HttpClient(handler);
  }

  ngOnInit(): void {
    window.scrollTo(0,0);

    let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
      this.user_id = this.identity.uid;
      this.getUser()
    }else{
     this.router.navigateByUrl('/login');
    }
  }

  slir(){
    this.usuarioService.logout()
  }

   getUser(){
    this.usuarioService.get_user(this.user_id).subscribe((resp:any)=>{
      this.identity = resp.usuario;
      console.log(this.identity)
     
    })
  }





}
