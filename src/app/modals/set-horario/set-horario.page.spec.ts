import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetHorarioPage } from './set-horario.page';

describe('SetHorarioPage', () => {
  let component: SetHorarioPage;
  let fixture: ComponentFixture<SetHorarioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetHorarioPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetHorarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
