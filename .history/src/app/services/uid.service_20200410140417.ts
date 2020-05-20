import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UidService {

  uid: string;
  nombre: string;
  cuenta: string;
  region: string;

  public usuario = new BehaviorSubject(null);
  public cuentaWatch = new BehaviorSubject(null);

  constructor( ) {  }

  setUid(uid) {
    this.uid = uid;
    this.usuario.next(uid);
  }

  getUid() {
    return this.uid;
  }

  setNombre(nombre) {
    this.nombre = nombre;
  }

  getNombre() {
    return this.nombre;
  }

  setCuenta(cuenta: string) {
    this.cuenta = cuenta;
    this.cuentaWatch.next(cuenta);
  }

  getCuenta() {
    return this.cuenta;
  }

  setRegion(region) {
    this.region = region;
  }

  getRegion() {
    return this.region;
  }

}
