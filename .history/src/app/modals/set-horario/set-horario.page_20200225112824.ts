import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Dia } from 'src/app/interfaces/horario';


@Component({
  selector: 'app-set-horario',
  templateUrl: './set-horario.page.html',
  styleUrls: ['./set-horario.page.scss'],
})
export class SetHorarioPage implements OnInit {

  @Input() dia: Dia;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

  }

  seGuardo(semana) {
    console.log(semana);
    this.modalCtrl.dismiss(semana);
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
