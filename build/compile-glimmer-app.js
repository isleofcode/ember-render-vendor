const path = require('path');

const { GlimmerApp } = require('@glimmer/application-pipeline');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');

module.exports = function compileGlimmerApp({
  dir,
  project,
  baseSrcFunnel,
  basePublicFunnel,
  componentSrcLines,
  componentPath,
}) {
  let name = path.basename(dir);
  let glimmerApp = new GlimmerApp({ project }, {
    trees: {
      src: makeGlimmerSrcTree({
        dir,
        name,
        baseSrcFunnel,
        componentPath,
        componentSrcLines
      })
    }
  });

  return new Funnel(flattenGlimmerNode({ dir, glimmerApp, basePublicFunnel }), {
    destDir: path.join('renderers', name)
  });
}

function makeGlimmerSrcTree({
  dir,
  name,
  baseSrcFunnel,
  componentPath,
  componentSrcLines,
}) {
  return mergeTrees([
    baseSrcFunnel,
    writeFile(componentPath, writeNameToComponentSrc(componentSrcLines, name)),
    new Funnel(dir, {
      files: ['template.hbs'],
      destDir: path.dirname(componentPath)
    })
  ], {
    overwrite: true
  });
};

function writeNameToComponentSrc(srcLines, name) {
  return srcLines.map((line) => {
    return line.startsWith('const RENDERER_NAME = ') ?
      `const RENDERER_NAME = '${name}'` :
      line;
  })
    .join('\n');
}

function flattenGlimmerNode({ dir, glimmerApp, basePublicFunnel }) {
  return mergeTrees([
    glimmerApp.toTree(),
    basePublicFunnel,
    new Funnel(dir, {
      srcDir: 'public',
      allowEmpty: true
    })
  ], {
    overwrite: true
  });
}
