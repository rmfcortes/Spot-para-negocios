import { Injectable } from '@angular/core';
import { createAnimation, Animation, Gesture, GestureConfig, createGesture } from '@ionic/core';


@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  constructor( ) { }

  pulse(element) {
    createAnimation()
      .addElement(element)
      .duration(1000)
      .iterations(1)
      .keyframes([
        { offset: 0, transform: 'scale(0.97)', opacity: '1' },
        { offset: 0.5, transform: 'scale(1.25)', opacity: '.93' },
        { offset: 1, transform: 'scale(0.97)', opacity: '1' }
      ])
      .play()
  }

  enterAnimation(element) {
    createAnimation()
      .addElement(element)
      .easing('ease-out')
      .duration(500)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ])
      .play();
  }



}
