import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { SetHorarioPage } from 'src/app/modals/set-horario/set-horario.page';
import { Dia } from 'src/app/interfaces/horario';
import { HorarioService } from 'src/app/services/horario.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})
export class HorarioPage implements OnInit {

  horario: Dia[] = [];
  dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  hasHorario = false;

  horarioReady = false;

  constructor(
    private modalCtrl: ModalController,
    private horarioService: HorarioService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getHorario();
  }

  getHorario() {
    this.horarioService.getHorario().then(horario => {
      if (horario && horario.length > 0) {
        this.horario = horario;
        this.hasHorario = true;
      } else {
        this.dias.forEach(d => {
          const x: Dia = {
            activo: false,
            comida: '',
            nombre: d,
            finComida: null,
            apertura: null,
            cierre: null,
            inicioComida: null,
          };
          this.horario.push(x);
          this.hasHorario = false;
        });
      }
      this.horarioReady = true;
    });
  }

  async verDia(dia) {
    if (!dia) {
      const x: Dia = {
        activo: false,
        comida: '',
        nombre: '',
        apertura: '2020-02-12T09:00:00.255-06:00',
        cierre: '2020-02-12T18:00:00.255-06:00',
        inicioComida: '2020-02-12T14:00:00.255-06:00',
        finComida: '2020-02-12T15:00:00.255-06:00',
      };
      dia = x;
    }
    const modal = await this.modalCtrl.create({
      component: SetHorarioPage,
      componentProps: {dia}
    });

    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        const semana: Dia[] = resp.data;
        semana.forEach((d, i) => {
          if (d.activo) {
            this.horario[i] = d;
          }
        });
        this.hasHorario = false;
        this.horario.forEach(d => {
          if (d.activo) {
            this.hasHorario = true;
          }
        });
        this.horarioService.setHorario(this.horario);
      }
    });

    return await modal.present();
  }

  deleteDia(dia: string, i: number) {
    this.alertService.presentAlertAction(`Eliminar ${dia}`,
     '¿Estás segura(o) de eliminar la información referente a este día? ' +
     'Será considerado como un día cerrado')
    .then(resp => {
      if (resp) {
        const x: Dia = {
          activo: false,
          comida: '',
          nombre: '',
          apertura: '',
          cierre: '',
          inicioComida: '',
          finComida: '',
        };
        this.horario[i] = x;
        this.horarioService.setHorario(this.horario);
      }
    });
  }

}
