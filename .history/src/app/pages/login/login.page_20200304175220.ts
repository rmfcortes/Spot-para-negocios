import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { NetworkService } from 'src/app/services/network.service';
import { AlertService } from 'src/app/services/alert.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  correo: string;
  pass: string;

  isConnected = true;

  netSub: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private netService: NetworkService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.netSub = this.netService.isConnected.subscribe(res => {
      this.isConnected = res;
    });
  }

  async ingresarConCorreo() {
    await this.alertService.presentLoading();
    try {
      const resp = await this.authService.loginWithEmail(this.correo, this.pass);
      const aut = await this.authService.checkAutorizacion();
      this.alertService.dismissLoading();
      if (!aut) {
        this.alertService.presentAlert('Cuenta inactiva', 'Tu correo y contraseña son correctos, pero la cuenta aún no ha sido activada '+
        'por favor ponte en contacto con tu vendedor.');
      }
      if (resp) {
        this.router.navigate(['/home']);
      } else {
        this.alertService.presentAlert('Usuario no registrado', 'Por favor registra una cuenta antes de ingresar');
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        this.alertService.presentAlert('Usuario no registrado', 'Por favor registra tu cuenta antes de ingresar');
      } else if (error.code === 'auth/wrong-password') {
        this.alertService.presentAlert('Contraseña inválida', 'La contraseña no es correcta, por favor intenta de nuevo');
      } else {
        this.alertService.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo ' + error);
      }
    }
  }

  async resetPass() {
    if (!this.correo) {
      this.alertService.presentAlert('Ingresa tu correo', 'Enviaremos un enlace a tu correo, en el cuál podrás restaurar tu contraseña');
      return;
    }
    this.alertService.presentLoading();
    try {
      await this.authService.resetPass(this.correo);
      this.alertService.dismissLoading();
      this.alertService.presentAlert('Listo', 'Por favor revisa tu correo, hemos enviado un enlace para que puedas restaurar tu contraseña');
    } catch (error) {
      this.alertService.dismissLoading();
      this.alertService.presentAlert('Error', 'Por favor intenta de nuevo más tarde. Estamos teniendo problemas técnicos');
    }
  }

  ionViewWillLeave() {
    if (this.netSub) { this.netSub.unsubscribe(); }
  }

}
