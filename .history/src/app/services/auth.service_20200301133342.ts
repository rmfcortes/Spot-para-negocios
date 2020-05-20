import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';

import { UidService } from './uid.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private storage: Storage,
    private platform: Platform,
    private db: AngularFireDatabase,
    public authFirebase: AngularFireAuth,
    private uidService: UidService,
  ) { }

  // Check isLog

  async getUser() {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          try {
            const uid = await this.storage.get('uid');
            if (uid) {
              this.uidService.setUid(uid);
              const nombre = await this.storage.get('nombre');
              let cuenta;
              cuenta = await this.storage.get('cuenta');
              if (!cuenta) {
                cuenta = await this.getCuenta(uid);
              }
              this.uidService.setNombre(nombre);
              this.uidService.setCuenta(cuenta);
              resolve(true);
            } else {
              await this.revisaFireAuth();
              resolve(true);
            }
          } catch (error) {
            console.log(error);
            resolve(false);
          }
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('uid') ) {
          const uid = localStorage.getItem('uid');
          const nombre = localStorage.getItem('nombre');
          let cuenta;
          cuenta = localStorage.getItem('cuenta');
          if (!cuenta) {
            cuenta = await this.getCuenta(uid);
          }
          this.uidService.setUid(uid);
          this.uidService.setNombre(nombre);
          this.uidService.setCuenta(cuenta);
          console.log(uid);
          console.log(cuenta);
          resolve(uid);
        } else {
          try {
            await this.revisaFireAuth();
            resolve(true);
          } catch (error) {
            resolve(false);
          }
        }
      }
    });
  }
  async revisaFireAuth() {
    return new Promise((resolve, reject) => {
      const authSub = this.authFirebase.authState.subscribe(async (user) => {
        authSub.unsubscribe();
        if (user) {
          const usuario =  {
            nombre: user.displayName,
            foto: user.photoURL,
            uid: user.uid
          };
          await this.setUser(usuario.uid, usuario.nombre);
          await this.getCuenta(usuario.uid);
          resolve(true);
        } else {
          reject();
        }
      });
    });
  }

  getCuenta(id: string) {
    return new Promise(async (resolve, reject) => {
      console.log('Obtén cuenta porque no hubo uid Storgae');
      const region = this.uidService.getRegion();
      if (region) {
        const cueSub = this.db.object(`functions/${region}/${id}/cuenta`).valueChanges().subscribe((cuenta: string) => {
          cueSub.unsubscribe();
          if (!cuenta) {
            cuenta = 'basica';
          }
          this.uidService.setCuenta(cuenta);
          resolve(cuenta);
        });
      } else {
        this.uidService.setCuenta('basica');
        resolve('basica');
      }
    });
  }

  // Auth
  async loginWithEmail(email, pass) {
    return new Promise(async (resolve, reject) => {
    try {
        const resp = await this.authFirebase.auth.signInWithEmailAndPassword(email, pass);
        this.setUser(resp.user.uid, resp.user.displayName);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // SetUser

  setUser(uid, nombre) {
    return new Promise (async (resolve, reject) => {
      if (this.platform.is ('cordova')) {
        this.storage.set('uid', uid);
        this.storage.set('nombre', nombre);
      } else {
        localStorage.setItem('uid', uid);
        localStorage.setItem('nombre', nombre);
      }
      this.uidService.setUid(uid);
      this.uidService.setNombre(nombre);
      resolve();
    });
  }

   // Logout

   async logout() {
    return new Promise(async (resolve, reject) => {
      try {
        setTimeout(async () => {
          await this.authFirebase.auth.signOut();
          if ( this.platform.is('cordova') ) {
            this.storage.remove('uid');
            this.storage.remove('nombre');
            this.storage.remove('cuenta');
            this.storage.remove('region');
          } else {
            localStorage.removeItem('uid');
            localStorage.removeItem('nombre');
            localStorage.removeItem('cuenta');
            localStorage.removeItem('region');
          }
          this.uidService.setUid(null);
          this.uidService.setNombre(null);
          this.uidService.setCuenta(null);
          this.uidService.setRegion(null);
          resolve();
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  }

    // Reset password
    async resetPass(email) {
      return new Promise(async (resolve, reject) => {
        try {
          await this.authFirebase.auth.sendPasswordResetEmail(email);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }

}
