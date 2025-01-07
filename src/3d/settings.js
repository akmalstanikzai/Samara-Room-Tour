import { SRGBColorSpace, NoToneMapping} from 'three';
import { MathUtils } from './libs/math';
import { Linear } from 'gsap';


const params = {
  pano: {
    preload: true,
  },
  postProcessing: {
    enabled: false,
    antialias: {
      multisampling: 4,
    },
  },
  animation: {
    move: {
      duration: 1.4,
      ease: Linear,
      easeName: 'Linear',
    },
  },
  container: null,
  paths: {
    models_path: '/models/',
    textures_path: '/textures/',
    decoders_path: '/decoders/',
    assets_path: '/assets/',
  },
  loadOnDemand: {
    enabled: true,
    loadingManager: {
      enabled: true,
    },
  },

  useCompressedTextures: false, // Use ktx2 compressed textures
  renderer: {
    renderOnDemand: { enabled: true },
    outputEncoding: SRGBColorSpace,
    get pixelRatio() {
      return Math.max(1, window.devicePixelRatio);
    },
    exposure: 1,
    toneMapping: NoToneMapping,
    defaultRenderer: {
      antialias: true,
      alpha: true,
    },
  },

  camera: {
    portraitAspect: 3.5 / 4,
    landscapeAspect: 4 / 3.5,
    near: 5,
    far: 50,
    fov: 40,
    initPos: {
      x: -10.873648212948423,
      y: 0.4188578127354573,
      z: 5.075787066382408,
    },
  },

  light: {
    intensity: 1,
  },

  envMap: {
    intensity: 1.5,
  },

  materials: {
    metal: { metalness: 0.2, roughness: 0.3 },
    wood: { metalness: 0.2, roughness: 0.7 },
  },

  maps: {
    lightMap: {
      intensity: 0.01,
    },
    aoMap: {
      intensity: 1,
    },
  },

  aoMap: {
    air: { intensity: 0.5 },
    desk: { intensity: 0.5 },
    roof: { intensity: 0.5 },
    patio: { intensity: 0.5 },
    exterior: {
      intensity: 0.4,
    },
  },

  controls: {
    thirdPerson: {
      focalOffset: {
        x: 0,
        y: 0,
        z: 0,
      },
      smoothTime: 0.3,
      draggingSmoothTime: 0.3,
      polarRotateSpeed: 1,
      azimuthRotateSpeed: 1,
      maxDistance: 4,
      minDistance: 3,
      maxPolarAngle: MathUtils.degToRad(88),
      minPolarAngle: MathUtils.degToRad(0),
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
      minZoom: 2.25,
      maxZoom: 10,
      defaultZoom: 2.5,
      near: 0.5,
    },

    firstPerson: {
      focalOffset: {
        x: 0,
        y: 0,
        z: 0,
      },
      minZoom: 0.35,
      maxZoom: 0.65,
      defaultZoom: 0.5,
      near: 0.01,
      polarRotateSpeed: -1,
      azimuthRotateSpeed: -1,
      smoothTime: 0.1,
      draggingSmoothTime: 0.1,
      maxPolarAngle: Math.PI,
      minPolarAngle: 0,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
    },
  },
  environment: {
    assetsArray: [
      {
        id: 1,
        hdrTexturePath: 'hdr/1.hdr',
        name: 'hdr-1',
        defaultHdrIntensity: 0.9,
      },

      {
        id: 2,
        hdrTexturePath: 'hdr/2.hdr',
        name: 'hdr-2',
        isDefault: true,
        defaultHdrIntensity: 1.5,
      },
      {
        id: 3,
        hdrTexturePath: 'hdr/spiaggia_di_mondello_1k.hdr',
        name: 'hdr-3',
        defaultHdrIntensity: 0.9,
      },
      {
        id: 4,
        hdrTexturePath: 'hdr/overcast.hdr',
        name: 'overcast',
        defaultHdrIntensity: 0.05,
      },
    ],
  },

  shadowMesh: {
    opacity: 0.8,
  },
  textures: [],

  models: {
    samara: {
      assetsArray: [
        {
          name: 'studio',
          totalAssetsCount: 15,
          textures: [],
        },
      ],
      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
      rotation: Math.PI,
    },
  },
};

export { params };
