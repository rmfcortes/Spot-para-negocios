import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AnimationsService } from 'src/app/services/animations.service';
import { ProductoPasillo, Producto } from 'src/app/interfaces/producto';


@Component({
  selector: 'app-list-img',
  templateUrl: './list-img.component.html',
  styleUrls: ['./list-img.component.scss'],
})
export class ListImgComponent {

  @Input() sections: ProductoPasillo[]
  @Output() showProduct = new EventEmitter<Producto>()


  constructor(
    private animationService: AnimationsService,
  ) { }

  presentProduct(product: Producto) {
    this.showProduct.emit(product)
  }

  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

}
