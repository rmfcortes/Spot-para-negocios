import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Cuenta } from '../interfaces/cuenta.interface';
import { FunctionInfo } from '../interfaces/perfil';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  constructor(
    private storage: Storage,
    private platform: Platform,
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getPrecios(): Promise<number[]> {
    return new Promise((resolve, reject) => {      
      const region = this.uidService.getRegion();
      const priceSub = this.db.list(`cuentas/${region}`).valueChanges().subscribe((precios: number[]) => {
        priceSub.unsubscribe();
        resolve(precios);
      });
    });
  }

  updateCuenta(cuenta: string, cuentaAnterior: string, precio: number) {
    return new Promise(async (resolve, reject) => {      
      const idNegocio = this.uidService.getUid();
      const cambio = {
        solicita: cuenta,
        anterior: cuentaAnterior,
        precio
      }
      await this.db.object(`aacambio/${idNegocio}`).set(cambio);
      this.setCuenta(cuenta);
      resolve();
    });
  }

  setCuenta(cuenta: string) {
    return new Promise (async (resolve, reject) => {
      const region = this.uidService.getRegion();
      const id = this.uidService.getUid();
      if (this.platform.is ('cordova')) {
        this.storage.set('cuenta', cuenta);
      } else {
        localStorage.setItem('cuenta', cuenta);
      }
      this.uidService.setCuenta(cuenta);
      await this.db.object(`functions/${region}/${id}/cuenta`).set(cuenta);
      await this.db.object(`perfiles/${id}/cuenta`).set(cuenta);
      resolve();
    });
  }

  getCuenta(id: string) {
    return new Promise(async (resolve, reject) => {
      const cueSub = this.db.object(`perfiles/${id}/cuenta`).valueChanges().subscribe((cuenta: string) => {
        cueSub.unsubscribe();
        if (!cuenta) {
          cuenta = 'basica';
        }
        this.setCuenta(cuenta);
        resolve(cuenta);
      });
    });
  }

}
