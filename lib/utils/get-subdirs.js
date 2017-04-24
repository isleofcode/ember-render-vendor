const fs = require('fs');
const path = require('path');

module.exports = function getSubdirs(dir, { excludePrefix } = {}) {
  return fs.readdirSync(dir)
    .filter((name) => {
      return typeof excludePrefix !== 'string' ||
        !name.startsWith(excludePrefix);
    })
    .map((name) => path.join(dir, name))
    .filter((path) => fs.statSync(path).isDirectory());
}
