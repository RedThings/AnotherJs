﻿/*!
 * Object.observe polyfill
 * by Massimo Artizzu (MaxArt2501)
 * 
 * https://github.com/MaxArt2501/object-observe
 * 
 * Licensed under the MIT License
 * See LICENSE for details
 */

// Some type definitions
/**
 * This represents the data relative to an observed object
 * @typedef  {Object}                     ObjectData
 * @property {Map<Handler, HandlerData>}  handlers
 * @property {String[]}                   properties
 * @property {*[]}                        values
 * @property {Descriptor[]}               descriptors
 * @property {Notifier}                   notifier
 * @property {Boolean}                    frozen
 * @property {Boolean}                    extensible
 * @property {Object}                     proto
 */
/**
 * Function definition of a handler
 * @callback Handler
 * @param {ChangeRecord[]} changes
*/
/**
 * This represents the data relative to an observed object and one of its
 * handlers
 * @typedef  {Object}                     HandlerData
 * @property {String[]}                   acceptList
 * @property {ChangeRecord[]}             changeRecords
 */
/**
 * Type definition for a change. Any other property can be added using
 * the notify() or performChange() methods of the notifier.
 * @typedef  {Object}                     ChangeRecord
 * @property {String}                     type
 * @property {Object}                     object
 * @property {String}                     [name]
 * @property {*}                          [oldValue]
 * @property {Number}                     [index]
 */
/**
 * Type definition for a notifier (what Object.getNotifier returns)
 * @typedef  {Object}                     Notifier
 * @property {Function}                   notify
 * @property {Function}                   performChange
 */
/**
 * Function called with Notifier.performChange. It may optionally return a
 * ChangeRecord that gets automatically notified, but `type` and `object`
 * properties are overridden.
 * @callback Performer
 * @returns {ChangeRecord|undefined}
 */

