const path = require('path');

const RenderVendor = require('render-vendor').default;
const WebSocket = require('ws');

const getSubdirs = require('ember-render-vendor/lib/utils/get-subdirs');

function cleanup() {
  let socket = global['ember-render-vendor'] &&
    global['ember-render-vendor'].socket;

  if (socket instanceof WebSocket.Server) {
    socket.close();
  }

  RenderVendor.shutdown();
}

module.exports = function initialize(app) {
  let renderers = {};
  let socket = new WebSocket.Server({
    perMessageDeflate: false,
    port: 8080
  });

  getSubdirs(path.join(__dirname, '..', '..', 'renderers'))
    .forEach((dir) => {
      let name = path.basename(dir);
      let url = path.join(dir, 'index.html');

      // todo: support passing other opts, e.g. zoomFactor / viewportSize?
      renderers[name] = RenderVendor.create({ url });
    });

  global['ember-render-vendor'] = {
    renderers,
    socket
  }

  app.on('quit', cleanup);
  process.on('uncaughtException', cleanup);
}
