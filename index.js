/* jshint node: true */
'use strict';

const path = require('path');

const mergeTrees = require('broccoli-merge-trees');

const mergeRenderers = require('./build/merge-renderers');
const includeEmberElectronDir = require('./build/include-ember-electron-dir');
const includeGlimmerApps = require('./build/include-glimmer-apps');

module.exports = {
  name: 'ember-render-vendor',

  treeForApp(tree) {
    return mergeRenderers({
      rootDir: path.join(this.project.root, 'renderers'),
      inputTree: tree
    });
  },

  postprocessTree(type, tree) {
    if (!process.env.EMBER_CLI_ELECTRON || type !== 'all') {
      return tree;
    }

    return mergeTrees([
      includeEmberElectronDir(),
      ...includeGlimmerApps({
        baseRenderersPath: path.join(this.project.root, 'renderers'),
        env: this.project.env,
        ui: this.ui
      }),
      tree
    ]);
  }
};
