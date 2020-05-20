import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { SwUpdateService } from './services/sw-update.service';
import { PedidosService } from './services/pedidos.service';
import { AuthService } from './services/auth.service';
import { UidService } from './services/uid.service';
import { FcmService } from './services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Pedidos activos',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Historial',
      url: '/historial',
      icon: 'clipboard'
    },
    {
      title: 'Reseñas',
      url: '/rates',
      icon: 'star'
    },
    {
      title: 'Productos',
      url: '/productos',
      icon: 'cart'
    },
    {
      title: 'Repartidores',
      url: '/repartidores',
      icon: 'people'
    },
    {
      title: 'Búsqueda',
      url: '/busqueda',
      icon: 'search'
    },
    {
      title: 'Horario',
      url: '/horario',
      icon: 'calendar'
    },
    {
      title: 'Perfil',
      url: '/perfil',
      icon: 'person'
    },
    {
      title: 'Cuenta',
      url: '/cuentas',
      icon: 'ribbon'
    },
  ];

  pedidos: number;

  uid: string;
  uidSub: Subscription;
  pedSub: Subscription;
  cuentaSub: Subscription;

  constructor(
    private router: Router,
    private platform: Platform,
    private pedidoService: PedidosService,
    private swService: SwUpdateService,
    private authService: AuthService,
    private fcmService: FcmService,
    private uidService: UidService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', (event) => {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });

      this.swService.checkUpdates();
      this.getUser();
    });
  }

  getUser() {
    this.uidSub = this.uidService.usuario.subscribe(uid => {
      this.uid = uid;
      if (this.uid) this.getCuenta()
    });
  }

  getCuenta() {
    this.cuentaSub = this.uidService.cuentaWatch.subscribe(cuenta => {
      if (cuenta && cuenta !== 'basica') {
        this.getPedidos();
        this.fcmService.requestToken();
      }
    });
  }

  getPedidos() {
    this.pedSub = this.pedidoService.getPedidosCount().subscribe((count: number) => {
      if (count) {
        this.pedidos = count;
      } else {
        this.pedidos = 0;
      }
    });
  }

  salir() {
    if (this.pedSub) { this.pedSub.unsubscribe(); }
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
