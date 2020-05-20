import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetHorarioPage } from './set-horario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [SetHorarioPage],
  entryComponents: [SetHorarioPage]
})
export class SetHorarioPageModule {}
