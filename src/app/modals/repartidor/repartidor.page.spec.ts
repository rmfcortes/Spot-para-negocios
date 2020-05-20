import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RepartidorPage } from './repartidor.page';

describe('RepartidorPage', () => {
  let component: RepartidorPage;
  let fixture: ComponentFixture<RepartidorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepartidorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RepartidorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
