import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Tienda } from '../../models/tienda.model';
import { UsuarioService } from '../../services/usuario.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  imports:[
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.scss' ]
})
export class RegisterComponent implements OnInit {

  public formSumitted = false;

  registerForm:FormGroup;
  tiendas!: Tienda[];
  tienda!: Tienda;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    // private tiendaService: TiendaService,
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: [ '', [Validators.required, Validators.email] ],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      local: [''],
      terminos: [false, Validators.required],

    }, {
      validators: this.passwordsIguales('password', 'password2')

    });
  }




  ngOnInit(): void {
    // this.getTiendas();
  }

  getTiendas(){
    // this.tiendaService.cargarTiendas().subscribe((resp:any)=>{
    //   this.tiendas = resp;
    //   //filtramos las tiendas y buscamos la que se llama web
    //   this.tiendas = this.tiendas.filter((tienda:Tienda) => tienda.nombre === 'Web');
    //   //mostramos la info de la tienda con el nombre web
    //   this.tienda = this.tiendas[0];

    // })
  }

  crearUsuario(){
    this.formSumitted = true;
    //agregamos el id de la tienda a la respuesta

    this.registerForm.value.local = this.tienda._id;
    console.log(this.registerForm.value);

    if(this.registerForm.invalid){
      return;
    }

    //realizar el posteo del usuario
    this.usuarioService.crearUsuario(this.registerForm.value).subscribe(
      resp =>{
        console.log(resp);
        // this.router.navigateByUrl('/login');
        this.usuarioService.getLocalStorage();
         if(localStorage.getItem('user')){
          setTimeout(()=>{
            this.router.navigateByUrl('/my-account');
          },500);
        }
      },(err) => {
        Swal.fire('Error', err.error.msg, 'error');
      }
    );

  }

  campoNoValido(campo: string): boolean {
    if(this.registerForm.get(campo)?.invalid && this.formSumitted){
      return true;
    }else{
      return false;
    }


  }

  aceptaTerminos(){
    return !this.registerForm.get('terminos')?.value && this.formSumitted;
  }

  passwordNoValido(){
    const pass1 = this.registerForm.get('password')?.value;
    const pass2 = this.registerForm.get('password2')?.value;

    if((pass1 !== pass2) && this.formSumitted){
      return true;
    }else{
      return false;
    }
  }

  passwordsIguales(pass1Name: string, pass2Name: string){
    return (formGroup: FormGroup) =>{
      const pass1Control = formGroup.get(pass1Name);
      const pass2Control = formGroup.get(pass2Name);

      if(pass1Control?.value === pass2Control?.value){
        pass2Control?.setErrors(null)
      }else{
        pass2Control?.setErrors({noEsIgual: true});
      }
    }
  }

}
