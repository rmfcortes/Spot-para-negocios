import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PreloadImageComponent } from '../components/pre-load-image/pre-load-image.component';
import { StarsComponent } from '../components/stars/stars.component';


@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [ PreloadImageComponent, StarsComponent],
    exports: [ PreloadImageComponent, StarsComponent]
  })

  export class SharedModule {}
