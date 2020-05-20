import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';

import { Dia, DiaAnalisis } from '../interfaces/horario';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getHorario(): Promise<Dia[]> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const horSub = this.db.list(`horario/${idNegocio}/fechas`).valueChanges().subscribe((horario: Dia[]) => {
        horSub.unsubscribe();
        resolve(horario);
      });
    });
  }

  setHorario(horario: Dia[]) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`horario/${idNegocio}/fechas`).set(horario);
    const numeros = [];
    horario.forEach(d => {
      const dia: DiaAnalisis = {
        activo: d.activo
      };
      if (d.activo) {
        const date = new Date(d.apertura);
        const horas = date.getHours();
        const minutos = date.getMinutes();
        dia.apertura = minutos + (horas * 60);
        const cierre = new Date(d.cierre);
        const horasC = cierre.getHours();
        const minutosC = cierre.getMinutes();
        dia.cierre = minutosC + (horasC * 60);
      }
      if (d.comida === 'comida') {
        const comidaI = new Date(d.inicioComida);
        const choras = comidaI.getHours();
        const cminutos = comidaI.getMinutes();
        dia.inicioComida = cminutos + (choras * 60);
        const comidaC = new Date(d.finComida);
        const horasC = comidaC.getHours();
        const minutosC = comidaC.getMinutes();
        dia.finComida = minutosC + (horasC * 60);
      }
      numeros.push(dia);
    });
    this.db.object(`horario/${idNegocio}/analisis`).set(numeros);
  }

  getHorarioAnalisis(dia: string): Promise<DiaAnalisis> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const anSub = this.db.object(`horario/${idNegocio}/analisis/${dia}`)
      .valueChanges().subscribe((horario: DiaAnalisis) => {
          anSub.unsubscribe();
          resolve(horario);
      });
    });
  }

}
