import {
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
} from 'three';
import { MathUtils } from './libs/math';
import CameraControls from 'camera-controls';
import { params } from './settings';
import * as holdEvent from 'hold-event';

/** Class for controls */

export class cameraControls {
  constructor(engine) {
    this.engine = engine;
  }

  initControls(reInit) {
    if (!reInit) {
      const subsetOfTHREE = {
        Vector2: Vector2,
        Vector3: Vector3,
        Vector4: Vector4,
        Quaternion: Quaternion,
        Matrix4: Matrix4,
        Spherical: Spherical,
        Box3: Box3,
        Sphere: Sphere,
        Raycaster: Raycaster,
        MathUtils: {
          DEG2RAD: MathUtils.DEG2RAD,
          clamp: MathUtils.clamp,
        },
      };

      CameraControls.install({ THREE: subsetOfTHREE });
    }

    const none = CameraControls.ACTION.NONE;

    this.engine.controls = new CameraControls(
      this.engine.camera,
      params.container
    );

    // Disable translation controls
    this.engine.controls.mouseButtons.wheel = none;
    this.engine.controls.mouseButtons.middle = none;
    this.engine.controls.touches.two = none;
    this.engine.controls.touches.three = none;
    this.engine.controls.mouseButtons.right = none;
    this.engine.controls.restThreshold = 3;

    // Enable rotation controls
    this.engine.controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    this.engine.controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;

    this.setFirstPersonParams();

    const KEYCODE = {
      W: 87,
      A: 65,
      S: 83,
      D: 68,
      ARROW_LEFT: 37,
      ARROW_UP: 38,
      ARROW_RIGHT: 39,
      ARROW_DOWN: 40,
    };
    this.holdIntervalDelay = 0.01;

    this.wKey = new holdEvent.KeyboardKeyHold(KEYCODE.W, 10);
    this.aKey = new holdEvent.KeyboardKeyHold(KEYCODE.A, 10);
    this.sKey = new holdEvent.KeyboardKeyHold(KEYCODE.S, 10);
    this.dKey = new holdEvent.KeyboardKeyHold(KEYCODE.D, 10);
    this.leftArrowKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_LEFT, 10);
    this.rightArrowKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 10);
    this.upArrowKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_UP, 10);
    this.downArrowKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_DOWN, 10);
    this.addListeners(); // Add this line to enable the controls
  }

  addListeners() {
    this.listeners = [
      {
        eventTarget: this.aKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(-this.holdIntervalDelay, 0, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.dKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(this.holdIntervalDelay, 0, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.wKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(0, -this.holdIntervalDelay, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.sKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(0, this.holdIntervalDelay, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.leftArrowKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(-this.holdIntervalDelay, 0, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.rightArrowKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(this.holdIntervalDelay, 0, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.upArrowKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(0, -this.holdIntervalDelay, false);
          this.engine.update();
        },
      },
      {
        eventTarget: this.downArrowKey,
        eventName: 'holding',
        eventFunction: () => {
          this.engine.controls.rotate(0, this.holdIntervalDelay, false);
          this.engine.update();
        },
      },
    ];

    this.listeners.forEach((listener) => {
      listener.eventTarget.addEventListener(
        listener.eventName,
        listener.eventFunction
      );
    });
  }

  removeListeners() {
    this.listeners.forEach((listener) => {
      listener.eventTarget.removeEventListener(
        listener.eventName,
        listener.eventFunction
      );
    });
  }

  setThirdPersonParams() {
    this.engine.controls.minZoom = params.controls.thirdPerson.minZoom;
    this.engine.controls.maxZoom = params.controls.thirdPerson.maxZoom;
    this.engine.controls.smoothTime = params.controls.thirdPerson.smoothTime;
    this.engine.controls.draggingSmoothTime =
      params.controls.thirdPerson.draggingSmoothTime;
    this.engine.controls.azimuthRotateSpeed =
      params.controls.thirdPerson.azimuthRotateSpeed;
    this.engine.controls.polarRotateSpeed =
      params.controls.thirdPerson.polarRotateSpeed;
    this.engine.controls.maxPolarAngle =
      params.controls.thirdPerson.maxPolarAngle;
    this.engine.controls.minPolarAngle =
      params.controls.thirdPerson.minPolarAngle;
    this.engine.controls.minAzimuthAngle =
      params.controls.thirdPerson.minAzimuthAngle;
    this.engine.controls.maxAzimuthAngle =
      params.controls.thirdPerson.maxAzimuthAngle;
    this.engine.camera.near = params.controls.thirdPerson.near;
    this.engine.camera.updateProjectionMatrix();
    this.engine.controls.normalizeRotations();
    const { x, y, z } = params.controls.thirdPerson.focalOffset;
    this.engine.controls.setFocalOffset(x, y, z);
    this.engine.controls.zoomTo(params.controls.thirdPerson.defaultZoom);
  }

  setFirstPersonParams() {
    this.engine.controls.smoothTime = params.controls.firstPerson.smoothTime;
    this.engine.controls.draggingSmoothTime =
      params.controls.firstPerson.draggingSmoothTime;
    this.engine.controls.minZoom = params.controls.firstPerson.minZoom;
    this.engine.controls.maxZoom = params.controls.firstPerson.maxZoom;
    this.engine.controls.azimuthRotateSpeed =
      params.controls.firstPerson.azimuthRotateSpeed;
    this.engine.controls.polarRotateSpeed =
      params.controls.firstPerson.polarRotateSpeed;
    this.engine.controls.maxPolarAngle =
      params.controls.firstPerson.maxPolarAngle;
    this.engine.controls.minPolarAngle =
      params.controls.firstPerson.minPolarAngle;
    this.engine.controls.minAzimuthAngle =
      params.controls.firstPerson.minAzimuthAngle;
    this.engine.controls.maxAzimuthAngle =
      params.controls.firstPerson.maxAzimuthAngle;
    this.engine.camera.near = params.controls.firstPerson.near;
    this.engine.camera.updateProjectionMatrix();
    this.engine.controls.normalizeRotations();
    const { x, y, z } = params.controls.firstPerson.focalOffset;
    this.engine.controls.setFocalOffset(x, y, z);
    this.engine.controls.zoomTo(params.controls.firstPerson.defaultZoom);
  }
}