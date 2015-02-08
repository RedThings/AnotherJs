'use strict';

// closure
(function(a) {

    if (!a.Helpers.StartsWith(jQuery.fn.jquery, "2.")) {
        throw new Error("Another currently uses jQuery v2.x as a dom helper");
    }

    // create application
    a.CreateApplication = function(appName) {
        var app = new a.AnotherApplication(appName);
        a.Applications.push(app);
        return app;
    };

    // applications bucket
    a.Applications = [];

    // presenter callbacks
    a.Presenters = {};

    // check and fire
    a._checkAndFireFromObservable = function(context, fnd, newValName, theValue) {

        // check
        if (fnd.Elements !== undefined && fnd.Elements !== null && fnd.Elements.length > 0) {

            fnd.Elements.forEach(function(el) {

                if (el.length > 0) {

                    // switch type
                    switch (el[0].tagName) {

                    case "INPUT":
                    case "TEXTAREA":
                    {
                        doElementChange(el, context, newValName, theValue, "keyup");
                        break;
                    }
                    case "SELECT":
                    {
                        doElementChange(el, context, newValName, theValue, "change");
                        break;
                    }
                    default:
                        el.html(theValue);
                        break;
                    }


                }
            });

        }

        if (a.Helpers.IsFunc(fnd.Callback)) {
            fnd.Callback(theValue, context);
        }

    }

    // do text input or element change change
    a._doElementChange = function(el, context, newValName, theValue, evName) {

        if (el.data("an_change") === undefined) {

            el.data("an_change", true);

            el.bind(evName, function(e) {
                el.data("change_from_element", true);
                context[newValName] = el.val();
            });

        }

        if (el.data("change_from_element") === true) {
            el.data("change_from_element", false);
        } else {
            el.val(theValue);
        }

    }

    // get observable
    a._getObservable = function(obs, name) {

        var found = obs.filter(function(o) {
            return o.PropName === name;
        });

        return found;

    }

    // get names
    a.GetParentName = function(str, noModel) {
        var nm = a.GetFullName(str);
        var splt = nm.split(".");
        splt.pop();
        return noModel ? splt.join(".").replace("Model.","") : splt.join(".");
    }
    a.GetChildName = function(str) {
        var nm = a.GetFullName(str);
        var splt = nm.split(".");
        return splt[splt.length - 1];
    }
    a.GetFullName = function(str) {
        return str
            .replace("{Model}.", "Model.")
            .replace("{Ui}.", "Model.Ui.")
            .replace("{Data}.", "Model.Data.")
            .replace("{Form}.", "Model.Form.")
            .replace("{Model}.", "Model.");
        ;
    }

    // dom helper
    a.DomHelper = jQuery;

    // wrappers
    a.RepeaterWrappers = {};

    // Initialize presenter
    a.InitializePresenter = function (name, container, arrayOfParams, callback) {

        if (typeof arrayOfParams === "function") {
            callback = arrayOfParams;
            arrayOfParams = undefined;
        }
        if (typeof container === "string") {
            container = a.DomHelper(container);
        }
        if (a.Helpers.IsUndefinedOrNull(container) || container.length < 1) container = a.DomHelper("<div />");


        // 
        a.RaiseEvent("OnBeginPresenterInitializing", name);

        // find
        var presenterObj = a.Presenters[name];

        // check
        if (a.Helpers.IsUndefinedOrNull(presenterObj))
            throw new Error ("Initialize Presenter: Cannot find presenter '" + name + "'");

        a.RaiseEvent("OnPresenterInitializing", presenterObj);

        // found so initialize
        var model = {
            Ui: {},
            Form: {},
            Data: {}
        };
        var presenter = new a.AnotherPresenter(name, model, container);
        presenter.SetObserve();
        presenter.ObserveInnerObject("Ui");
        presenter.ObserveInnerObject("Form");
        presenter.ObserveInnerObject("Data");

        if (a.Helpers.IsUndefinedOrNull(arrayOfParams) || arrayOfParams.IsNullOrEmpty()) {
            presenterObj(presenter);
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

        // run htmlWrappers
        presenter.RunHtmlWrappers();

        // observes
        presenter.RunElObserves();

        // run conditionals
        presenter.RunConditionals();

        // finally raise and callback
        a.RaiseEvent("OnPresenterInitialized", presenter);

        // callbacks
        if (a.Helpers.IsFunc(callback)) {
            callback(presenter);
        }

        //
        return presenter;
    }

    // conditionals
    a.PresenterConditionals = {};

    // plugins
    a.PresenterPlugins = {};

    // kick the whole thing off!
    a.Initialize = function (callback) {

        // add plugins
        var addPluginCounter = 0;
        var pluginKeys = Object.keys(a.PresenterPlugins);
        var addPlugins = function () {

            var nm = pluginKeys[addPluginCounter];
            var plugin = a.PresenterPlugins[nm];
            a.PluginWrapper.prototype[nm] = function (selector, opts) {

                // plugins
                if (a.Helpers.IsUndefinedOrNull(plugin))
                    throw new Error("PresenterPlugin '" + nm + "' does not exist.");

                // sort out selectors!
                var selectors;
                if (a.Helpers.IsArray(selector)) {
                    selectors = selector; // array of strings or elements
                } else {
                    selectors = [selector]; // string or element
                }

                // go!
                plugin.callback(selectors, opts, this.Presenter);

            }
            addPluginCounter++;
            if (addPluginCounter < pluginKeys.length) {
                addPlugins();
            }

        };
        if (pluginKeys.length > 0) {
            addPlugins();
        }

        // add conditionals
        var addCondCounter = 0;
        var condKeys = Object.keys(a.PresenterConditionals);
        var addConditionals = function () {

            //
            var cd = condKeys[addCondCounter];

            // find
            var conditional = a.PresenterConditionals[cd];

            // find
            var foundCallback = a.PresenterConditionals[cd];
            if (a.Helpers.IsUndefinedOrNull(foundCallback))
                throw new Error("PresenterConditional '" + cd + "' does not exist.");

            a.ConditionalsWrapper.prototype[cd] = function (sl, boolCallback) {

                // add
                debugger;
                this.Presenter.PresenterConditionals.push({ name: cd, selector: sl, boolCallback: boolCallback, conditional: conditional });
            }

            addCondCounter++;
            if (addCondCounter < condKeys.length) {
                addConditionals();
            }

        };
        if (condKeys.length > 0) {
            addConditionals();
        }

        // go
        a.DomHelper(window).load(function (e) {

            // look for an-presenter
            a.DomHelper("[an-presenter]").each(function (i, el) {
                var jEl = a.DomHelper(el);
                var name = jEl.attr("an-presenter");
                a.InitializePresenter(name, jEl);
            });

            // configures
            a.Applications.forEach(function (app) {

                app.Configurations.forEach(function (conf) {

                    if (a.Helpers.IsFunc(conf)) {
                        conf(app);
                    }

                });

            });

            // runs
            a.Applications.forEach(function (app) {

                app.Runs.forEach(function (r) {

                    if (a.Helpers.IsFunc(r)) {
                        r(app);
                    }

                });

            });

            // callback
            if (a.Helpers.IsFunc(callback))
                callback();

        });

    };


})(Another);