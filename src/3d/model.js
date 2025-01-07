import {
  Vector3,
  Group,
  Box3,
} from 'three';
import { params } from './settings';
import { appState } from '../services/app-state';
import { Materials } from './materials';
import { Textures } from './textures';

export class Model extends Group {
  constructor(engine) {
    super();
    this.textures = new Textures();
    this.materials = new Materials();
    this.engine = engine;
  }

  async load(reInit) {
    return;
  }

  setup(firstInit) {
    if (firstInit) {
      this.group = new Group();
      this.group.name = 'Scene children';
      this.add(this.group);
      this.engine.scene.add(this);
      this.name = 'Scene parent';
    }

    if (firstInit) {
      this.group.scale.set(
        params.models.samara.scale.x,
        params.models.samara.scale.y,
        params.models.samara.scale.z
      );
      this.group.rotation.y = params.models.samara.rotation;
    }
    return;
  }

  getAssets(name = appState.complectation.value.layout) {
    return this[`${name}_assets`];
  }

  computeBoundingBox(obj) {
    return new Box3().setFromObject(obj);
  }

  centerModels(model, adjustX = 0, adjustY = 0, adjustZ = 0) {
    const tempBox = new Box3();
    const box = tempBox.setFromObject(model);
    const center = box.getCenter(new Vector3());
    model.position.x += this.engine.scene.position.x - center.x + adjustX;
    model.position.y += this.engine.scene.position.y - center.y + adjustY;
    model.position.z += this.engine.scene.position.z - center.z + adjustZ;
  }
}
