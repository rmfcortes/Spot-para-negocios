import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  updateCuenta(cuenta: string) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`cambiar/${idNegocio}/cuenta`).set(cuenta);
  }

}
