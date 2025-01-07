import {
  Vector2,
  SpriteMaterial,
  Sprite,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  Vector3,
  Object3D,
} from 'three';
import { params } from '../settings';

/** Hotspots */
export class Hotspots {
  constructor(engine) {
    this.engine = engine;
    this.setup();
  }

  async setup() {
    this.vector = new Vector3();
    this.engine.pano.panoItems.forEach((pano) => {
      const hotspot = new Mesh(
        new PlaneGeometry(params.hotspot.size, params.hotspot.size),
        new MeshBasicMaterial({
          name: 'Hotspot',
          map: this.engine.textures.getTexture('Hotspot.png'),
          transparent: true,
          // depthTest: false,
          opacity: params.hotspot.opacity,
        })
      );

      hotspot.rotation.x = -Math.PI / 2;
      hotspot.position.copy(pano.position);
      hotspot.position.y = this.engine.models.group.box.min.y + 0.6;
      hotspot.scale.setScalar(3.25);
      hotspot.renderOrder = 0;
      hotspot.name = `Hotspot_${pano.name}`;
      this.engine.scene.add(hotspot);
      this.engine.meshes.push(hotspot);
    });
    this.infospots = [];

    this.engine.pano.infospots.forEach((item) => {
      this.engine.pano.infospots?.forEach((item) => {
        const infoSpot = new Object3D();
        infoSpot.position.copy(item.position);

      infoSpot.name = `Infospot_${item.name}`;
      infoSpot._bubbleText = item.bubbleText;
      this.infospots.push(infoSpot);
      this.engine.scene.add(infoSpot);
    })});
  }

  /**
   * Updates the position of HTML elements associated with infospots in the 3D scene.
   * This method is typically called every frame to:
   * 1. Project 3D coordinates to 2D screen space
   * 2. Update the position of HTML overlays to match their 3D counterparts
   * 3. Hide elements that are behind the camera or invisible
   *
   * @returns {void}
   */
  update() {
    this.infospots?.forEach((object) => {
      if (!object.htmlEl || !params.container) return;
      const width = params.container.clientWidth;
      const height = params.container.clientHeight;
      object.updateWorldMatrix(true, false);
      object.getWorldPosition(this.vector);

      this.vector.project(this.engine.camera);

      const x = (this.vector.x * 0.5 + 0.5) * width;
      const y = (this.vector.y * -0.5 + 0.5) * height;
      this.vector.z > 0.995 || !object.visible
        ? (object.htmlEl.style.display = 'none')
        : (object.htmlEl.style.display = 'block');

      object.htmlEl.style.left = `${x - object.htmlEl.clientWidth / 2}px`;
      object.htmlEl.style.top = `${y - object.htmlEl.clientHeight / 2}px`;
    });
  }
}
