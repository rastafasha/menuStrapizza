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
import { PaisService } from '../../../services/pais.service';
import { Pais } from '../../../models/pais.model';
import { environment } from '../../../../environments/environment';
import { LoadingComponent } from '../../../shared/loading/loading.component';

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
    ImagenPipe,
    LoadingComponent

  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  public url;
  public paises:any;
  // public file !:File; // unused
  // public imgSelect !: String | ArrayBuffer; // unused
  public data_paises : any = [];
  public msm_error = false;
  public msm_success = false;
  public pass_error = false;
  
  public user!: Usuario;
  public identity!: Usuario;
  public user_id: any;

  public isLoading = false;
  

  public pais!: Pais;

  public perfilForm!: FormGroup;
  public imagenSubir!: File;
  public imgTemp: string | ArrayBuffer | null = null;
  public usuarioSeleccionado!: Usuario;
  public FILE_AVATAR!: HTMLInputElement;
  public IMAGE_PREVISUALIZA: string | null = null;
  text_validation: any = null;


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

    // Initialize empty FormGroup to prevent template binding errors
    this.perfilForm = this.fb.group({
      uid: [''],
      email: [''],
      first_name: [''],
      last_name: [''],
      numdoc: [''],
      telefono: [''],
      pais: [''],
      google: [''],
      role: [''],
      password: [''],
      img: [''],
    });
  }

  ngOnInit(): void {
    window.scrollTo(0,0);

     let USER = localStorage.getItem('user');
    if(USER){
      this.user = JSON.parse(USER);
      this.user_id = this.user.uid
      // console.log(this.user);
      this. getUser();
    }
   
  }

  getUser(){
    this.isLoading = true;
    this.usuarioService.get_user(this.user_id).subscribe((resp:any)=>{
      this.usuarioSeleccionado = resp.usuario;
      // console.log(this.identity)
      if(!this.usuarioSeleccionado){
        this._router.navigate(['/']);
      }
       // First initialize the form
        this.iniciarFormulario();
         this.getPaises();
        // Then set the values
        this.perfilForm.setValue({
          uid: this.usuarioSeleccionado.uid,
          email: this.usuarioSeleccionado.email,
          first_name: this.usuarioSeleccionado.first_name,
          last_name: this.usuarioSeleccionado.last_name,
          numdoc: this.usuarioSeleccionado.numdoc || null,
          telefono: this.usuarioSeleccionado.telefono || null,
          pais: this.usuarioSeleccionado.pais || null,
          google: this.usuarioSeleccionado.google || null,
          role: this.usuarioSeleccionado.role,
          password: '',
          img: this.usuarioSeleccionado.img || null,
        });
         this.isLoading = false;
        
    })
  }

   iniciarFormulario(){
    this.perfilForm = this.fb.group({
      uid: [ '',  Validators.required ],
      email: [''],
      first_name: [ '', Validators.required ],
      last_name: [ '', Validators.required ],
      numdoc: ['' ],
      telefono: [ ''],
      pais: [ ''],
      google: [ ''],
      role: [ ''],
      password: [ ''],
      img: [ ''],
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
    this.isLoading = true;
    const {first_name, last_name, telefono, pais,  numdoc, email, role, uid} = this.perfilForm.value;
    this.usuarioService.actualizarP(this.perfilForm.value)
    .subscribe((resp:any) => {
      this.isLoading = false;
      Swal.fire('Guardado', 'Los cambios fueron actualizados', 'success');
    }, (err)=>{
      this.isLoading = false;
      Swal.fire('Error', err.error.msg, 'error');

    })
  }
cambiarImagen(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return;
  }
  
  const file = input.files[0];
  this.imagenSubir = file;
  this.FILE_AVATAR = input;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    this.IMAGE_PREVISUALIZA = reader.result as string;
    this.imgTemp = reader.result;
  };
}


  subirImagen(){
    this.isLoading = true;
    if (!this.imagenSubir) {
      Swal.fire('Error', 'No hay imagen seleccionada', 'warning');
      return;
    }
    
    this.fileUploadService
    .actualizarFoto(this.imagenSubir, 'usuarios', this.usuarioSeleccionado.uid || '')
    .then(img => { 
      this.usuarioSeleccionado.img = img;
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(this.usuarioSeleccionado));
      // Reset preview
      this.isLoading = false;
      this.IMAGE_PREVISUALIZA = img ? `${environment.baseUrl}/uploads/usuarios/${img}` : 'assets/images/no-image.png';
      Swal.fire('Guardado', 'La imagen fue actualizada', 'success');
    }).catch(err =>{
      this.isLoading = false;
      console.error(err);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    })
  }


}
