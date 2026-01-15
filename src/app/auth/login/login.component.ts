import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';

// declare const gapi: any;


@Component({
  selector: 'app-login',
  standalone:true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // HeaderComponent,
    // FooterComponent,
    RouterModule,
    ImagenPipe
],
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {

  nombreSelected = environment.nombreSelected;
  public formSumitted = false;
  public auth2: any;

  loginForm: FormGroup;
  tiendaSelected!: Tienda;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private tiendaService: TiendaService,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

ngOnInit(){
  // this.renderButton();
  this.usuarioService.getLocalStorage();
  this.getTienda();
}

 getTienda(){
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp:any)=>{
      this.tiendaSelected = resp;
      console.log(this.tiendaSelected)
    })
  }

  login(){

this.usuarioService.login(this.loginForm.value).subscribe(
      resp =>{
        console.log('Login response:', resp);
        if(this.loginForm.get('remember')?.value){
          localStorage.setItem('email', this.loginForm.get('email')?.value);
        }else{
          localStorage.removeItem('email');
        }
        this.usuarioService.getLocalStorage();
         if(localStorage.getItem('user') !== 'undefined'){
          setTimeout(()=>{
            this.router.navigateByUrl('/my-account');
          },500);
        }else{
          this.router.navigateByUrl('/login');
        }
        
      
        // this.router.navigateByUrl('/my-account');
      },(err) => {
        Swal.fire('Error', err.error.msg, 'error');
      }
    )

  }



  // renderButton() {
  //   gapi.signin2.render('my-signin2', {
  //     'scope': 'profile email',
  //     'width': 240,
  //     'height': 50,
  //     'longtitle': true,
  //     'theme': 'dark',
  //   });
  //   this.startApp();
  // }

  async startApp(){
    this.usuarioService.googleInit();
    this.auth2 = this.usuarioService.auth2;

    // this.attachSignin(document.getElementById('my-signin2'));
  }

  // attachSignin(element) {
  //   this.auth2.attachClickHandler(element, {},
  //       (googleUser) =>{
  //         const id_token = googleUser.getAuthResponse().id_token;

  //         this.usuarioService.loginGoogle(id_token).subscribe(
  //           resp=>{

  //             this.ngZone.run(()=>{
  //               this.router.navigateByUrl('/app/my-account');
  //             })
  //           }
  //         );


  //       }, (error) =>{
  //         alert(JSON.stringify(error, undefined, 2));
  //       });
  // }

}
