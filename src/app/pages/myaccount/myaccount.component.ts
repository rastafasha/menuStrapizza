
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { HeaderComponent } from "../../shared/header/header.component";
import { environment } from '../../../environments/environment';
import { CommonModule, NgIf } from '@angular/common';
import { MenuFooterComponent } from "../../shared/menu-footer/menu-footer.component";
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-myaccount',
  imports: [
    RouterModule,
    NgIf,
    HeaderComponent,
    MenuFooterComponent,
    CommonModule
],
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss'],
})
export class MyaccountComponent implements OnInit {

  identity!: Usuario;
  imagenSerUrl = environment.mediaUrl;
  public isLoading:boolean = false;
  user_id:any;

  constructor(
    public router: Router,
    public http: HttpClient,
    private usuarioService: UsuarioService,
    public activatedRoute: ActivatedRoute,
    public pushService: PushNotificationService,
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

  logout(){
    this.usuarioService.logout()
  }

   getUser(){
    this.usuarioService.get_user(this.user_id).subscribe((resp:any)=>{
      this.identity = resp.usuario;
      // console.log(this.identity)
     
    })
  }


  async togglePush() {
    this.pushService.isProcessing$.next(true); // Activa el cargando

    try {
      const estaSuscrito = this.pushService.isSubscribed$.value;
      if (estaSuscrito) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          // Llamada opcional a tu backend para limpiar
          this.pushService.setSubscriptionStatus(false);
        }
      } else {
        await this.pushService.subscribeToNotifications();
      }
    } finally {
      this.pushService.isProcessing$.next(false); // Desactiva el cargando
    }
  }



}
