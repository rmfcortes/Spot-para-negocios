import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-politica',
  templateUrl: './politica.page.html',
  styleUrls: ['./politica.page.scss'],
})
export class PoliticaPage implements OnInit {

  back: Subscription;

  constructor(
    private platform: Platform,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      const nombre = 'app';
      navigator[nombre].exitApp();
    });
  }

  ionViewWillLeave() {
    if (this.back) {this.back.unsubscribe()}
  }

}
