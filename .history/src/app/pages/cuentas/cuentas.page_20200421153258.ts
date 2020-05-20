import { Component, OnInit } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CuentaService } from 'src/app/services/cuenta.service';
import { AlertService } from 'src/app/services/alert.service';
import { UidService } from 'src/app/services/uid.service';

import { Cuenta } from 'src/app/interfaces/cuenta.interface';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
})
export class CuentasPage implements OnInit {

  cuenta: string;
  cuentas: Cuenta[] = [
    {
      nombre: 'basica',
      precio: 1,
      productos: 15,
      subCategorias: 1,
      pedidos: false,
      ofertas: false,
      populares: false,
      vendidos: false,
      actual: false,
    },
    {
      nombre: 'pro',
      precio: 1,
      productos: 100,
      subCategorias: 4,
      pedidos: true,
      ofertas: true,
      populares: true,
      vendidos: true,
      actual: false,
    },
    {
      nombre: 'premium',
      precio: 1,
      productos: 500,
      subCategorias: 500,
      pedidos: true,
      ofertas: true,
      populares: true,
      vendidos: true,
      actual: false,
    },
  ];

  preciosReady = false;
  iSel: number;

  back: Subscription;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private cuentaService: CuentaService,
    private alertService: AlertService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    this.menu.enable(true)
    this.getCuenta();
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      return;
    });
  }

  getCuenta() {
    this.cuenta = this.uidService.getCuenta();
    this.iSel = this.cuentas.findIndex(c => c.nombre === this.cuenta);
    this.cuentas[this.iSel].actual = true;
    this.getPrecios();
  }

  getPrecios() {
    this.cuentaService.getPrecios().then(precios => {
      precios.forEach((p, i) => {
        this.cuentas[i].precio = p;
      });
      this.preciosReady = true;
    });
  }

  async changeCuenta(cuenta: string, precio: number, i: number) {
    try {
      if (this.iSel > i) {
        const resp = await this.alertService.presentAlert('Membresía menor', 'Para cambiar a una membresía de menor capacidad contacta a tu vendedor');
        return;
      }
      this.cuentas.forEach(c => {
        c.actual = false;
      });
      this.cuentas[i].actual = true;
      await this.cuentaService.updateCuenta(cuenta, this.cuenta, precio);
      this.alertService.presentToast('Cuenta actulizada. Ya gozas de las nuevas funcionalidades. ' +
      'Tu vendedor se pondrá en contacto contigo. Gracias por su preferencia');
      this.cuenta = cuenta;
      this.iSel = i;
    } catch (error) {
      console.log(error);
    }
  }

  ionViewWillLeave() {
    if (this.back) {this.back.unsubscribe()}
  }

}
