/**
 * @license simple-loop https://github.com/flams/simple-loop
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2015 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

function assert(assertion, error) {
    if (assertion) {
        throw new TypeError("simple-loop: " + error);
    }
}

/**
 * Small abstraction for looping over objects and arrays
 * Warning: it's not meant to be used with nodeList
 * To use with nodeList, convert to array first
 * @param {Array/Object} iterated the array or object to loop through
 * @param {Function} callback the function to execute for each iteration
 * @param {Object} scope the scope in which to execute the callback
 */
module.exports = function loop(iterated, callback, scope) {
    assert(typeof iterated != "object", "iterated must be an array/object");
    assert(typeof callback != "function", "callback must be a function");

    var i;

    if (Array.isArray(iterated)) {
        for (i = 0; i < iterated.length; i++) {
            callback.call(scope, iterated[i], i, iterated);
        }
    } else {
        for (i in iterated) {
            if (iterated.hasOwnProperty(i)) {
                callback.call(scope, iterated[i], i, iterated);
            }
        }
    }
};
