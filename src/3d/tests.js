import { delayMs } from '../utils/delay';
import { params } from './settings';

export class Tests {
  constructor(engine) {
    this.engine = engine;
  }
  /**
   * Test for simulating context loss
   * @param {number} iterations - The number of iterations to perform
   */
  async testContextLoss(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      await delayMs(3000);
      this.engine.renderer.forceContextLoss();
      if (i === iterations - 1) {
        console.log('All iterations complete');
      }
    }
  }

  /**
   * Test for simulating engine destruction and reinitialization
   * @param {number} iterations - The number of iterations to perform
   */
  async testDestroy(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      await delayMs(3000);
      params.container.removeChild(this.engine.renderer.domElement);
      this.engine.destroy();
      await delayMs(3000);
      this.engine.init();
      if (i === iterations - 1) {
        console.log('All iterations complete');
      }
    }
  }

  /**
   * Test for simulating random complectation selection
   * @param {number} iterations - The number of iterations to perform
   */

  async testRandomComplectation(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      await delayMs(100);
      const complectationVars = params.models.samara.complectationVars;

      Object.keys(complectationVars).forEach((parent) => {
        const randomVariant =
          complectationVars[parent].variants[
            Math.floor(
              Math.random() * complectationVars[parent].variants.length
            )
          ];
        this.engine.options.setOption({
          [parent.toLowerCase()]: randomVariant.name,
        });
      });

      if (i === iterations - 1) {
        console.log('All iterations complete');
      }
    }
  }

  /**
   * Test for simulating layout changes
   * @param {number} iterations - The number of iterations to perform
   */

  async testLayoutChange(iterations = 1) {
    const delay = 100;
    for (let i = 0; i < iterations; i++) {
      await delayMs(delay);

      this.engine.options.setOption({
        layout: 'studio',
      });

      await delayMs(delay);

      this.engine.options.setOption({
        layout: 'onebed',
      });

      await delayMs(delay);

      this.engine.options.setOption({
        layout: 'twobed',
      });

      await delayMs(delay);

      this.engine.options.setOption({
        layout: 'XL 8',
      });

      if (i === iterations - 1) {
        console.log('All iterations complete');
      }
    }
  }
}
