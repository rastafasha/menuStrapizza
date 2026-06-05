import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/product.service';
import { ComentarioService } from '../../services/comentario.service';

@Component({
    selector: 'app-ratingStar',
    imports: [CommonModule],
    templateUrl: './ratingStar.component.html',
    styleUrls: ['./ratingStar.component.scss']
})
export class RatingStarComponent implements OnInit{
    @Input() product!: Producto;
    @Output() ratingChanged: EventEmitter<number> = new EventEmitter<number>();
    user!: any;
    private comentarioService = inject(ComentarioService);
    private authService = inject(AuthService);

    hoverRating: number = 0;
    client_id!: string;
    user_id!: string;
    stars: number = 0;
    public estrellasArray: number[] = [1, 2, 3, 4, 5];

    constructor(
    ) {
        this.user = this.authService.getLocalStorage();

    }

    ngOnInit() {
       this.getStrellasProduct();
    }

    getStrellasProduct() {
    this.comentarioService.getByProduct(this.product._id).subscribe((resp: any) => {
        // 1. Verificamos que existan comentarios en el array
        if (resp.comentarios && resp.comentarios.length > 0) {
            
            // 2. Sumamos todas las estrellas de la lista
            const sumaTotal = resp.comentarios.reduce((total: number, item: any) => total + item.estrellas, 0);
            
            // 3. Sacamos el promedio real redondeado a 1 decimal
            this.stars = parseFloat((sumaTotal / resp.comentarios.length).toFixed(1));
            
        } else {
            // 4. Si no hay comentarios, el producto arranca con 0 estrellas
            this.stars = 0;
        }
    });
    }

    onMouseEnter(star: number) {
        this.hoverRating = star;
    }

    onMouseLeave() {
        this.hoverRating = 0;
    }

   
}
