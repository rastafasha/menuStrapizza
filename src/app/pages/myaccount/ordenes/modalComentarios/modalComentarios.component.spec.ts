import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComentariosComponent } from './modalComentarios.component';

describe('ModalComentariosComponent', () => {
    let component: ModalComentariosComponent;
    let fixture: ComponentFixture<ModalComentariosComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ModalComentariosComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalComentariosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});