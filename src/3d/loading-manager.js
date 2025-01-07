import { LoadingManager } from 'three';
import { appState } from '../services/app-state';
import { params } from './settings';

const loadingManager = new LoadingManager();

loadingManager.onStart = function (item, loaded, total) {};

loadingManager.onProgress = function (item, loaded, total) {
  if (!params.loadOnDemand.loadingManager.enabled) return;
  const model = params.models.samara.assetsArray.find(
    (model) => model.name === appState.complectation.value.layout
  );

  const percent = Math.min(
    ((loaded / model.totalAssetsCount) * 100).toFixed(),
    100
  );

  console.log(percent);

  appState.loading.next({ isLoading: true, percent: Number(percent) });
};

loadingManager.onLoad = function (item, loaded, total) {};

loadingManager.onError = function (err) {
  // console.error('Error.', err)
  appState.errors.next({
    isError: true,
    message: `Error ${err}`,
  });
};

export { loadingManager };
