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

    // Initialize presenter
    a.InitializePresenter = function (name, container, mdl, preCallback, callback) {
        
        if (typeof mdl === "function") {
            if (preCallback === undefined) {
                callback = mdl;
                preCallback = undefined;
            } else {
                callback = preCallback;
                preCallback = mdl;
            }
            mdl = undefined;

        }

        if (preCallback === undefined) preCallback = function (prs) { };
        if (callback === undefined) callback = function(prs) {};


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

        // found so initialize
        var model = mdl || {
            Ui: {},
            Form: {},
            Data: {}
        };

        // create presenter
        var presenter = new a.AnotherPresenter(name, model, container);

        // pre
        preCallback(presenter);

        // observe
        presenter.Observe("{Model}");
        
        // user init
        presenterObj(presenter, model, model.Form, model.Ui, model.Data);
        
        // intialize dom
        presenter.InitializeDom(presenter.Container);
        
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