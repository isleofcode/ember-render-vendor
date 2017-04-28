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

  treeForApp(tree) {
    let renderers = includeRendererInterfaces(this.project.root);

    return tree === undefined ?
      renderers :
      mergeTrees([renderers, tree]);
  },

  postprocessTree(type, tree) {
    return !process.env.EMBER_CLI_ELECTRON || type !== 'all' ?
      tree :
      mergeTrees([
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
