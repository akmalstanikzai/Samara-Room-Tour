import {
  MeshPhysicalMaterial,
  Color,
  Vector2,
  MeshLambertMaterial,
  Object3D,
  Mesh,
  DoubleSide,
  LinearSRGBColorSpace,
} from 'three';
import { params } from './settings';
import { Textures } from './textures';
import { MeshTransmissionMaterial } from './libs/MeshTransmissionMaterial';
import MeshReflectorMaterial from './libs/MeshReflectorMaterial';

export class Materials {
  constructor() {
    this.textures = new Textures();
    this.allMaterials = new Map();
    this.transmissiveMaterials = new Set();
  }

  applyTextures(object, map, normalMap) {
    if (object instanceof Object3D) {
      object.traverse((mesh) => {
        if (mesh.material) {
          map && (mesh.material.map = map);
          normalMap && (mesh.material.normalMap = normalMap);
        }
      });
    }

    if (object instanceof Mesh) {
      map && (object.material.map = map);
      normalMap && (object.material.normalMap = normalMap);
    }
  }

  setupFurniture(object) {
    // if (object.name === 'Chair1_S') {
    //   this.applyTextures(
    //     object,
    //     this.textures.getTexture('studio_chair1_basecolor')
    //   );
    // }

    if (['Chair_S', 'Chair_1B', 'Chair_2B'].includes(object.name)) {
      this.applyTextures(object, this.textures.getTexture('Albedo_Chair_512'));
    }

    if (
      ['Const_Bath_S', 'Const_Bath_1B', 'Const_Bath_2B'].includes(object.name)
    ) {
      this.applyTextures(object, this.textures.getTexture('Albedo_Bath_512'));
    }

    if (['Faucet_S'].includes(object.name)) {
      this.applyTextures(object, this.textures.getTexture('Albedo_Faucet_512'));
    }

    if (['Lampe', 'Lampe_2B'].includes(object.name)) {
      this.applyTextures(object, this.textures.getTexture('Albedo_Lamp_512'));
    }

    if (['WoodFurniture_2BA'].includes(object.name)) {
      this.applyTextures(object, this.textures.getTexture('Wood_2BA'));
    }

    if (['Technique_2BA_1'].includes(object.name)) {
      this.applyTextures(object, this.textures.getTexture('Technique_2BA'));
    }
  }

