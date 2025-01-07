import { Textures } from './textures';

export class Materials {
  constructor() {
    this.textures = new Textures();
    this.allMaterials = new Map();
    this.transmissiveMaterials = new Set();
  }

  setupMaterials(mesh, modelName) {}
}
