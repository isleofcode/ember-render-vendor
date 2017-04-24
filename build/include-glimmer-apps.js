const fs = require('fs');
const path = require('path');

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

const compileGlimmerApp = require('./compile-glimmer-app');
const makeGlimmerProject = require('./make-glimmer-project');

const getSubdirs = require('../lib/utils/get-subdirs');

module.exports = function includeGlimmerApps({ baseRenderersPath, env, ui }) {
  let baseGlimmerPath = path.join(__dirname, '..', 'lib', 'glimmer');
  let innerComponentPath = path.join(
    'ui',
    'components',
    'render-vendor',
    'component.ts'
  );

  let componentSrcLines = fs.readFileSync(
    path.join(baseGlimmerPath, 'src', innerComponentPath),
    { encoding: 'utf8' }
  )
    .split('\n');

  let baseSrcFunnel = new Funnel(path.join(baseGlimmerPath, 'src'));
  let basePublicFunnel = mergeTrees([
    new Funnel(path.join(baseGlimmerPath, 'public')),
    new Funnel(path.join(baseRenderersPath, '-public'))
  ]);

  let glimmerProject = makeGlimmerProject({
    root: path.join(__dirname, '..'),
    env,
    ui
  });

  return getSubdirs(baseRenderersPath, { excludePrefix: '-' })
    .map((dir) => compileGlimmerApp({
      dir,
      project: glimmerProject,
      glimmerProject,
      baseSrcFunnel,
      basePublicFunnel,
      componentSrcLines,
      componentPath: innerComponentPath
    }));
};
