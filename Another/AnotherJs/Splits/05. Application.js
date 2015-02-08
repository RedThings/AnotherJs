'use strict';

(function(a) {
    
    // application class
    a.AnotherApplication = function (appName) {

        // this
        var ts = this;

        // on error
        this.OnError = function (errFunc) {

            // set
            window.onerror = function (aa, b, c, d, e) {
                return errFunc(e) || true;
            };

            return true;
        }

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
            if (a.Presenters[name] !== undefined)
                throw ("CreatePresenter: '" + name + "' already exists.");

            // add to application collection
            a.Presenters[name] = func;

            //
            return ts;
        };

        // initialize presenter
        this.InitializePresenter = function (name, container, arrayOfParams, callback) {
            return a.InitializePresenter(name, container, arrayOfParams, callback);
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

        // conditionals
        this.AddPresenterConditional = function (name, callback) {

            // check
            if (a.PresenterConditionals[name] !== undefined) {
                throw new Error("PresenterConditional '" + name + "' already exists.");
            }

            // callback
            a.PresenterConditionals[name] = callback;

            // 
            return ts;

        }

        // plugins
        this.AddPresenterPlugin = function (name, wrapperProp, callback) {

            if (typeof wrapperProp === "function") {
                callback = wrapperProp;
                wrapperProp = undefined;
            }

            // check
            if (a.PresenterPlugins[name] !== undefined) {
                throw new Error("PresenterPlugin '" + name + "' already exists.");
            }

            // callback
            a.PresenterPlugins[name] = {
                wrapperProp: wrapperProp, callback: callback
            };

            //
            return ts;

        }

    }


})(Another);