import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducListSliderComponent } from './produc-list-slider.component';

describe('ProducListSliderComponent', () => {
  let component: ProducListSliderComponent;
  let fixture: ComponentFixture<ProducListSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProducListSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProducListSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
