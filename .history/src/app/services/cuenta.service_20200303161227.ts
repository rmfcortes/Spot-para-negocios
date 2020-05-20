import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

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

  getCuenta() {
    return new Promise(async (resolve, reject) => {
      const id = this.uidService.getUid();
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

  async getCuentaStorage() {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          try {
            let cuenta;
            cuenta = await this.storage.get('cuenta');
            if (cuenta) {
              this.setCuenta(cuenta);
              if (!cuenta) {
              }
              resolve(true);
            } else {
              cuenta = await this.getCuenta();
              this.setCuenta(cuenta);
              resolve(true);
            }
          } catch (error) {
            console.log(error);
            resolve(false);
          }
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('cuenta') ) {
          const cuenta = localStorage.getItem('cuenta');
          this.setCuenta(cuenta);
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  }


  checkCuenta(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let cuenta;
      cuenta = this.uidService.getCuenta();
      if (cuenta) { return resolve(true); }
      cuenta = this.getCuentaStorage();
      if (cuenta) { return resolve(true); }
      cuenta = this.getCuenta();
      if (cuenta) { return resolve(true); }
      return resolve(false);
    });
  }

}
