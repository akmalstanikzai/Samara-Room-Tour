import { appState } from '../services/app-state';
import { params } from './settings';

export class Assets {
  constructor(engine) {
    this.engine = engine;
    this.initialAsset = appState.complectation.value.layout;
    this.promises = new Map();
  }

  async loadAndSetup() {
    const promises = Promise.all([
      this.engine.models.load(),
      this.engine.textures.load(),
    ]);

    // console.log(promises);
    await promises;
    this.engine.models.setup(true);
  }

  async loadAndSetupRest() {
    // Load rest models in background

    const restPromises = Promise.all([
      this.engine.textures.load(true),
      this.engine.models.load(true),
    ]);
    // console.log(restPromises);

    params.models.samara.assetsArray.forEach((asset) => {
      if (!this.promises.has(asset.name) && asset.name !== this.initialAsset) {
        this.promises.set(
          asset.name,
          new Promise((resolve) => {
            Promise.all([asset.modelPromise, ...asset.texturesPromises]).then(
              async (results) => {
                this.engine.models[`${asset.name}_assets`] = [
                  await asset.modelPromise,
                ];
                this.engine.models.setup();
                resolve(results);
              }
            );
          })
        );
      }
    });

    await restPromises;
  }

  /**
   * Checks if the specified asset is loaded and sets up the model once loaded.
   * @param {string} layout - The layout of the asset to check and set up.
   */
  async checkAssetLoadedAndSetupComplete(layout) {
    appState.modelLoadingIndicator.next({
      isLoading: true,
      name: layout,
    });

    const promise = this.promises.get(layout);
    // console.log(promise);
    await promise;

    appState.modelLoadingIndicator.next({ isLoading: false });
  }
}
