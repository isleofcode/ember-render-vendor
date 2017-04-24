const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

module.exports = function mergeRenderers({ rootDir, inputTree } = {}) {
  return mergeTrees([
    new Funnel(rootDir, {
      destDir: 'renderers',
      include: ['**/renderer.js'],
      exclude: ['-*/**']
    }),
    inputTree
  ]);
}