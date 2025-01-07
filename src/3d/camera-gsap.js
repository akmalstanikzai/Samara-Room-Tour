import { gsap, Power0, Linear, Power4, Power3 } from 'gsap';
import { appState } from '../services/app-state';

/** Class for smooth camera transitions with gsap. */

class CameraGsap {
  constructor() {
    this.targetIndex = 0;
    this.engine = window.engine;
  }

  /**
   * Make an orbit with given points
   * @param {number} positionX Camera position x.
   * @param {number} positionY  Camera position y.
   * @param {number} positionZ  Camera position z.
   * @param {number} targetX  Orbit center position x.
   * @param {number} targetY  Orbit center position y.
   * @param {number} targetZ  Orbit center position z.
   * @param {number} animationTime  Animation time
   */

  setLookAt(
    positionX,
    positionY,
    positionZ,
    targetX,
    targetY,
    targetZ,
    animationTime,
  ) {
    const targetA = this.engine.controls.getTarget();
    const targetB = {
      x: targetX,
      y: targetY,
      z: targetZ,
    };

    const positionA = this.engine.controls.getPosition();
    const positionB = { x: positionX, y: positionY, z: positionZ };
    const obj = {
      t: 0,
    };

    const tl = gsap.timeline();
    tl.to(obj, {
      t: 1,
      duration: animationTime,
      onStart: () => {
        appState.renderingStatus.next(true);
      },
      onComplete: () => {
        this.engine.controls.enabled = true;
        appState.renderingStatus.next(false);
      },
      onUpdate: () => {
        appState.renderingStatus.next(true);
        const progress = tl.progress();

        this.engine.controls.enabled = false;

        this.engine.controls.lerpLookAt(
          positionA.x,
          positionA.y,
          positionA.z,
          targetA.x,
          targetA.y,
          targetA.z,
          positionB.x,
          positionB.y,
          positionB.z,
          targetB.x,
          targetB.y,
          targetB.z,
          progress,
          true
        );
      },
    });
    this.engine.update();
    return tl;
  }
}

export { CameraGsap };
