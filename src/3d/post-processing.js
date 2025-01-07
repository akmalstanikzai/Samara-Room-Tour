import { HalfFloatType} from 'three';
import { params } from './settings';
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  TiltShiftEffect,
  ToneMappingEffect,
  Effect,
  BlendFunction,
} from 'postprocessing';
import { MotionBlurEffect, VelocityDepthNormalPass } from 'realism-effects';

// Custom warm color overlay effect
class WarmColorEffect extends Effect {
  constructor({
    blendFunction = BlendFunction.MULTIPLY,
    intensity = 0.9,
    gamma = 2.4, // Default gamma value
  } = {}) {
    super(
      'WarmColorEffect',
      `
      uniform float intensity;
      uniform float gamma;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 warmColor = vec3(1.0, 0.8, 0.6); // Adjust this color for 4000K
        vec3 warmedColor = mix(inputColor.rgb, inputColor.rgb * warmColor, intensity);
        vec3 gammaCorrected = pow(warmedColor, vec3(1.0 / gamma));
        outputColor = vec4(gammaCorrected, inputColor.a);
      }
    `,
      {
        blendFunction,
        uniforms: new Map([
          ['intensity', { value: intensity }],
          ['gamma', { value: gamma }],
        ]),
      }
    );
  }
}

class PostProcessing {
  constructor(engine) {
    this.engine = engine;
  }

  init() {
    this.composer = new EffectComposer(this.engine.renderer, {
      frameBufferType: HalfFloatType,
      multisampling: params.postProcessing.antialias.multisampling,
    });

    // Render pass
    this.renderPass = new RenderPass(this.engine.scene, this.engine.camera);

    // Velocity pass (required for motion blur)
    this.velocityPass = new VelocityDepthNormalPass(
      this.engine.scene,
      this.engine.camera
    );

    // Motion blur
    this.motionBlur = new MotionBlurEffect(this.velocityPass);
    this.motionBlur.intensity = 5;
    this.motionBlur.jitter = 0.1;
    // this.motionBlur.samples = 4;

    // Tilt Shift
    this.tiltShiftEffect = new TiltShiftEffect({
      focusArea: 0.4,
      feather: 0.3,
      offset: 0.05,
    });

    // Reinhard Tone Mapping with warmer settings (approx. 4000K)
    this.toneMappingEffect = new ToneMappingEffect({
      mode: ToneMappingEffect.REINHARD,
      resolution: 256,
      whitePoint: 1.5, // Increased to 1.5
      middleGrey: 0.6, // Keep at 0.8
      minLuminance: 0.01,
      averageLuminance: 0.01,
      adaptationRate: 1.0,
    });

    // Warm color overlay effect
    this.warmColorEffect = new WarmColorEffect(); // Adjust intensity as needed

    // Effect pass combining motion blur, tone mapping, and warm color overlay
    this.effectPass = new EffectPass(
      this.engine.camera
      // this.motionBlur
      // this.toneMappingEffect,
      // this.warmColorEffect
      // this.tiltShiftEffect
    );

    // All passes
    this.allPasses = [
      this.renderPass,
      // this.velocityPass,
      this.effectPass,
    ];

    this.allPasses.forEach((pass) => {
      this.composer.addPass(pass);
    });
  }

  render() {
    this.composer.render();
  }

  setDebugMode(mode) {
    console.log(mode);
  }
}

export { PostProcessing };
