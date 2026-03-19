import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ComentarioappService } from '../../services/comentarioapp.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-modalinfo-comentario-app',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modalinfo-comentario-app.component.html',
  styleUrl: './modalinfo-comentario-app.component.scss'
})
export class ModalinfoComentarioAppComponent implements AfterViewInit{
  @Input() nombreSelected!:string;
  @Input() localId!:string;
  isLogued: boolean = false;

  public comentarios :any=[];

  /*COMENTARIOS DATA */
  rating: number = 3;

  public cinco_estrellas = 0;
  public cuatro_estrellas = 0;
  public tres_estrellas = 0;
  public dos_estrellas = 0;
  public una_estrella = 0;

  public cinco_porcent = 0;
  public cuatro_porcent = 0;
  public tres_porcent = 0;
  public dos_porcent = 0;
  public uno_porcent = 0;
  public raiting_porcent = 0;
  public total_puntos = 0;
  public max_puntos = 0;
  public raiting_puntos= 0;


  /*FORM RESEÑA */
  public id_review_producto:any;
  public review_comentario='';
  public review_pros='';
  public review_cons='';
  public review_estrellas='';
  public msm_error_review='';
  public msm_error = false;
  public msm_success_fav = false;
  public msm_success = false;
  public identity!:Usuario;

  private router = inject(Router);
  private _comentarioService = inject(ComentarioappService);

  ngAfterViewInit() {
    const USER = localStorage.getItem("user");
    this.isLogued = USER ? true : false;
    if(USER){
      this.identity = JSON.parse(USER);
    }
    // Check if dismissed
    if (localStorage.getItem('modalInicialDismissed')) {
      return;
    }
    // Auto open modal after DOM ready
    setTimeout(() => {
      const modalElement = document.getElementById('exampleModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 500);
  }

  onNoShowMore() {
    localStorage.setItem('modalInicialDismissed', 'true');
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  



saveComent(reviewForm: { valid: any; value: { review_comentario: any; review_pros: any; review_cons: any; review_estrellas: any; }; }){
  if(reviewForm.valid){

    let data = {
      comentario: reviewForm.value.review_comentario,
      pros: reviewForm.value.review_pros,
      cons: reviewForm.value.review_cons,
      estrellas: reviewForm.value.review_estrellas,
      user: this.identity.uid,
      tienda: this.localId,
    }
    this._comentarioService.create(data).subscribe(
      (response:any) =>{
        this.msm_error_review = '';
        this.review_comentario='';
        this.review_pros='';
        this.review_cons='';
        this.review_estrellas='';
      },
      error=>{
        this.msm_error_review = error.error.message;
        this.review_comentario='';
        this.review_pros='';
        this.review_cons='';
        this.review_estrellas='';
      }
    );
    this.onNoShowMore();

  }else{
    this.msm_error_review = 'Complete correctamente los campos.';
  }
}

close_alert(){
  this.msm_error = false;
  this.msm_error_review = '';
  this.msm_success_fav = false;
  this.msm_success = false;
}


}
