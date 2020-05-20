import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Section, Product } from 'src/app/interfaces/products.interface';
import { MainProfile } from 'src/app/interfaces/profile.interface';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnInit {

  @Input() sections: Section[]
  @Input() profile: MainProfile

  @Output() showProduct = new EventEmitter<Product>()


  constructor() { }

  ngOnInit() {}

  presentProduct(product: Product) {
    this.showProduct.emit(product)
  }

}
