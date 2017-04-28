const path = require('path');

const Funnel = require('broccoli-funnel');

module.exports = function includeRendererInterfaces(rootDir) {
  return new Funnel(path.join(rootDir, 'renderers'), {
    destDir: 'renderers',
    include: ['**/renderer.js'],
    exclude: ['-*/**'],
    getDestinationPath(relativePath) {
      return `${relativePath.slice(0, relativePath.lastIndexOf('/'))}.js`;
    }
  });
}
