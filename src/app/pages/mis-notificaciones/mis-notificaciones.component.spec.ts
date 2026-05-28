import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisNotificacionesComponent } from './mis-notificaciones.component';

describe('MisNotificacionesComponent', () => {
  let component: MisNotificacionesComponent;
  let fixture: ComponentFixture<MisNotificacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisNotificacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisNotificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
