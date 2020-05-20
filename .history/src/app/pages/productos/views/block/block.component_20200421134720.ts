import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';

import { Section, Product } from 'src/app/interfaces/products.interface';
import { MainProfile } from 'src/app/interfaces/profile.interface';


@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
})
export class BlockComponent implements OnInit {

  @ViewChild(NgxMasonryComponent, {static: false}) masonry: NgxMasonryComponent;

  @Input() sections: Section[]
  @Input() profile: MainProfile
  @Output() showProduct = new EventEmitter<Product>()

  public myOptions: NgxMasonryOptions = {
    gutter: 10
  };

  constructor(
  ) { }

  ngOnInit() {
    console.log(this.sections);
  }

  presentProduct(product: Product) {
    this.showProduct.emit(product)
  }

}
