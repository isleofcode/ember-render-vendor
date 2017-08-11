const path = require('path');

const { Renderer } = require('render-vendor');
const WebSocket = require('ws');

const getSubdirs = require('ember-render-vendor/lib/utils/get-subdirs');

function cleanup() {
  let { socket } = global['ember-render-vendor'];

  if (socket instanceof WebSocket.Server) {
    socket.close();
  }

  Renderer.destroy();
}

module.exports = function initialize(app) {
  let renderer = Renderer.renderer;
  let renderers = {};
  let socket = new WebSocket.Server({
    perMessageDeflate: false,
    port: 8080
  });

  renderer.boot()
    .then(() => {
      getSubdirs(path.join(__dirname, '..', '..', 'renderers'))
        .forEach((dir) => {
          let name = path.basename(dir);
          let url = `file://${path.join(dir, 'index.html')}`;

          renderer.load(name, { url })
            .catch((err) => {
              console.error(`could not load ${url}: ${err.toString()}`);
            });
        });
    });

  global['ember-render-vendor'] = { renderer, socket };

  app.on('quit', cleanup);
  process.on('uncaughtException', cleanup);
}
