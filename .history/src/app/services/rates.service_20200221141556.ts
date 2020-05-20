import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Rate, PerfilNegRate, ComentarioNegocio, ComentarioRepartidor } from '../interfaces/rate';
import { RepartidorPreview } from '../interfaces/repartidor';

@Injectable({
  providedIn: 'root'
})
export class RatesService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getNegRate(): Promise<Rate> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const ratSub = this.db.object(`rate/resumen/${idNegocio}`).valueChanges().subscribe((rate: Rate) => {
        ratSub.unsubscribe();
        resolve(rate);
      });
    });
  }

  getNegPerfil(): Promise<PerfilNegRate> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const perSub = this.db.object(`functions/${idNegocio}`).valueChanges().subscribe((PerfilNegRate: PerfilNegRate) => {
        perSub.unsubscribe();
        resolve(PerfilNegRate);
      });
    });
  }

  getRepartidoresRate(): Promise<RepartidorPreview[]> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const ratSub = this.db.list(`repartidores/${idNegocio}/preview`).valueChanges().subscribe((repPrew: RepartidorPreview[]) => {
        ratSub.unsubscribe();
        resolve(repPrew);
      });
    });
  }

  getComentarioNegocio(): Promise<ComentarioNegocio[]> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const comSub = this.db.list(`rate/detalles/${idNegocio}`).valueChanges().subscribe((comentarios: ComentarioNegocio[]) => {
        comSub.unsubscribe();
        resolve(comentarios);
      });
    });
  }

  getComentarioRepartidor(id: string): Promise<ComentarioRepartidor[]> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const comSub = this.db.list(`repartidores/${idNegocio}/detalles/comentarios`).valueChanges().subscribe((comentarios: ComentarioRepartidor[]) => {
        comSub.unsubscribe();
        resolve(comentarios);
      });
    });
  }

}
