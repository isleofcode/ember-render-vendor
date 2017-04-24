const fs = require('fs-extra');
const path = require('path');
const { denodeify } = require('rsvp');

const Blueprint = require('ember-cli/lib/models/blueprint');

module.exports = class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Install ember-render-vendor in the project.';
  }

  afterInstall(options) {
    const ensureFile = denodeify(fs.ensureFile);

    let rootDir = options.project.root;
    let gitkeep = path.join(rootDir, 'renderers', '-public', '.gitkeep');

    return ensureFile(gitkeep);
  }
}
