/*!
 * back-to-thunk - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var is = require('is-type-of');
var co = require('co');

/**
 * Expose `toThunk`
 */

module.exports = toThunk;

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api public
 */

function toThunk(obj, ctx) {
  if (Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  if (is.generatorFunction(obj)) {
    return co(obj.call(ctx));
  }

  if (is.generator(obj)) {
    return co(obj);
  }

  if (is.promise(obj)) {
    return promiseToThunk(obj);
  }

  if (is.function(obj)) {
    return obj;
  }

  if (is.object(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  return obj;
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}
