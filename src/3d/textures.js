import {
  SRGBColorSpace,
  TextureLoader,
  WebGLCubeRenderTarget,
  FloatType,
  RepeatWrapping,
  LinearMipMapLinearFilter,
  LinearFilter,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { loadingManager } from './loading-manager';
import { params } from './settings';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export class Textures {
  constructor() {
    this.textureLoader = new TextureLoader(loadingManager);
    this.rgbeLoader = new RGBELoader(loadingManager);
    this.ktx2Loader = new KTX2Loader(loadingManager);
  }

  async init(engine) {
    this.engine = engine;

    // Check for compressed texture support and configure KTX2 loader
    if (params.useCompressedTextures) {
      if (
        this.engine.renderer
          .getContext()
          .getExtension('WEBGL_compressed_texture_s3tc_srgb') === null
      ) {
        console.warn('WEBGL_compressed_texture_s3tc_srgb is not supported');
        params.useCompressedTextures = false;
      }

      this.ktx2Loader.setTranscoderPath(`${params.paths.decoders_path}basis/`);
      this.ktx2Loader.detectSupport(this.engine.renderer);
    }

    // Initialize RGBELoader with platform-specific configurations
    this.rgbeLoader.setDataType(FloatType);
    this.textureLoader.setPath(params.paths.textures_path);
    this.rgbeLoader.setPath(params.paths.textures_path);
  }

  async load(reInit) {
    // Optimize texture loading using Promise.allSettled to handle failures gracefully
    const promises = [].concat(
      params.textures.flatMap((texture) =>
        !texture.loadedTexture ? this.loadTexture(texture, 'map') : []
      ),
      params.models.samara.assetsArray.flatMap((asset) => {
        asset.texturesPromises = asset.texturesPromises || [];

        return reInit || asset.name === this.engine.assets.initialAsset
          ? asset.textures.flatMap((texture) => {
              if (!texture.loadedTexture) {
                const promise = this.loadTexture(texture, 'map');
                asset.texturesPromises.push(promise);
                return promise;
              }
              return [];
            })
          : [];
      }),
      !reInit
        ? params.environment.assetsArray.flatMap(async (el) => {
            if (params.loadOnDemand.enabled && el.isDefault) {
              return this.loadTexture(el, 'pmrem');
            } else {
              return Promise.resolve({ name: el.name, status: 'skipped' });
            }
          })
        : []
    );

    return Promise.allSettled(promises).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn(`Texture load failed: ${result.reason}`);
        }
      });
    });
  }

  getHdrTexture(name) {
    // Return preloaded HDR texture
    return params.environment.assetsArray.find(
      (texture) => texture.name === name
    ).loadedHDRTexture;
  }

  getTexture(textName) {
    // Find and return a texture by name
    let texture = params.textures.find((texture) => texture.name === textName);
    if (!texture) {
      params.models.samara.assetsArray.filter((el) =>
        el.textures.some((item) => {
          if (item.name === textName) {
            texture = item;
          }
        })
      );
    }
    if (!texture) {
      console.error(`Texture not found: ${textName}`);
      return;
    }
    return texture.loadedTexture;
  }

  async loadTexture(obj, textureType) {
    try {
      // Skip loading if texture is already loaded
      if (obj.loadedTexture) return Promise.resolve({ [obj.name]: 'already loaded' });

      const texture =
        textureType === 'pmrem'
          ? await this.loadHdrTexture(obj)
          : await this.loadMapTexture(obj);

      this.setupTexture(texture, obj);
      obj.loadedTexture = texture;

      return { [obj.name]: 'loaded' };
    } catch (error) {
      console.error(`Error loading texture ${obj.name}:`, error);
      return { [obj.name]: 'failed' };
    }
  }

  async loadHdrTexture(obj) {
    // Load HDR texture and convert to cubemap
    const hdr = await this.rgbeLoader.loadAsync(obj.hdrTexturePath);
    const cubeRenderTarget = new WebGLCubeRenderTarget(256).fromEquirectangularTexture(
      this.engine.renderer,
      hdr
    );
    obj.loadedHDRTexture = cubeRenderTarget.texture;
    return cubeRenderTarget.texture;
  }

  async loadMapTexture(obj) {
    // Load regular or compressed texture based on configuration
    return params.useCompressedTextures && obj.ktxPath
      ? this.ktx2Loader.loadAsync(this.path + obj.ktxPath)
      : this.textureLoader.loadAsync(obj.path);
  }

  setupTexture(texture, obj) {
    // Configure texture properties for optimal rendering
    if (obj.anisotropy) {
      texture.anisotropy = this.engine.renderer.capabilities.getMaxAnisotropy();
    }

    if (obj.repeat) {
      texture.wrapT = texture.wrapS = RepeatWrapping;
      obj.repeatSet && texture.repeat.set(obj.repeatSet, obj.repeatSet);
    }

    if (!obj.nonSrgb) {
      texture.colorSpace = SRGBColorSpace;
    }

    if (obj.rotation) {
      texture.rotation = obj.rotation;
    }

    // Use optimized filters
    if (obj.filter) {
      texture.minFilter = LinearMipMapLinearFilter;
      texture.magFilter = LinearFilter;
    }

    texture.flipY = obj.flip ? true : false;
  }
}
