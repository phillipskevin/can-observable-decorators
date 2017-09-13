import observable from 'observable-decorators';
import canReflect from 'can-reflect';
import Observation from 'can-observation';
import canBatch from 'can-event/batch/batch';
import CID from 'can-cid';

const reflectiveValue = function(value) {
  const handlers = [];
  let latest = value;

  const fn = function(newValue) {
    if(arguments.length) {
      latest = newValue;
      handlers.forEach(function(handler) {
        canBatch.queue([handler, fn, [ latest ]]);
      }, this);
    } else {
      Observation.add(fn);
      return latest;
    }
  };

  CID(fn);

  canReflect.assignSymbols(fn, {
    'can.onValue': function(handler) {
      handlers.push(handler);
    },
    'can.offValue': function(handler) {
      const index = handlers.indexOf(handler);
      handlers.splice(index, 1);
    },
    'can.setValue': function(newValue) {
      return fn(newValue);
    },
    'can.getValue': function() {
      return fn();
    }
  });

  return fn;
};

const defineNonEnumerableOnce = (obj, key, value) => {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    Object.defineProperty(obj, key, {
      enumerable: false,
      value
    });
  }
};

const observableDecorator = (target, key, descriptor) => {
  defineNonEnumerableOnce(target, '_latest', {});
  defineNonEnumerableOnce(target, '_subscribeHandlers', {});
 
  if (typeof descriptor.initializer === 'function') {
    target._latest[key] = reflectiveValue( descriptor.initializer() );
  } else {
    target._latest[key] = reflectiveValue( null );
  }

  canReflect.assignSymbols(target, {
    'can.isMapLike': true,

    'can.getKeyValue'(key) {
      Observation.add(this, key);
      return canReflect.getValue( this._latest[key] );
    },

    'can.setKeyValue'(key, val) {
      canReflect.setValue( this._latest[key], val );
      this[key] = val;
    },

    'can.onKeyValue'(key, handler) {
      if (!target._subscribeHandlers[key]) {
        target._subscribeHandlers[key] = {
          subscription: null,
          handlers: []
        };

        target._subscribeHandlers[key].subscription = target[key].subscribe((val) => {
          canReflect.setValue( this._latest[key], val );

          canBatch.start();
          target._subscribeHandlers[key].handlers.forEach((handler) => {
            handler(val);
          });
          canBatch.stop();
        });
      }
      target._subscribeHandlers[key].handlers.push( handler );
    },

    'can.offKeyValue'(key, handler) {
      const handlers = target._subscribeHandlers[key].handlers;
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }

      if (handlers.length === 0) {
        target._subscribeHandlers[key].subscription.unsubscribe();
      }
    },
  });

  return observable(target, key, descriptor);
};

export default observableDecorator;
