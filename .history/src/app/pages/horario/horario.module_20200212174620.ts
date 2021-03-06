import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HorarioPageRoutingModule } from './horario-routing.module';

import { HorarioPage } from './horario.page';
import { SetHorarioPageModule } from 'src/app/modals/set-horario/set-horario.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetHorarioPageModule,
    HorarioPageRoutingModule
  ],
  declarations: [HorarioPage]
})
export class HorarioPageModule {}
