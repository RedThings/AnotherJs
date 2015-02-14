'use strict';

// closure
(function(a) {

    if (!a.StartsWith(jQuery.fn.jquery, "2.")) {
        throw new Error("Another currently uses jQuery v2.x as a dom helper");
    }

    // create application
    a.CreateApplication = function(appName) {
        var app = new a.AnotherApplication(appName);
        a.Applications.push(app);
        return app;
    };

    // dom helper
    a.DomHelper = jQuery;

    // applications bucket
    a.Applications = [];

    // presenter callbacks
    a.Presenters = {};

    // plugins
    a.Plugins = {};
    a.GetPluginsAsArray = function () {
        if (_pluginsAsArray === undefined) {
            _pluginsAsArray = [];
            a.DomHelper.each(a.Plugins, function (nm, plg) {
                _pluginsAsArray.push(plg);
            });
        }
        return _pluginsAsArray;
    };
    a.GetPluginsAsArrayOrdered = function () {
        var plugins = a.GetPluginsAsArray();
        return plugins.sort(a.OrderSort);
    }
    a.OrderSort = function (valA, valB) {
        if (valA.order < valB.order)
            return -1;
        if (valA.order > valB.order)
            return 1;
        return 0;
    }
    var _pluginsAsArray;

    // exclusions
    a.PluginTraversalExclusions = [];
    a.GetPluginTraversalExclusionsStr=function() {
        if (a.PluginTraversalExclusions.length > 0) {
            var strnged = a.PluginTraversalExclusions.map(function(ex) {
                return "[" + ex + "]";
            });
            var output = strnged.join(",");
            return output;
        };
        

        return "___THIS___WONT___EXIST";
    }
    a.IsExcludedFromDomTraversal=function(pluginName) {
        return a.PluginTraversalExclusions.indexOf(pluginName) > -1;
    }
    a.HasExcludedFromDomTraveralAttribute = function (nativeEl) {
        var ok = false;
        a.DomHelper.each(nativeEl.attributes, function(nm,vl) {
            if (a.IsExcludedFromDomTraversal(vl.name)) ok = true;
        });
        return ok;
    }
    

    // Initialize presenter
    a.InitializePresenter = function (name, container, preCallback, callback) {
        
        // sort out params
        if (callback === undefined && typeof preCallback === "function") {
            callback = preCallback;
            preCallback = function() {};
        }
        if (preCallback === undefined) preCallback = function (prs) { };
        if (callback === undefined) callback = function(prs) {};

        // sort out container
        if (typeof container === "string") {
            container = a.DomHelper(container);
        }
        if (a.IsUndefinedOrNull(container) || container.length < 1)
            container = a.DomHelper("<div />");
        
        // 
        a.RaiseEvent("OnBeginPresenterInitializing", name);

        // find
        var presenterObj=name;
        if (typeof name === "string") {
            presenterObj = a.Presenters[name];
        }

        // check
        if (a.IsUndefinedOrNull(presenterObj))
            throw new Error("Initialize Presenter: Cannot find presenter '" + name + "'");

        a.RaiseEvent("OnPresenterInitializing", presenterObj);

        // create presenter
        var presenter = new a.AnotherPresenter(name, container);

        // create model
        var model = {};
        
        // add aliases
        presenter.AddAlias("Model", "Model");
        presenter.AddAlias("Ui", "Model.Ui");
        presenter.AddAlias("Data", "Model.Data");
        presenter.AddAlias("Form", "Model.Form");

        // observe and add and observe etc etc
        presenter.Model = model;
        presenter.Observe("{Model}");
        presenter.Model.Form = {};
        presenter.Model.Ui = {};
        presenter.Model.Data = {};
        
        // pre
        if (a.IsFunc(preCallback)) {
// ReSharper disable once InvokedExpressionMaybeNonFunction
            preCallback(presenter);
        };
        
        // user init
        presenterObj(presenter, presenter.Model, presenter.Model.Form, presenter.Model.Ui, presenter.Model.Data);
        
        // intialize dom
        presenter.InitializeDom(presenter.Container);

        // force
        presenter.ForceObserve();
        
        // finally raise and callback
        a.RaiseEvent("OnPresenterInitialized", presenter);

        // callbacks
        if (a.IsFunc(callback)) {
            // ReSharper disable once InvokedExpressionMaybeNonFunction
            callback(presenter);
        }

        //
        return presenter;
    }

    // kick the whole thing off!
    a.Initialize = function (callback) {

        // add plugins to prototype
        var addPluginCounter = 0;
        var pluginKeys = Object.keys(a.Plugins);
        var addPlugins = function () {

            var nm = pluginKeys[addPluginCounter];
            var plugin = a.Plugins[nm];
            a.PluginWrapper.prototype[nm] = function (selector, opts) {

                // plugins
                if (a.IsUndefinedOrNull(plugin))
                    throw new Error("PresenterPlugin '" + nm + "' does not exist.");

                // sort out selectors!
                var jEl = selector;
                if (jEl.jquery === undefined) {
                    jEl = typeof selector === "string" ? this.Presenter.Element(selector) : this.Presenter.DomHelper(jEl);
                }

                // go!
                plugin.callback(jEl, opts, this.Presenter);

            }
            addPluginCounter++;
            if (addPluginCounter < pluginKeys.length) {
                addPlugins();
            }

        };
        if (pluginKeys.length > 0) {
            addPlugins();
        }

        // go
        a.DomHelper(window).load(function (e) {

            // pre-configures
            a.Applications.forEach(function (app) {

                app.OnApplicationStarts.forEach(function (start) {

                    if (a.IsFunc(start)) {
                        start(app);
                    }

                });

            });

            // configures
            a.Applications.forEach(function (app) {

                app.OnApplicationConfigures.forEach(function (conf) {

                    if (a.IsFunc(conf)) {
                        conf(app);
                    }

                });

            });

            // look for an-presenter
            a.DomHelper("[an-presenter]").each(function (i, el) {
                var jEl = a.DomHelper(el);
                var name = jEl.attr("an-presenter");
                a.InitializePresenter(name, jEl);
            });

            // runs
            a.Applications.forEach(function (app) {

                app.OnApplicationRuns.forEach(function (r) {

                    if (a.IsFunc(r)) {
                        r(app);
                    }

                });

            });

            // callback
            if (a.IsFunc(callback))
                callback();

        });

    };

    // before unload
    a.DomHelper(window).bind("beforeunload", function(e) {
        
        // pre-configures
        a.Applications.forEach(function (app) {

            app.OnApplicationEnds.forEach(function (end) {

                if (a.IsFunc(end)) {
                    end(app);
                }

            });

        });

    });


})(Another);