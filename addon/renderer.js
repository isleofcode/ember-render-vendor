import Ember from 'ember';

const {
  Object: EObject,
  RSVP: { resolve },
  computed,
  get,
  isBlank,
  isPresent,
  observer,
  run
} = Ember;

const EmberRenderVendor = window.requireNode !== undefined ?
  window.requireNode('electron').remote.getGlobal('ember-render-vendor') :
  null;

export default EObject.extend({
  name: null, // n.b. set automatically w/ factory lookup
  attrs: undefined, // n.b. to be set upstream

  _model: null,
  model: computed('_model', {
    get(key) {
      return this._makeModel(this.get('_model'));
    },

    set(key, value) {
      this.set('_model', value);
      return this._makeModel(value);
    }
  }),

  init() {
    if (isBlank(EmberRenderVendor)) {
      return;
    }

    EmberRenderVendor.socket
      .on('connection', (ws) => this._emit(ws));
  },

  render(opts = {}) {
    if (isBlank(EmberRenderVendor)) {
      return resolve();
    }

    return EmberRenderVendor.renderers[this.name]
      .render(opts);
  },

  _emit: observer('model.serialized', function() {
    run.scheduleOnce('render', this, 'emit');
  }),

  emit(ws = null) {
    if (ws !== null) {
      ws.send(this._serializePayload());
    } else {
      Array.from(EmberRenderVendor.socket.clients)
        .filterBy('readyState', WebSocket.OPEN)
        .forEach((ws) => ws.send(this._serializePayload()));
    }
  },

  _serializePayload() {
    return JSON.stringify({
      renderer: this.name,
      model: this.get('model.serialized')
    });
  },

  _makeModel(model) {
    let obj = {};

    if (isBlank(model)) {
      return;
    }

    this.attrs.forEach((attr) => {
      if (typeof attr !== 'object') {
        obj[attr] = computed(`_model.${attr}`, function() {
          return get(model, attr);
        });
      } else {
        let modelKey = attr.from || Object.keys(attr)
          .reject((key) => ['to', 'from', 'transform'].some((k) => k === key))
          [0];
        let serializedKey = attr.to || attr[modelKey];

        obj[serializedKey] = computed(`_model.${modelKey}`, function() {
          let value = get(model, modelKey);

          return attr.transform instanceof Function ?
            attr.transform(value) :
            value;
        });
      }
    });

    run.scheduleOnce('render', this, 'emit');

    return EObject.extend(obj, {
      serialized: computed(...Object.keys(obj), function() {
        return this.getProperties(...Object.keys(obj));
      })
    })
      .create({ _model: model });
  }
});
