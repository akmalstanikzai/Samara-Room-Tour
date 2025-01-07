import {
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshNormalMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Vector3,
  Vector2,
  Quaternion,
} from 'three';
import { params } from '../settings';
import { gsap } from 'gsap';
import { userDevice } from '../../utils/browser-detection';

/** Cursor */
export class Cursor {
  constructor(engine) {
    this.engine = engine;
    this.init();
    this.hoveredHotspot = null;
    this.targetQuaternion = new Quaternion();
    this.clickTimeout = null; // Timer per gestire il doppio clic
  }

  init() {
    const geometry = new PlaneGeometry(params.cursor.size, params.cursor.size);

    const material = new MeshBasicMaterial({
      color: new Color(Number(`0x${params.cursor.color}`)),
      side: DoubleSide,
      map: this.engine.textures.getTexture('Cursor.png'),
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    this.pin = new Mesh(geometry, material);
    this.pin.visible = false;
    this.pin.renderOrder = 15;
    this.pin.name = 'pin';
    this.pin.scale.setScalar(3);
    this.engine.scene.add(this.pin);

    this.raycaster = new Raycaster();
    this.mouseHelper = new Mesh(
      new BoxGeometry(1, 1, 10),
      new MeshNormalMaterial()
    );
    this.mouseHelper.visible = false;

    this.intersection = {
      intersects: false,
      point: new Vector3(),
      normal: new Vector3(),
    };

    this.intersects = [];
    this.mouse = new Vector3();
  }

  /**
   * Gets the current cursor position as a Vector2.
   * @returns {Vector2} The cursor position in normalized device coordinates.
   */

  get cursorPosition() {
    return new Vector2(this.mouse.x, this.mouse.y);
  }

  onMove(e) {
    const containerRect = params.container.getBoundingClientRect();
    const containerX = containerRect.left;
    const containerY = containerRect.top;
    const mouseX = e.clientX - containerX;
    const mouseY = e.clientY - containerY;

    this.mouse.x = (mouseX / params.container.clientWidth) * 2 - 1;
    this.mouse.y = -(mouseY / params.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    const visibleObjects = this.engine.meshes.filter(
      (mesh) => mesh.material && mesh.material.opacity > 0.2
    );
    this.raycaster.intersectObjects(visibleObjects, false, this.intersects);

    if (this.intersects.length > 0) {
      this.intersects.sort((a, b) => {
        if (
          a.object.name.includes('Hotspot') &&
          !b.object.name.includes('Hotspot')
        )
          return -1;
        if (
          !a.object.name.includes('Hotspot') &&
          b.object.name.includes('Hotspot')
        )
          return 1;
        return 0;
      });

      const firstIntersect = this.intersects[0];
      if (
        firstIntersect.object.visible &&
        firstIntersect.object.name.includes('Hotspot')
      ) {
        this.pin.visible = false;
        if (!userDevice.isMobile) {
          params.container.classList.add('cursor-pointer');
        }

        if (this.hoveredHotspot !== firstIntersect.object) {
          if (this.hoveredHotspot) {
            this.animateHotspotOpacity(
              this.hoveredHotspot,
              params.hotspot.opacity
            );
          }
          this.hoveredHotspot = firstIntersect.object;
          this.animateHotspotOpacity(
            this.hoveredHotspot,
            params.hotspot.hoverOpacity
          );
        }
      } else {
        if (!userDevice.isMobile) {
          this.pin.visible = true;
          params.container.style.cursor = 'auto';
          params.container.classList.remove('cursor-pointer');
        }

        const point = firstIntersect.point;
        this.mouseHelper.position.copy(point);
        this.intersection.point.copy(point);

        if (firstIntersect.face) {
          const normal = firstIntersect.face.normal.clone();
          normal.transformDirection(firstIntersect.object.matrixWorld);
          normal.add(firstIntersect.point);

          this.intersection.normal.copy(firstIntersect.face.normal);
          this.mouseHelper.lookAt(normal);
        }

        this.pin.position.copy(this.intersection.point);
        this.targetQuaternion.setFromEuler(this.mouseHelper.rotation);
        this.intersection.intersects = true;

        if (this.hoveredHotspot) {
          this.animateHotspotOpacity(
            this.hoveredHotspot,
            params.hotspot.opacity
          );
          this.hoveredHotspot = null;
        }
      }

      this.intersects.length = 0;
    } else {
      this.intersection.intersects = false;
      this.pin.visible = false;
      this.engine.controls.enabled = true;

      if (this.hoveredHotspot) {
        this.animateHotspotOpacity(this.hoveredHotspot, params.hotspot.opacity);
        this.hoveredHotspot = null;
      }
    }
  }

  animateHotspotOpacity(hotspot, targetOpacity) {
    gsap.to(hotspot.material, {
      opacity: targetOpacity,
      duration: params.hotspot.hoverTransitionTime,
      ease: 'power2.out',
    });
  }

  update(deltaTime) {
    this.pin.quaternion.slerp(this.targetQuaternion, params.cursor.lerpFactor);
  }

  onClick(e) {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;

      // Double click: finds further hotspot
      this.raycaster.intersectObjects(this.engine.meshes, false, this.intersects);

      if (this.intersects.length > 0) {
        const clickPoint = this.intersects[0].point;
        this.findFurthestHotspot(clickPoint);
      }
    } else {
      this.clickTimeout = setTimeout(() => {
        this.clickTimeout = null;

        // Single click: finds closest hotspot
        this.raycaster.intersectObjects(this.engine.meshes, false, this.intersects);

        if (this.intersects.length > 0) {
          const clickPoint = this.intersects[0].point;
          this.findClosestHotspot(clickPoint);
        }
      }, 250);
    }
  }

  findClosestHotspot(clickPoint) {
    let closestHotspot = null;
    let closestDistance = Infinity;
  
    const visibleHotspots = this.engine.meshes.filter(
      (mesh) => mesh.name.includes('Hotspot') && mesh.visible
    );
  
    visibleHotspots.forEach((hotspot) => {
      const distance = clickPoint.distanceTo(hotspot.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestHotspot = hotspot;
      }
    });
  
    if (closestHotspot) {
      const cameraMap = this.engine.pano.panoItems.find((pano) =>
        closestHotspot.name.includes(pano.name)
      );
      this.engine.pano.change(cameraMap.name, false, 0.3); // Set duration to 0.5 seconds for smoother transition
    }
  }
  
  findFurthestHotspot(clickPoint) {
    let furthestHotspot = null;
    let furthestDistance = -Infinity;
  
    const visibleHotspots = this.engine.meshes.filter(
      (mesh) => mesh.name.includes('Hotspot') //&& mesh.visible
    );
  
    visibleHotspots.forEach((hotspot) => {
      const distance = clickPoint.distanceTo(hotspot.position);
      if (distance > furthestDistance) {
        furthestDistance = distance;
        furthestHotspot = hotspot;
      }
    });
  
    if (furthestHotspot) {
      const cameraMap = this.engine.pano.panoItems.find((pano) =>
        furthestHotspot.name.includes(pano.name)
      );
      this.engine.pano.change(cameraMap.name, false, 0.3); // Set duration to 0.5 seconds for smoother transition
    }
  }
}
