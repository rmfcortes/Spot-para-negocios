import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AlertService } from 'src/app/services/alert.service';

import { Dia } from 'src/app/interfaces/horario';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.scss'],
  exportAs: 'ngForm'
})
export class HorarioComponent implements OnInit {

  @Input() dia: Dia;
  @Output() guardado = new EventEmitter();


  semana: Dia[] = [];
  dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  constructor(
    private alertService: AlertService,
  ) { }

  ngOnInit() {
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
      this.semana.push(x);
    });
  }

  guardar() {
    if (this.dia.cierre === this.dia.apertura) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de apertura y cierre no puede ser la misma. Sería considerado como día inactivo');
      return;
    }
    if (this.dia.cierre < this.dia.apertura) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de cierre no puede ser antes de la hora de apertura');
      return;
    }
    if (this.dia.comida === 'comida' && this.dia.inicioComida === this.dia.finComida) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de incio y fin de comida no puede ser igual. Si no hay horario de comida, selecciona ' +
        'Corrido, en el tipo de horario');
      return;
    }
    if (this.dia.comida === 'comida' && this.dia.inicioComida < this.dia.apertura) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de incio de comida no puede ser antes de la hora de apertura');
      return;
    }
    if (this.dia.comida === 'comida' && this.dia.inicioComida > this.dia.cierre) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de incio de comida no puede ser después de la hora de cierre');
      return;
    }
    if (this.dia.comida === 'comida' && this.dia.finComida < this.dia.apertura) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de fin de comida no puede ser antes de la hora de apertura');
      return;
    }
    if (this.dia.comida === 'comida' && this.dia.finComida > this.dia.cierre) {
      this.alertService.presentAlert('Incongruencia de horario',
        'La hora de fin de comida no puede ser después de la hora de cierre');
      return;
    }
    let diasSeleccionados = 0;
    this.semana.forEach(d => {
      if (d.activo) {
        diasSeleccionados++;
        d.comida = this.dia.comida;
        d.finComida = this.dia.finComida;
        d.apertura = this.dia.apertura;
        d.cierre = this.dia.cierre;
        d.inicioComida = this.dia.inicioComida;
      }
    });
    if (diasSeleccionados <= 0) {
      this.alertService.presentAlert('No hay días seleccionados',
        'Selecciona por lo menos un día de la semana para continuar con el formulario');
      return;
    }
    this.guardado.emit(this.semana);
  }


}
