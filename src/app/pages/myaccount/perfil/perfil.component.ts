import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';
import { FileUploadService } from '../../../services/file-upload.service';
import { UsuarioService } from '../../../services/usuario.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AsideCuentaComponent } from '../aside-cuenta/aside-cuenta.component';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { environment } from '../../../environments/environment';
import { PaisService } from '../../../services/pais.service';
import { Pais } from '../../../models/pais.model';

declare var jQuery:any;
declare var $:any;

interface HtmlInputEvent extends Event{
  target : HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-perfil',
  imports:[
    CommonModule,
    HeaderComponent,
    AsideCuentaComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe

  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  public url;
  public paises:any;
  public file !:File;
  public imgSelect !: String | ArrayBuffer;
  public data_paises : any = [];
  public msm_error = false;
  public msm_success = false;
  public pass_error = false;
  
  public user!: Usuario;
  public identity!: Usuario;
  public user_id: any;

  public pais!: Pais;

  public perfilForm!: FormGroup;
  public imagenSubir!: File;
  public imgTemp: any = null;


  //DATA
  public new_password = '';
  public comfirm_password = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private paisService: PaisService,
    private _router : Router,
    private _route :ActivatedRoute,
    private http: HttpClient,
    private fileUploadService: FileUploadService
  ) {
    // this.usuario = usuarioService.usuario;
    
    this.url = environment.baseUrl;

  }

  ngOnInit(): void {
    window.scrollTo(0,0);

     let USER = localStorage.getItem('user');
    if(USER){
      this.user = JSON.parse(USER);
      this.user_id = this.user.uid
      console.log(this.user);
      this. getUser();
    }
   
  }

  getUser(){
    this.usuarioService.get_user(this.user_id).subscribe((resp:any)=>{
      this.identity = resp.usuario;
      console.log(this.identity)
      if(this.identity){
        this.getPaises();
        this.iniciarFormulario()
      }else{
      this._router.navigate(['/']);
    }
    })
  }

  iniciarFormulario(){
    this.perfilForm = this.fb.group({
      uid: [ this.identity.uid,  Validators.required ],
      email: [ this.identity.email],
      first_name: [ this.identity.first_name, Validators.required ],
      last_name: [ this.identity.last_name, Validators.required ],
      numdoc: [ this.identity.numdoc ],
      telefono: [ this.identity.telefono ],
      pais: [ this.identity.pais],
      google: [ this.identity.google],
      role: [ this.identity.role],
      password: [ ''],
    });
    
  }


  getPaises() {
    this.paisService.getPaises().subscribe(
      (resp:any) => {
        this.paises = resp;

      }
    )
  }

  close_alert(){
    this.msm_success = false;
    this.msm_error = false;
  }

  view_password(){
    let type = $('#password').attr('type');

    if(type == 'text'){
      $('#password').attr('type','password');

    }else if(type == 'password'){
      $('#password').attr('type','text');
    }
  }

  view_password2(){
    let type = $('#password_dos').attr('type');

    if(type == 'text'){
      $('#password_dos').attr('type','password');

    }else if(type == 'password'){
      $('#password_dos').attr('type','text');
    }
  }

  actualizarPerfil(){

    const {first_name, last_name, telefono, pais,  numdoc, email, role, uid} = this.perfilForm.value;
    this.usuarioService.actualizarP(this.perfilForm.value)
    .subscribe((resp:any) => {
      
      Swal.fire('Guardado', 'Los cambios fueron actualizados', 'success');
    }, (err)=>{
      Swal.fire('Error', err.error.msg, 'error');

    })
  }
cambiarImagen(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // your code here, using 'file'
  }
  

    const reader = new FileReader();
    // reader.readAsDataURL(file);

    reader.onloadend = () =>{
      this.imgTemp = reader.result;
    }
}


  subirImagen(){
    this.fileUploadService
    .actualizarFoto(this.imagenSubir, 'usuarios', this.identity.uid || '')
    .then(img => { this.identity.img = img;
      Swal.fire('Guardado', 'La imagen fue actualizada', 'success');
    }).catch(err =>{
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    })
  }


}
