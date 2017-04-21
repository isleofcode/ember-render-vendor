import Ember from 'ember';

const {
  computed,
  getOwner
}= Ember;

export function rendererFor(name) {
  let factory = `renderer:${name}`;

  return computed(function() {
    let owner = getOwner(this);
    return owner.lookup(factory) || owner.lookup(`${factory}/renderer`);
  });
}

export default rendererFor;
