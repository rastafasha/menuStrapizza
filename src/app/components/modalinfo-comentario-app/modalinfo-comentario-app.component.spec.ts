import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalinfoComentarioAppComponent } from './modalinfo-comentario-app.component';

describe('ModalinfoComentarioAppComponent', () => {
  let component: ModalinfoComentarioAppComponent;
  let fixture: ComponentFixture<ModalinfoComentarioAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalinfoComentarioAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalinfoComentarioAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
