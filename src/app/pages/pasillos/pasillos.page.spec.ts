import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PasillosPage } from './pasillos.page';

describe('PasillosPage', () => {
  let component: PasillosPage;
  let fixture: ComponentFixture<PasillosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasillosPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PasillosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
