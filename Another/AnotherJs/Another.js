/*
 * Another.js
 * 
 * Core module
 * 
 * Includes:
 * 
 *  - MVP framework
 *  - Helpers
 * 
 */

'use strict';

// declare another literal
if (window.Another === undefined) {
    window.Another = {};
}

// check jQuery
if (jQuery === undefined) {
    throw "Another currently uses jQuery v2.x as a dom helper";
}

// closure
(function (a) {

    // helpers
    a.Helpers = {

        EndsWith: function (str, chars) {
            var ok = !a.Helpers.StringIsNullOrEmpty(str) && str.lastIndexOf(chars) === (str.length) - chars.length;
            return ok;
        },
        StripLast: function (str) {
            if (str === undefined || str === null || str === "")
                throw "EndsWith: str cannot be null, empty or undefined";
            return str.substr(0, str.length - 1);
        },
        StartsWith: function (str, chars) {
            var ok = !a.Helpers.StringIsNullOrEmpty(str) && str.substr(0, chars.length) === chars;
            return ok;
        },
        StripFirst: function (str) {
            if (str === undefined || str === null || str === "")
                throw "EndsWith: str cannot be null, empty or undefined";
            return str.substr(1);
        },
        StringIsNullOrEmpty: function (str) {
            return str === undefined || str === null || str === "";
        },
        IsUndefinedOrNull: function (obj) {
            return obj === undefined || obj === null;
        },
        Any: function (collection, lambda) {
            if (a.Helpers.IsUndefinedOrNull(lambda))
                throw "Helpers.Any: lambda cannot be undefined";
            return !a.Helpers.IsUndefinedOrNull(collection) && collection.length > 0 && lambda(collection).length > 0;
        },
        IsFunc: function (func) {
            return !a.Helpers.IsUndefinedOrNull(func) && typeof func === "function";
        }

    };

    // extensions
    String.prototype.IsNullOrEmpty = function () {
        return a.Helpers.StringIsNullOrEmpty(this);
    };
    String.prototype.IsNullOrWhitespace = function () {
        return this.IsNullOrEmpty() || this.replace(/^\s+/, '').replace(/\s+$/, '') === '';
    };
    Array.prototype.IsNullOrEmpty = function () {
        return a.Helpers.IsUndefinedOrNull(this) || this.length < 1;
    };
    Object.defineProperty(Object.prototype, "IsNullOrEmpty", {
        value: function () {

            return a.Helpers.IsUndefinedOrNull(this);
        }, enumerable: false
    });
// ReSharper disable once InconsistentNaming
    var IsNullOrUndefined = function (obj) {
        return a.Helpers.IsUndefinedOrNull(obj);
    }
    if (!a.Helpers.StartsWith(jQuery.fn.jquery, "2.")) {
        throw "Another currently uses jQuery v2.x as a dom helper";
    }

    // dom helper
    a.DomHelper = jQuery;

    // presenter
    a.AnotherPresenter = function (name, model, domHelper) {

        // this
        var ts = this;

        // observables
        var _observables = [];

        // on observe
        function doOnObserve(newVals) {

            newVals.forEach(function (newVal) {

                // find corresponding
                var found = _observables.filter(function (obs) {
                    return obs.PropName === newVal.name;
                });

                // check
                if (found.length > 0) {
                    found.forEach(function (fnd) {

                        // get value
                        var theValue = newVal.object[newVal.name];

                        // check
                        if (fnd.Elements !== undefined && fnd.Elements !== null && fnd.Elements.length > 0) {

                            fnd.Elements.forEach(function (el) {

                                if (el.length > 0) {

                                    // switch type
                                    switch (el[0].tagName) {

                                        case "INPUT":
                                        case "TEXTAREA":
                                        case "SELECT":
                                            {
                                                if (el.data("an_change") === undefined) {
                                                    el.data("an_change", true);

                                                    if (el[0].tagName === "SELECT") {
                                                        el.bind("change", function (e) {
                                                            el.data("change_from_element", true);
                                                            model[newVal.name] = el.val();
                                                        });
                                                    } else {
                                                        el.bind("keyup", function (e) {
                                                            el.data("change_from_element", true);
                                                            model[newVal.name] = el.val();
                                                        });
                                                    }

                                                }

                                                if (el.data("change_from_element") === true) {
                                                    el.data("change_from_element", false);
                                                } else {
                                                    el.val(theValue);
                                                }

                                                break;
                                            }
                                        default:
                                            el.html(theValue);
                                    }
                                }
                            });

                        }

                        if (fnd.Callback !== undefined && fnd.Callback !== null && typeof fnd.Callback === "function") {
                            fnd.Callback(theValue, model);
                        }
                    });
                };

            });

        };

        // dom helper
        this.DomHelper = domHelper;

        // model
        this.Model = model;

        // Add observer
        this.Bind = function (propName, func) {
            _observables.push({ PropName: propName, Callback: func, Elements: null });
        }

        // Add element observer
        this.BindElement = function (propName, selector, func) {
            if (a.Helpers.IsUndefinedOrNull(propName) || propName.IsNullOrEmpty() || selector.IsNullOrEmpty())
                throw "BindElement: propName and selector must be a string with value";
            var el = a.DomHelper(selector);
            _observables.push({ PropName: propName, Callback: func, Elements: [el] });
            return el;
        }

        // Add element observer
        this.BindElements = function (propName, selectors, func) {
            if (a.Helpers.IsUndefinedOrNull(propName) || propName.IsNullOrEmpty() || selectors.IsNullOrEmpty())
                throw "BindElements: propName and selectors must be a string with value";
            var els = [];
            selectors.forEach(function (sl) {
                els.push(a.DomHelper(sl));
            });
            _observables.push({ PropName: propName, Callback: func, Elements: els });
            return els;

        }

        // Add element observer
        this.BindElementStatic = function (val, selector) {
            if (a.Helpers.IsUndefinedOrNull(val) || val.IsNullOrEmpty() || selector.IsNullOrEmpty())
                throw "BindElementStatic: val and selector must be a string with value";
            var el = a.DomHelper(selector);
            el.html(val);
            el.val(val);
            return el;
        }

        // Add element observer
        this.BindElementsStatic = function (val, selectors) {
            if (a.Helpers.IsUndefinedOrNull(val) || val.IsNullOrEmpty() || selectors.IsNullOrEmpty())
                throw "BindElementsStatic: val and selectors must be a string with value";
            var els = [];
            selectors.forEach(function (sl) {
                var el = a.DomHelper(sl);
                el.html(val);
                el.val(val);
                els.push(el);
            });
            return els;

        }

        // set observer
        this.SetObserve = function () {

            // set
            Object.observe(model, function (newVal) {
                doOnObserve(newVal);
            });

        }

        // get service
        this.GetService = function (svcName) {
            return a.GetService(svcName);
        }

        // raise event
        this.RaiseEvent = function (evName, obj) {
            a.RaiseEvent(evName, obj);
        }

        // subscribe
        this.SubscribeToEvent = function (evName, func) {
            a.SubscribeToEvent(evName, func);
        }

    }

    // application class
    a.AnotherApplication = function (appName) {

        // this
        var ts = this;

        // config
        this.Configurations = [];

        // configure
        this.Configure = function (func) {
            if (a.Helpers.IsFunc(func)) {
                ts.Configurations.push(func);
            }
        };

        // runs
        this.Runs = [];

        // run
        this.Run = function (func) {
            if (a.Helpers.IsFunc(func)) {
                this.Runs.push(func);
            }
        }

        // constructor
        this.ApplicationName = appName;

        // create components
        this.CreatePresenter = function (name, func) {

            // check
            if (a.PresenterCallbacks[name] !== undefined)
                throw "CreatePresenter: '" + name + "' already exists.";

            // add to application collection
            a.PresenterCallbacks[name] = func;

            //
            return ts;
        };

        // initialize presenter
        this.InitializePresenter = function (name, arrayOfParams, callback) {
            return a.InitializePresenter(name, arrayOfParams, callback);
        }

        // get service
        this.GetService = function (svcName) {
            return a.GetService(svcName);
        }

        // create service
        this.AddService = function (name, type, deps, svc) {
            a.AddService(name, type, deps, svc);
            return ts;
        }

        // raise event
        this.RaiseEvent = function (name, obj) {
            a.RaiseEvent(name, obj);
        }

        // subscribe
        this.SubscribeToEvent = function (evName, func) {
            a.SubscribeToEvent(evName, func);
        }

        // add dependency
        this.AddDependency = function (name, type, deps, dep) {
            a.AddDependency(name, type, deps, dep);
            return ts;
        }

        // get dependency
        this.GetDependency = function (name) {
            return a.GetDependency(name);
        }
    }

    // applications bucket
    a.Applications = [];

    // create application
    a.CreateApplication = function (appName) {
        var app = new a.AnotherApplication(appName);
        a.Applications.push(app);
        return app;
    };

    // presenter callbacks
    a.PresenterCallbacks = {};

    // Initialize presenter
    a.InitializePresenter = function (name, arrayOfParams, callback) {

        if (typeof arrayOfParams === "function") {
            callback = arrayOfParams;
            arrayOfParams = undefined;
        }

        if (typeof callback === "object") {
            arrayOfParams = callback;
            callback = undefined;
        }


        a.RaiseEvent("OnBeginPresenterInitializing", name);

        // find
        var pCallback = a.PresenterCallbacks[name];

        // check
        if (a.Helpers.IsUndefinedOrNull(pCallback))
            throw "Initialize Presenter: Cannot find presenter '" + name + "'";

        a.RaiseEvent("OnPresenterInitializing", pCallback);

        // found so initialize
        var model = {};
        var domHelper = a.DomHelper;
        var presenter = new a.AnotherPresenter(name, model, domHelper);
        presenter.SetObserve();

        if (IsNullOrUndefined(arrayOfParams) || arrayOfParams.IsNullOrEmpty()) {
            pCallback(presenter);
        } else {
            var str = "pCallback(presenter,";
            for (var i = 0; i < arrayOfParams.length; i++) {
                var p = arrayOfParams[i];
                str += "'" + p + "'";
                if (i !== (arrayOfParams.length - 1))
                    str += ",";
            };
            str += ");";
            eval(str);
        }


        a.RaiseEvent("OnPresenterInitialized", presenter);

        if (a.Helpers.IsFunc(callback)) {
            callback(presenter);
        }
        return presenter;
    }

    // events
    a.Events = {};

    // subscribe to event
    a.SubscribeToEvent = function (name, func) {

        // find
        var foundEv = a.CreateEvent(name);

        // add to subscribers
        foundEv.Subscribers.push(func);
    }

    // raise event
    a.RaiseEvent = function (name, obj) {

        // find
        var foundEv = a.CreateEvent(name);

        // loop subscibers
        foundEv.Subscribers.forEach(function (s) {
            s(obj);
        });
    }

    // create event
    a.CreateEvent = function (name) {
        if (a.Helpers.IsUndefinedOrNull(a.Events[name])) {

            a.Events[name] = {
                Subscribers: []
            };

        }
        return a.Events[name];

    }

    // services
    a.Services = {};

    // services
    a.StaticServices = {};

    // create service
    a.AddService = function (name, type, deps, svc) {

        if (IsNullOrUndefined(deps)) {
            svc = deps;
            deps = undefined;
        }

        if (IsNullOrUndefined(name) || IsNullOrUndefined(svc) || IsNullOrUndefined(type) || type.IsNullOrEmpty() || name.IsNullOrEmpty() || !a.Helpers.IsFunc(svc))
            throw "AddService: name, type and svc must be strings and a function respectively";
        if (a.Services[name] !== undefined)
            throw "AddService: service '" + name + "' already exists";

        a.Services[name] = { Name: name, Dependencies: deps, Service: svc, Type: type };
    }

    // get service
    a.GetService = function (svcName) {

        var svc = a.Services[svcName];
        if (a.Helpers.IsUndefinedOrNull(svc))
            throw "Cannot find service '" + svcName + "'";

        // try static
        if (svc.Type === "Static" && a.StaticServices[svcName] !== undefined)
            return a.StaticServices[svcName];

        // try dependencyless
        if (svc.Dependencies === undefined) {
            if (svc.Type === "Static") {
                var output = new svc.Service();
                a.StaticServices[output.Name] = output;
                return output;
            } else {
                return new svc.Service();
            }
        } else {

            // with deps
            var depsString = "";
            var outputString = "theService = new svc.Service(";
            var theService = undefined;
            for (var i = 0; i < svc.Dependencies.length; i++) {
                depsString += "var d" + i + " = a.GetDependency('" + svc.Dependencies[i] + "'); ";
                outputString += "d" + i;
                if (i < svc.Dependencies.length - 1)
                    outputString += ",";
            }
            outputString += ");";
            eval(depsString + outputString);
            // ReSharper disable once ConditionIsAlwaysConst
            // ReSharper disable once HeuristicallyUnreachableCode
            if (theService !== undefined) {
                if (svc.Type === "Static") {
                    a.StaticDependencies[svc.Name] = theService;
                }
            }

            return theService;
        }
    }

    // dependencies
    a.Dependencies = {};

    // static dependencies
    a.StaticDependencies = {};

    // mocking
    a.MockDependency = function (name, type, dep) {
        a.Dependencies[name] = undefined;
        a.AddDependency(name, type, [], dep);
    }

    // add depenency
    a.AddDependency = function (name, type, deps, dep) {
        if (IsNullOrUndefined(deps)) {
            dep = deps;
            deps = undefined;
        }
        
        if (IsNullOrUndefined(name) || IsNullOrUndefined(type) || name.IsNullOrEmpty() || type.IsNullOrEmpty() || !a.Helpers.IsFunc(dep))
            throw "AddDependency: name and type must be a string and dep must be a function";
        if (a.Dependencies[name] !== undefined)
            throw "AddDependency: dependency '" + name + "' already exists";

        a.Dependencies[name] = { Name: name, Dependency: dep, Dependencies: deps, Type: type };
    }

    // get dependency
    a.GetDependency = function (dep) {
        var output = a.Dependencies[dep];
        if (IsNullOrUndefined(output))
            throw "GetDependency: '' is not a dependency";

        // check static
        if (output.Type === "Static" && a.StaticDependencies[name] !== undefined) {
            return a.StaticDependencies[name];
        }

        // get deps string
        if (output.Dependencies !== undefined) {
            var depsString = "";
            var outputString = "theDep = new output.Dependency(";
            var theDep = undefined;
            for (var i = 0; i < output.Dependencies.length; i++) {
                depsString += "var d" + i + " = a.GetDependency('" + output.Dependencies[i] + "'); ";
                outputString += "d" + i;
                if (i < output.Dependencies.length - 1)
                    outputString += ",";
            }
            outputString += ");";
            eval(depsString + outputString);
            // ReSharper disable once ConditionIsAlwaysConst
            // ReSharper disable once HeuristicallyUnreachableCode
            if (theDep !== undefined) {
                if (output.Type === "Static") {
                    a.StaticDependencies[output.Name] = theDep;
                }

            }

            return theDep;

        } else {

            if (output.Type === "Static") {
                var depend = new output.Dependency();
                a.StaticDependencies[output.Name] = depend;
                return depend;

            } else {
                return new output.Dependency();
            }
        }
    }

    // kick the whole thing off!
    a.Initialize = function (callback) {

        // go
        a.DomHelper(window).load(function (e) {

            a.Applications.forEach(function (app) {

                app.Configurations.forEach(function (conf) {

                    if (a.Helpers.IsFunc(conf)) {
                        conf(app);
                    }

                });

            });

            a.Applications.forEach(function (app) {

                app.Runs.forEach(function (r) {

                    if (a.Helpers.IsFunc(r)) {
                        r(app);
                    }

                });

            });

            if (a.Helpers.IsFunc(callback))
                callback();

        });

    };




    /*
     * 
     * Another.Dependencies
     * 
     */

    // create dependencies app
    a.DependenciesApplication = a.CreateApplication("Another.Dependencies");

    // closure
    (function (ad) {

        ad.AddDependency("Http", "Static", [], function () {

            this.Get = a.DomHelper.get;
            this.Post = a.DomHelper.post;
            this.Ajax = a.DomHelper.ajax;

        });

        ad.AddDependency("DomHelper", "Static", [], function () {

            return a.DomHelper;

        });

    })(a.DependenciesApplication);




})(Another);





/*!
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