Object.observe || (function (O, A, root) {
    "use strict";

    /**
     * Relates observed objects and their data
     * @type {Map<Object, ObjectData}
     */
    var observed,
        /**
         * List of handlers and their data
         * @type {Map<Handler, Map<Object, HandlerData>>}
         */
        handlers,

        defaultObjectAccepts = ["add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions"],
        defaultArrayAccepts = ["add", "update", "delete", "splice"];

    // Functions for internal usage

    /**
     * Checks if the argument is a Node object. Uses duck typing if Node is
     * not defined.
     * @function isNode
     * @param {?*} node
     * @returns {Boolean}
     */
    var isNode = root.Node ? function (node) {
        return node && node instanceof root.Node;
    } : function (node) {
        // Duck typing
        return node && typeof node === "object"
                && typeof node.nodeType === "number"
                && typeof node.nodeName === "string";
    },

        /**
         * Checks if the argument is an Array object. Polyfills Array.isArray.
         * @function isArray
         * @param {?*} object
         * @returns {Boolean}
         */
        isArray = A.isArray || (function (toString) {
            return function (object) { return toString.call(object) === "[object Array]"; };
        })(O.prototype.toString),

        /**
         * Checks is a property of an object is actually an accessor
         * @function isAccessor
         * @param {Object} object
         * @param {String} prop
         * @returns {Boolean}
         */
        isAccessor = O.defineProperties ? function (object, prop) {
            var desc = O.getOwnPropertyDescriptor(object, prop);
            return desc ? "get" in desc || "set" in desc : false;
        } : function () { return false; },

        /**
         * Returns the index of an item in a collection, or -1 if not found.
         * Uses Array.prototype.indexOf is available.
         * @function inArray
         * @param {*} pivot           Item to look for
         * @param {Array} array
         * @param {Number} [start=0]  Index to start from
         * @returns {Number}
         */
        inArray = A.prototype.indexOf ? function (pivot, array, start) {
            return array.indexOf(pivot, start);
        } : function (pivot, array, start) {
            for (var i = start || 0; i < array.length; i++)
                if (array[i] === pivot)
                    return i;
            return -1;
        },

        /**
         * Returns an instance of Map, or a Map-like object is Map is not
         * supported or doesn't support forEach()
         * @function createMap
         * @returns {Map}
         */
        createMap = typeof root.Map === "undefined" || !Map.prototype.forEach ? function () {
            // Lightweight shim of Map. Lacks clear(), entries(), keys() and
            // values() (the last 3 not supported by IE11, so can't use them),
            // it doesn't handle the constructor's argument (like IE11) and of
            // course it doesn't support for...of.
            // Chrome 31-35 and Firefox 13-24 have a basic support of Map, but
            // they lack forEach(), so their native implementation is bad for
            // this polyfill. (Chrome 36+ supports Object.observe.)
            var keys = [], values = [];

            return {
                size: 0,
                has: function (key) { return inArray(key, keys) > -1; },
                get: function (key) { return values[inArray(key, keys)]; },
                set: function (key, value) {
                    var i = inArray(key, keys);
                    if (i === -1) {
                        keys.push(key);
                        values.push(value);
                        this.size++;
                    } else values[i] = value;
                },
                "delete": function (key) {
                    var i = inArray(key, keys);
                    if (i > -1) {
                        keys.splice(i, 1);
                        values.splice(i, 1);
                        this.size--;
                    }
                },
                forEach: function (callback/*, thisObj*/) {
                    for (var i = 0; i < keys.length; i++)
                        callback.call(arguments[1], values[i], keys[i], this);
                }
            };
        } : function () { return new Map(); },

        /**
         * Simple shim for Object.keys is not available
         * Misses checks on object, don't use as a replacement of Object.keys
         * @function getKeys
         * @param {Object} object
         * @returns {String[]}
         */
        getKeys = O.keys || function (object) {
            var keys = [], prop;
            for (prop in object)
                if (object.hasOwnProperty(prop))
                    keys.push(prop);
            return keys;
        },

        /**
         * Return the prototype of the object... if defined.
         * @function getPrototype
         * @param {Object} object
         * @returns {Object}
         */
        getPrototype = O.getPrototypeOf || null,

        /**
         * Return the descriptor of the object... if defined.
         * IE8 supports a (useless) Object.getOwnPropertyDescriptor for DOM
         * nodes only, so defineProperties is checked instead.
         * @function getDescriptor
         * @param {Object} object
         * @param {String} property
         * @returns {Descriptor}
         */
        getDescriptor = O.defineProperties ? O.getOwnPropertyDescriptor : null,

        /**
         * Polyfill for Object.is if not available
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
         * @function areSame
         * @param {*} x
         * @param {*} y
         * @returns {Boolean}
         */
        areSame = O.is || function (x, y) {
            if (x === y)
                return x !== 0 || 1 / x === 1 / y;
            return x !== x && y !== y;
        },

        /**
         * Sets up the observation of an object
         * @function doObserve
         * @param {Object} object
         * @param {Handler} handler
         * @param {String[]} [acceptList]
         */
        doObserve = function (object, handler, acceptList) {

            var data = observed.get(object);

            if (data)
                data.handlers.set(handler,
                    setHandler(handler, object, acceptList));
            else {
                observed.set(object, data = {
                    handlers: createMap(),
                    frozen: O.isFrozen ? O.isFrozen(object) : false,
                    extensible: O.isExtensible ? O.isExtensible(object) : true,
                    proto: getPrototype && getPrototype(object),
                    properties: isNode(object) ? [] : getKeys(object)
                });
                data.handlers.set(handler,
                    setHandler(handler, object, acceptList));
                retrieveNotifier(object, data);
                updateValues(object, data);

                // Let the observation begin!
                setTimeout(function worker() {
                    // If this happens, the object has been unobserved
                    if (!observed.has(object)) return;

                    performPropertyChecks(object, data);
                    broadcastChangeRecords(data);

                    setTimeout(worker, 17);
                }, 17);
            }
        },

        /**
         * Updates the stored values of the properties of an observed object
         * @function updateValues
         * @param {Object} object
         * @param {ObjectData} data
         */
        updateValues = function (object, data) {
            var props = data.properties,
                values = data.values = [],
                i = 0, descs;
            if (getDescriptor) {
                descs = data.descriptors = [];
                while (i < props.length) {
                    descs[i] = getDescriptor(object, props[i]);
                    values[i] = object[props[i++]];
                }
            } else while (i < props.length)
                values[i] = object[props[i++]];
        },

        /**
         * Performs basic property value change checks on an observed object
         * @function performPropertyChecks
         * @param {Object} object
         * @param {ObjectData} data
         * @param {String} [except]  Doesn't deliver the changes to the
         *                           handlers that accept this type
         */
        performPropertyChecks = (function () {
            var updateCheck = getDescriptor ? function (object, data, idx, except, descr) {
                var key = data.properties[idx],
                    value = object[key],
                    ovalue = data.values[idx],
                    odesc = data.descriptors[idx];

                if ("value" in descr && (ovalue === value
                        ? ovalue === 0 && 1 / ovalue !== 1 / value
                        : ovalue === ovalue || value === value)) {
                    addChangeRecord(data, {
                        name: key,
                        type: "update",
                        object: object,
                        oldValue: ovalue
                    }, except);
                    data.values[idx] = value;
                }
                if (odesc.configurable && (!descr.configurable
                        || descr.writable !== odesc.writable
                        || descr.enumerable !== odesc.enumerable
                        || descr.get !== odesc.get
                        || descr.set !== odesc.set)) {
                    addChangeRecord(data, {
                        name: key,
                        type: "reconfigure",
                        object: object,
                        oldValue: ovalue
                    }, except);
                    data.descriptors[idx] = descr;
                }
            } : function (object, data, idx, except) {
                var key = data.properties[idx],
                    value = object[key],
                    ovalue = data.values[idx];

                if (ovalue === value ? ovalue === 0 && 1 / ovalue !== 1 / value
                        : ovalue === ovalue || value === value) {
                    addChangeRecord(data, {
                        name: key,
                        type: "update",
                        object: object,
                        oldValue: ovalue
                    }, except);
                    data.values[idx] = value;
                }
            };

            // Checks if some property has been deleted
            var deletionCheck = getDescriptor ? function (object, props, proplen, data, except) {
                var i = props.length, descr;
                while (proplen && i--) {
                    if (props[i] !== null) {
                        descr = getDescriptor(object, props[i]);
                        proplen--;

                        // If there's no descriptor, the property has really
                        // been deleted; otherwise, it's been reconfigured so
                        // that's not enumerable anymore
                        if (descr) updateCheck(object, data, i, except, descr);
                        else {
                            addChangeRecord(data, {
                                name: props[i],
                                type: "delete",
                                object: object,
                                oldValue: data.values[i]
                            }, except);
                            data.properties.splice(i, 1);
                            data.values.splice(i, 1);
                            data.descriptors.splice(i, 1);
                        }
                    }
                }
            } : function (object, props, proplen, data, except) {
                var i = props.length;
                while (proplen && i--)
                    if (props[i] !== null) {
                        addChangeRecord(data, {
                            name: props[i],
                            type: "delete",
                            object: object,
                            oldValue: data.values[i]
                        }, except);
                        data.properties.splice(i, 1);
                        data.values.splice(i, 1);
                        proplen--;
                    }
            };

            return function (object, data, except) {
                if (!data.handlers.size || data.frozen) return;

                var props, proplen, keys,
                    values = data.values,
                    descs = data.descriptors,
                    i = 0, idx,
                    key, value,
                    proto, descr;

                // If the object isn't extensible, we don't need to check for new
                // or deleted properties
                if (data.extensible) {

                    props = data.properties.slice();
                    proplen = props.length;
                    keys = getKeys(object);

                    if (descs) {
                        while (i < keys.length) {
                            key = keys[i++];
                            idx = inArray(key, props);
                            descr = getDescriptor(object, key);

                            if (idx === -1) {
                                addChangeRecord(data, {
                                    name: key,
                                    type: "add",
                                    object: object
                                }, except);
                                data.properties.push(key);
                                values.push(object[key]);
                                descs.push(descr);
                            } else {
                                props[idx] = null;
                                proplen--;
                                updateCheck(object, data, idx, except, descr);
                            }
                        }
                        deletionCheck(object, props, proplen, data, except);

                        if (!O.isExtensible(object)) {
                            data.extensible = false;
                            addChangeRecord(data, {
                                type: "preventExtensions",
                                object: object
                            }, except);

                            data.frozen = O.isFrozen(object);
                        }
                    } else {
                        while (i < keys.length) {
                            key = keys[i++];
                            idx = inArray(key, props);
                            value = object[key];

                            if (idx === -1) {
                                addChangeRecord(data, {
                                    name: key,
                                    type: "add",
                                    object: object
                                }, except);
                                data.properties.push(key);
                                values.push(value);
                            } else {
                                props[idx] = null;
                                proplen--;
                                updateCheck(object, data, idx, except);
                            }
                        }
                        deletionCheck(object, props, proplen, data, except);
                    }

                } else if (!data.frozen) {

                    // If the object is not extensible, but not frozen, we just have
                    // to check for value changes
                    for (; i < props.length; i++) {
                        key = props[i];
                        updateCheck(object, data, i, except, getDescriptor(object, key));
                    }

                    if (O.isFrozen(object))
                        data.frozen = true;
                }

                if (getPrototype) {
                    proto = getPrototype(object);
                    if (proto !== data.proto) {
                        addChangeRecord(data, {
                            type: "setPrototype",
                            name: "__proto__",
                            oldValue: data.proto
                        });
                        data.proto = proto;
                    }
                }
            };
        })(),

        /**
         * Calls the handlers with their relative change records
         * @function broadcastChangeRecords
         * @param {ObjectData} data
         */
        broadcastChangeRecords = function (data) {
            data.handlers.forEach(function (hdata, handler) {
                if (hdata.changeRecords.length) {
                    handler(hdata.changeRecords);
                    hdata.changeRecords = [];
                }
            });
        },

        /**
         * Returns the notifier for an object - whether it's observed or not
         * @param {Object} object
         * @param {ObjectData} [data]
         * @returns {Notifier}
         */
        retrieveNotifier = function (object, data) {
            if (!data)
                data = observed.get(object);
            var notifier = data && data.notifier;

            if (notifier) return notifier;

            /** @type {Notifier} */
            notifier = {
                /**
                 * @method notify
                 * @see http://arv.github.io/ecmascript-object-observe/#notifierprototype._notify
                 * @memberof Notifier
                 * @param {ChangeRecord} changeRecord
                 */
                notify: function (changeRecord) {
                    changeRecord.type; // Just to check the property is there...

                    // If there's no data, the object has been unobserved
                    var data = observed.get(object);
                    if (data) {
                        var recordCopy = { object: object }, prop;
                        for (prop in changeRecord)
                            if (prop !== "object")
                                recordCopy[prop] = changeRecord[prop];
                        addChangeRecord(data, recordCopy);
                    }
                },

                /**
                 * @method performChange
                 * @see http://arv.github.io/ecmascript-object-observe/#notifierprototype_.performchange
                 * @memberof Notifier
                 * @param {String} changeType
                 * @param {Performer} func     The task performer
                 * @param {*} [thisObj]        Used to set `this` when calling func
                 */
                performChange: function (changeType, func/*, thisObj*/) {
                    if (typeof changeType !== "string")
                        throw new TypeError("Invalid non-string changeType");

                    if (typeof func !== "function")
                        throw new TypeError("Cannot perform non-function");

                    // If there's no data, the object has been unobserved
                    var data = observed.get(object),
                        prop, changeRecord,
                        result = func.call(arguments[2]);

                    data && performPropertyChecks(object, data, changeType);

                    // If there's no data, the object has been unobserved
                    if (data && result && typeof result === "object") {
                        changeRecord = { object: object, type: changeType };
                        for (prop in result)
                            if (prop !== "object" && prop !== "type")
                                changeRecord[prop] = result[prop];
                        addChangeRecord(data, changeRecord);
                    }
                }
            };
            if (data) data.notifier = notifier;

            return notifier;
        },

        /**
         * Register (or redefines) an handler in the collection for a given
         * object and a given type accept list.
         * @function setHandler
         * @param {Handler} handler
         * @param {Object} object
         * @param {String[]} acceptList
         * @returns {HandlerData}
         */
        setHandler = function (handler, object, acceptList) {
            var data = handlers.get(handler), hdata;

            if (data) {
                hdata = data.get(object);
                if (hdata) hdata.acceptList = acceptList;
                else data.set(object, hdata = {
                    acceptList: acceptList,
                    changeRecords: []
                });
            } else {
                data = createMap();
                data.set(object, hdata = {
                    acceptList: acceptList,
                    changeRecords: []
                });
                handlers.set(handler, data);
            }

            return hdata;
        },

        /**
         * Adds a change record in a given ObjectData
         * @function addChangeRecord
         * @param {ObjectData} data
         * @param {ChangeRecord} changeRecord
         * @param {String} [except]
         */
        addChangeRecord = function (data, changeRecord, except) {
            data.handlers.forEach(function (hdata) {
                // If except is defined, Notifier.performChange has been
                // called, with except as the type.
                // All the handlers that accepts that type are skipped.
                if ((except == null || inArray(except, hdata.acceptList) === -1)
                        && inArray(changeRecord.type, hdata.acceptList) > -1)
                    hdata.changeRecords.push(changeRecord);
            });
        };

    observed = createMap();
    handlers = createMap();

    /**
     * @function Object.observe
     * @see http://arv.github.io/ecmascript-object-observe/#Object.observe
     * @param {Object} object
     * @param {Handler} handler
     * @param {String[]} [acceptList]
     * @throws {TypeError}
     * @returns {Object}               The observed object
     */
    O.observe = function observe(object, handler, acceptList) {
        if (object === null || typeof object !== "object")
            throw new TypeError("Object.observe cannot observe non-object");

        if (typeof handler !== "function")
            throw new TypeError("Object.observe cannot deliver to non-function");

        if (O.isFrozen && O.isFrozen(handler))
            throw new TypeError("Object.observe cannot deliver to a frozen function object");

        if (!isArray(acceptList))
            acceptList = defaultObjectAccepts;

        doObserve(object, handler, acceptList);

        return object;
    };

    /**
     * @function Object.unobserve
     * @see http://arv.github.io/ecmascript-object-observe/#Object.unobserve
     * @param {Object} object
     * @param {Handler} handler
     * @throws {TypeError}
     * @returns {Object}         The given object
     */
    O.unobserve = function unobserve(object, handler) {
        if (object === null || typeof object !== "object")
            throw new TypeError("Object.unobserve cannot unobserve non-object");

        if (typeof handler !== "function")
            throw new TypeError("Object.unobserve cannot deliver to non-function");

        var data = observed.get(object), cbdata;

        if (data && data.handlers.has(handler)) {
            performPropertyChecks(object, data);
            broadcastChangeRecords(data);

            cbdata = handlers.get(handler);

            // In Firefox 13-18, size is a function, but createMap should fall
            // back to the shim for those versions
            if (cbdata.size === 1 && cbdata.get(object))
                handlers["delete"](handler);
            else cbdata["delete"](object);

            if (data.handlers.size === 1)
                observed["delete"](object);
            else data.handlers["delete"](handler);
        }

        return object;
    };

    /**
     * @function Object.getNotifier
     * @see http://arv.github.io/ecmascript-object-observe/#GetNotifier
     * @param {Object} object
     * @throws {TypeError}
     * @returns {Notifier}
     */
    O.getNotifier = function getNotifier(object) {
        if (object === null || typeof object !== "object")
            throw new TypeError("Object.getNotifier cannot getNotifier non-object");

        if (O.isFrozen && O.isFrozen(object)) return null;

        return retrieveNotifier(object);
    };

    /**
     * @function Object.deliverChangeRecords
     * @see http://arv.github.io/ecmascript-object-observe/#Object.deliverChangeRecords
     * @see http://arv.github.io/ecmascript-object-observe/#DeliverChangeRecords
     * @param {Handler} handler
     * @throws {TypeError}
     */
    O.deliverChangeRecords = function deliveryChangeRecords(handler) {
        if (typeof handler !== "function")
            throw new TypeError("Object.deliverChangeRecords cannot deliver to non-function");

        var cbdata = handlers.get(handler);
        cbdata && cbdata.forEach(function (hdata, object) {
            performPropertyChecks(object, observed.get(object));
            if (hdata.changeRecords.length) {
                handler(hdata.changeRecords);
                hdata.changeRecords = [];
            }
        });
    };

})(Object, Array, this);