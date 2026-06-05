import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingStarComponent } from './ratingStar.component';

describe('RatingStarComponent', () => {
    let component: RatingStarComponent;
    let fixture: ComponentFixture<RatingStarComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ RatingStarComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RatingStarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});