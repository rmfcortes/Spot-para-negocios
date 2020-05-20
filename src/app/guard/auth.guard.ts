import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { RegionService } from '../services/region.service';
import { CuentaService } from '../services/cuenta.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private regionService: RegionService,
    private cuentaService: CuentaService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.authService.checkUser()
      .then(uid => {
        if (!uid) { 
          this.router.navigate(['/login']);
          throw 'no_uid';
        }
        return this.regionService.checkRegion()
      })
      .then(region => {
        if (!region) { 
          return this.regionService.getRegiones().then(regiones => {
            if (regiones.length > 1) {
              this.router.navigate(['/region']);
              return false;
            } else {
              // Sólo hay una región y es Ojocaliente
              this.regionService.setRegion('ojocaliente');
              return this.cuentaService.checkCuenta();
            }
          });
        } else {
          return this.cuentaService.checkCuenta();
        }
      })
      .then(cuenta => {
        if (!cuenta) {
          this.cuentaService.setCuenta('basica');
        }
        return true;
      });
  }

}
