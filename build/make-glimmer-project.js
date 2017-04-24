const path = require('path');

// todo: what can i get rid of (if anything?)
module.exports = function makeGlimmerProject({ env, root, ui }) {
  return {
    env,
    root,
    ui,

    addons: [],
    pkg: {
      name: 'ember-render-vendor'
    },

    name() {
      return 'ember-render-vendor';
    },

    config() {
      return {};
    },

    configPath() {
      return path.join(root, 'lib', 'glimmer', 'config');
    },

    findAddonByName() {
      return null;
    },

    initializeAddons() {
      return null;
    },

    dependencies() {
      return null;
    }
  }
}
