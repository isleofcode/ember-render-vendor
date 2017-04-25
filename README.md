# ember-render-vendor

ember-render-vendor is an Ember+Electron addon that wraps
[RenderVendor](https://github.com/isleofcode/render-vendor)'s blazing-fast PDF
rendering services with opinionated build tooling for easy integration into
Ember apps.

## Installation

* `ember install ember-render-vendor --save`

_n.b. we use `--save` to install e-r-v as a dep, so it will be packaged with
your e-electron builds_

## Usage

This addon's default blueprint should generate a `renderers` dir at the root
of your app, with one subdir (`-public`).

Any files added to `-public` will be available for use in all renderer
templates.

Valid `renderers` subdirs do not start with a `-`, and contain two files:

* `template.hbs`, a handlebars file that defines your renderer's template (w/ dynamic data provided by `model`); and
* `renderer.js`, which is loaded into your Ember app and may be accessed with the `rendererFor` helper (use it like service injection)
    * > `import { rendererFor } from 'ember-render-vendor';`


#### Sample files
```handlebars
{{! renderers/invoice/template.hbs }}

<div id="container">
  <img id="logo" src="imgs/logo"/>

  <h1>hello {{model.customerName}}</h1>
  <h4>you owe {{model.total}}</h4>
</div>

<style>
  #logo {
    padding: 10px;
  }

  h1 {
    font-weight: bold;
  }
</style>
```

```javascript
// renderers/invoice/renderer.js

import Renderer from 'ember-render-vendor';

export default Renderer.extend({
  attrs: [
    { 'customer.name': 'customerName' },
    'total'
  ],

  render() {
    return this._super({
      paperOptions: {
        width: '2.25in',
        height: '1.25in'
      }
    });
  }
});
```

```javascript
// app/routes/invoice.js

import { rendererFor } from 'ember-render-vendor';

export Ember.Route.extend({
  renderer: rendererFor('invoice'),

  afterModel() {
    this.get('renderer').trackModel(model);
  },

  actions: {
    renderPdf() {
      this.get('renderer').render()
        .then((filepath) => console.log(`path to pdf: ${filepath}`));
    }
  }
});
```

```javascript
// ember-electron/main.js
// n.b. ideally this will move to an addon-friendly initializer + cleanup story upstream

// ...

let initializersDir = join(process.cwd(), 'ember-electron', 'initializers');
readdirSync(initializersDir)
  .map((name) => require(join(initializersDir, name)))
  .forEach((initializer) => initializer(app));

// ...
```

## Running

* `ember electron`
* `ember electron:package`

## ToDos

* write test suite
* chat with Fastboot team about server integration
* consider implementing e-electron build tooling upstream
