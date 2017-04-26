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

  _data: null,
  data: computed('_data', {
    get(key) {
      return this._makeData(this.get('_data'));
    },

    set(key, value) {
      this.set('_data', value);
      return this._makeData(value);
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

  _emit: observer('data.serialized', function() {
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
      data: this.get('data.serialized')
    });
  },

  _makeData(data) {
    let obj = {};

    if (isBlank(data)) {
      return;
    }

    this.attrs.forEach((attr) => {
      if (typeof attr !== 'object') {
        obj[attr] = computed(`_data.${attr}`, function() {
          return get(data, attr);
        });
      } else {
        let dataKey = attr.from || Object.keys(attr)
          .reject((key) => ['to', 'from', 'transform'].some((k) => k === key))
          [0];
        let serializedKey = attr.to || attr[dataKey];

        obj[serializedKey] = computed(`_data.${dataKey}`, function() {
          let value = get(data, dataKey);

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
      .create({ _data: data });
  }
});
