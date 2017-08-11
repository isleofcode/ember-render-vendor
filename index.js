/* jshint node: true */
'use strict';

const path = require('path');

const mergeTrees = require('broccoli-merge-trees');

const includeEmberElectronDir = require('./build/include-ember-electron-dir');
const includeGlimmerApps = require('./build/include-glimmer-apps');
const includeRendererInterfaces =
  require('./build/include-renderer-interfaces');

module.exports = {
  name: 'ember-render-vendor',
  _env: undefined,

  included(parent) {
    this._env = parent.env;

    while (this._env === undefined && parent !== undefined) {
      parent = parent.parent;
      this._env = parent.env;
    }
  },

  treeForApp(tree) {
    let renderers = includeRendererInterfaces(this.project.root);

    return tree === undefined ?
      renderers :
      mergeTrees([renderers, tree]);
  },

  postprocessTree(type, tree) {
    let isAll = type === 'all';
    let isEmberElectron = process.env.EMBER_CLI_ELECTRON;
    let isTest = this._env === 'test';

    if (!isTest && isEmberElectron && isAll) {
      let emberElectronTree = includeEmberElectronDir();
      let glimmerAppTrees = includeGlimmerApps({
        baseRenderersPath: path.join(this.project.root, 'renderers'),
        env: this.project.env,
        ui: this.ui
      });

      return mergeTrees([emberElectronTree, ...glimmerAppTrees, tree]);
    }

    return tree;
  }
};