  setupMaterials(mesh, modelName) {
    !this.glassClearMaterial &&
      (this.glassClearMaterial = new MeshPhysicalMaterial({
        transmission: 0.6,
        color: new Color(0x878787).convertLinearToSRGB(),
        depthWrite: false,
        metalnessMap: this.textures.getTexture('glass_orm'),
        roughnessMap: this.textures.getTexture('glass_orm'),
        name: 'Glass Clear',
        roughness: 0,
        side: DoubleSide,
      }));

    !this.exteriorMaterial &&
      (this.exteriorMaterial = new MeshPhysicalMaterial({
        color: new Color(
          params.models.samara.complectationVars.Color.variants[0].hex
        ),
        roughness: params.materials.metal.roughness,
        metalness: params.materials.metal.metalness,
        aoMapIntensity: params.aoMap.exterior.intensity,
      }));

    !this.exteriorWoodMaterial &&
      (this.exteriorWoodMaterial = new MeshPhysicalMaterial({
        color: new Color(
          params.models.samara.complectationVars.Color.variants[0].hex
        ),
        roughness: params.materials.wood.roughness,
        metalness: params.materials.wood.metalness,
        aoMapIntensity: params.aoMap.exterior.intensity,
      }));

    !this.roofMaterial &&
      (this.roofMaterial = new MeshPhysicalMaterial({
        color: new Color(
          params.models.samara.complectationVars.Roof.variants[0].hex
        ),
        roughness: 0.7,
        metalness: 0.2,
        aoMapIntensity: params.aoMap.roof.intensity,
      }));

    !this.shadowMaterial &&
      (this.shadowMaterial = new MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: params.shadowMesh.opacity,
        side: DoubleSide,
        depthWrite: false,
      }));

    if (mesh.name.includes('Spigot')) {
      mesh.material.color = new Color(0xc79d5d).convertLinearToSRGB();
      mesh.material.roughness = 0;
      mesh.material.metalness = 1;
    }

    if (mesh.name === 'Sanr_2BA') {
      mesh.visible = false;
    }

    if (mesh.material) {
      const name = mesh.material.name;
      const color = mesh.material.color;

      this.studioMaterials = {
        WoodCh_S_studio: {
          map: 'Studio_Chair1_BaseColor',
          lightMap: 'Studio_Chair1_Lightmap',
          aoMap: 'Studio_Chair1_Lightmap',
        },
        Chair_studio: {
          map: 'Studio_Chair_BaseColor',
          lightMap: 'Studio_Chair_Lightmap',
          aoMap: 'Studio_Chair_Lightmap',
        },
        Floor_S_studio: {
          map: 'Studio_Floor_BaseColor',
          lightMap: 'Studio_Floor_Lightmap',
          aoMap: 'Studio_Floor_Lightmap',
        },
        Wood_S_studio: {
          map: 'Studio_Wood_BaseColor',
          lightMap: 'Studio_Wood_Lightmap',
          aoMap: 'Studio_Wood_Lightmap',
        },
        Wall_studio: {
          map: null,
          lightMap: 'Studio_Wall_Lightmap',
          aoMap: 'Studio_Wall_Lightmap',
        },
        Shelves_studio: {
          color: new Color(0xffffff),
          lightMap: 'Studio_Shelves_Lightmap',
          aoMap: 'Studio_Shelves_Lightmap',
        },
        Oven_1B_studio: {
          map: 'Studio_Oven_BaseColor',
          lightMap: 'Studio_Oven_Lightmap',
          aoMap: 'Studio_Oven_Lightmap',
        },
        Chrome_studio: {
          map: 'Studio_Chrome_Basecolor',
          lightMap: 'Studio_Chrome_Lightmap',
        },
        Fabric_S_studio: {
          map: 'Studio_Bed_Basecolor',
          lightMap: 'Studio_Bed_Lightmap',
          aoMap: 'Studio_Bed_Lightmap',
        },
      };

      if (this.studioMaterials[name]) {
        mesh.material = new MeshLambertMaterial({
          name: name,
          color: new Color(0xffffff),
        });

        const materialConfig = this.studioMaterials[name];

        Object.entries(materialConfig).forEach(([key, value]) => {
          if (key === 'color') {
            mesh.material[key] = value;
          } else if (value !== null) {
            mesh.material[key] = this.textures.getTexture(value);
            if (key === 'lightMap' || key === 'aoMap') {
              mesh.material[key].channel = 1;
            }
          }
        });
        mesh.material.lightMapIntensity = params.maps.lightMap.intensity;
        mesh.material.aoMapIntensity = params.maps.aoMap.intensity;
      } else {
        // Apply envMap only to materials not in studioMaterials
        mesh.material.envMap = this.textures.getHdrTexture('hdr-2');
        mesh.material.envMapIntensity = params.envMap.intensity;
      }

      if (
        [
          'Glass_Bath_S',
          'Glass_Bath_1B',
          'Glass_Bath_2B',
          'Materials_NB_2BA_1',
        ].includes(mesh.name)
      ) {
        mesh.material = this.glassClearMaterial.clone();
        mesh.material.name = `Glass Bath_${modelName}`;
      }

      if (
        [
          'Color_Red_studio',
          'Color_Red_onebed',
          'Color_Red_twobed',
          'Color_Red_XL 8',
        ].includes(mesh.material.name)
      ) {
        mesh.material.color = new Color(0xef1a0b).convertLinearToSRGB();
        mesh.material.roughness = 0.3;
      }

      if (
        ['glassDoor_onebed', 'glassDoor_studio', 'glassDoor_twobed'].includes(
          mesh.material.name
        )
      ) {
        mesh.material = this.glassClearMaterial.clone();
        mesh.material.name = `Glass Door_${modelName}`;
        mesh.material.transmission = 0.2;
      }

      if (
        [
          'glassClear_onebed',
          'glassClear_studio',
          'glassClear_twobed',
          'glassClear_XL 8',
          'glassClear_XL 10',
          'glassDoor_XL 8',
          'glassDoor_XL 10',
        ].includes(mesh.material.name)
      ) {
        mesh.material = this.glassClearMaterial.clone();
        mesh.material.name = `Glass Clear_${modelName}`;
      }

      if (
        ['Air_onebed', 'Air_studio', 'Air_twobed', 'Air_XL 8'].includes(
          mesh.material.name
        )
      ) {
        mesh.material.map = this.textures.getTexture('Air_purification');
        mesh.material.aoMap = this.textures.getTexture('ao_air_ex');
        mesh.material.aoMapIntensity = params.aoMap.air.intensity;
      }

      if (mesh.material.name === 'Color_Exterior_Wood_onebed') {
        mesh.material = this.exteriorWoodMaterial.clone();
        mesh.material.name = 'Base Color Wood Material_onebed';
        mesh.material.aoMap = this.textures.getTexture(
          'exterior_ao_wood_onebed'
        );
      }

      if (mesh.material.name === 'Color_Exterior_Wood_twobed') {
        mesh.material = this.exteriorWoodMaterial.clone();
        mesh.material.name = 'Base Color Wood Material_twobed';
        mesh.material.aoMap = this.textures.getTexture(
          'exterior_ao_wood_twobed'
        );
      }

      if (mesh.material.name === 'Color_Exterior_Wood_XL 8') {
        mesh.material = this.exteriorWoodMaterial.clone();
        mesh.material.name = 'Base Color Wood Material_XL 8';
      }

      if (mesh.material.name === 'Color_Exterior_Wood_studio') {
        mesh.material = this.exteriorWoodMaterial.clone();
        mesh.material.name = 'Base Color Wood Material_studio';
        mesh.material.aoMap = this.textures.getTexture(
          'exterior_ao_wood_studio'
        );
      }

      if (mesh.material.name === 'Color_Exterior_onebed') {
        mesh.material = this.exteriorMaterial.clone();
        mesh.material.name = 'Base Color Material_onebed';
        mesh.material.aoMap = this.textures.getTexture('exterior_ao_onebed');
      }

      if (mesh.material.name === 'Color_Exterior_twobed') {
        mesh.material = this.exteriorMaterial.clone();
        mesh.material.name = 'Base Color Material_twobed';
        mesh.material.aoMap = this.textures.getTexture('exterior_ao_twobed');
      }

      if (mesh.material.name === 'Color_Exterior_XL 8') {
        mesh.material = this.exteriorMaterial.clone();
        mesh.material.name = 'Base Color Material_XL 8';
      }

      if (mesh.material.name === 'Color_Exterior_studio') {
        mesh.material = this.exteriorMaterial.clone();
        mesh.material.name = 'Base Color Material_studio';
        mesh.material.aoMap = this.textures.getTexture('exterior_ao_studio');
      }

      if (
        [
          'Solar_Panel_onebed',
          'Solar_Panel_studio',
          'Solar_Panel_twobed',
          'Solar_Panel_XL 8',
        ].includes(mesh.material.name)
      ) {
        mesh.material.map = this.textures.getTexture('Solar_Panel');
        mesh.material.metalnessMap = this.textures.getTexture(
          'Solar_Panel_metalness'
        );
      }

      if (
        ['Cedar_onebed', 'Cedar_studio', 'Cedar_twobed', 'Cedar_XL 8'].includes(
          mesh.material.name
        )
      ) {
        mesh.material.color = new Color(0xffffff);
        mesh.material.roughness = 0.7;
        mesh.material.aoMap = this.textures.getTexture('cedar_ao_new');
        mesh.material.aoMapIntensity = params.aoMap.desk.intensity;
        mesh.material.map = this.textures.getTexture(
          'Oak_Wood_Varnished_Albedo_2Kt'
        );
      }

      if (
        [
          'Color_ExteriorSupp_onebed',
          'Color_ExteriorSupp_studio',
          'Color_ExteriorSupp_twobed',
          'Color_ExteriorSupp_XL 8',
        ].includes(mesh.material.name)
      ) {
        const name = mesh.material.name;
        mesh.material = this.exteriorMaterial.clone();
        mesh.material.name = name;

        mesh.material.aoMap = this.textures.getTexture('patio_supp_ao');
        mesh.material.aoMapIntensity = params.aoMap.patio.intensity;
      }

      if (mesh.material.name === 'Color_Roof_onebed') {
        mesh.material = this.roofMaterial.clone();
        mesh.material.name = 'Roof Material_onebed';
      }

      if (mesh.material.name === 'Color_Roof_studio') {
        mesh.material = this.roofMaterial.clone();
        mesh.material.name = 'Roof Material_studio';
      }

      if (mesh.material.name === 'Color_Roof_twobed') {
        mesh.material = this.roofMaterial.clone();
        mesh.material.name = 'Roof Material_twobed';
      }

      if (mesh.material.name === 'Color_Roof_XL 8') {
        mesh.material = this.roofMaterial.clone();
        mesh.material.name = 'Roof Material_XL 8';
      }

      // Fix materials dublicates and stores them in a Map for later use.
      if (!this.allMaterials.has(mesh.material.name)) {
        this.allMaterials.set(mesh.material.name, mesh.material);
      }
      mesh.material = this.allMaterials.get(mesh.material.name);

      // fix for https://github.com/mrdoob/three.js/issues/27108
      if (
        mesh.material.transmission &&
        !this.transmissiveMaterials.has(mesh.material.name)
      ) {
        const {
          ior,
          transmission,
          color,
          thickness,
          clearcoat,
          clearcoatRoughness,
          roughness,
          name,
        } = mesh.material;

        mesh.material = new MeshTransmissionMaterial(10);
        Object.assign(mesh.material, {
          // clearcoat,
          // clearcoatRoughness,
          transmission,
          roughness,
          thickness,
          ior,
          color,
          name,
          // anisotrophicBlur: 0.5,
          // clearcoat: 1,
        });

        this.transmissiveMaterials.add(mesh.material);
      }
    }
  }
}
