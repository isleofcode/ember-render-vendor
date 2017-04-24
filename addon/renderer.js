import Ember from 'ember';

const {
  Object: EObject,
  RSVP: { resolve },
  isBlank,
  run
} = Ember;

const EmberRenderVendor = window.requireNode !== undefined ?
  window.requireNode('electron').remote.getGlobal('ember-render-vendor') :
  null;

export default EObject.extend({
  name: null, // n.b. set automatically w/ factory lookup
  attrs: undefined, // n.b. to be set upstream

  _currentModel: undefined,

  init() {
    if (isBlank(EmberRenderVendor)) {
      return;
    }

    EmberRenderVendor.socket
      .on('connection', (ws) => this._emit(ws));
  },

  trackModel(model) {
    let attrs;

    if (isBlank(EmberRenderVendor)) {
      return;
    }

    this.untrackModel(this._currentModel);
    this._currentModel = model;

    this.getWithDefault('attrs', [])
      .forEach((attr) => {
        model.addObserver(attr, this, '_didUpdateAttr');
      });

    this._emit();
  },

  untrackModel(model) {
    if (isBlank(EmberRenderVendor) || isBlank(model)) {
      return;
    }

    this.getWithDefault('attrs', [])
      .forEach((attr) => {
        model.removeObserver(attr, this, '_didUpdateAttr');
      });

    if (this._currentModel === model) {
      this._currentModel = null;
    }
  },

  render(opts = {}) {
    if (isBlank(EmberRenderVendor)) {
      return resolve();
    }

    return EmberRenderVendor.renderers[this.name]
      .render(opts);
  },

  _didUpdateAttr(sender, key, val, rev) {
    run.scheduleOnce('render', this, '_emit');
  },

  _emit(ws = null) {
    if (ws !== null) {
      ws.send(this._serialize());
    } else {
      Array.from(EmberRenderVendor.socket.clients)
        .filterBy('readyState', WebSocket.OPEN)
        .forEach((ws) => ws.send(this._serialize()));
    }
  },

  _serialize() {
    let attrs = this.get('attrs');
    let model = this.getWithDefault('_currentModel', {})
      .getProperties(...attrs);

    return JSON.stringify({
      renderer: this.name,
      model
    });
  }
});
