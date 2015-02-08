'use strict';

(function (a) {

    // presenter class
    a.AnotherPresenter = function (name, model, container) {
        // this
        var ts = this;

        // check
        if (a.Helpers.IsUndefinedOrNull(container) || container.length < 1)
            throw new Error("Presenter: container must be at least one element");

        // dom helper
        var domHelper = a.GetDependency("DomHelper");
        this.DomHelper = domHelper;

        // container
        this.Container = container;

        // element
        this.Element = function (selector) {
            var output = ts.Container.find(selector);
            if (output.length < 1) {
                output = domHelper("<div />");
            }
            return output;
        }

        // observables
        this._observables = [];

        // on observe
        function doOnObserve(newVals, context, subName) {

            ts.RaiseEvent("OnModelChanged", { Model: ts.Model, NewVals: newVals });

            // check
            if (a.Helpers.IsUndefinedOrNull(subName)) subName = "";

            // loop and look for changes
            newVals.forEach(function (newVal) {

                // get found
                var found = a._getObservable(ts._observables, subName + newVal.name);

                // check
                if (found.length > 0) {

                    found.forEach(function (fnd) {

                        // get value
                        var theValue = newVal.object[newVal.name];

                        // check
                        if (shouldBeObservableArray(theValue)) {
                            var conv = convertToObservableArray(theValue, context, newVal.name, _observables, subName + newVal.name);
                            context[newVal.name] = conv;
                        } else {

                            a._checkAndFireFromObservable(context, fnd, newVal.name, theValue);

                        }

                    });
                };

            });


            ts.RaiseEvent("OnModelObserved", { Model: ts.Model, NewVals: newVals });
        };

        // conditionals
        this.RunConditionals = function () {

            /*
             * 
             * IT (ts.PresenterConditionals) DOESN'T EXIST ANYMORE - NEED TO GET IT BACK!!
             * 
             */
            ts.PresenterConditionals.forEach(function (obj) {

                // elements
                var els = [];

                // check
                if (a.Helpers.IsArray(obj.selector)) {
                    obj.selector.forEach(function (sl) {
                        els.push(ts.Container.find(sl));
                    });
                } else if (typeof obj.selector === "string") {
                    els.push(ts.Container.find(obj.selector));
                }

                // now loop
                els.forEach(function (el) {

                    var res = false;
                    if (typeof obj.boolCallback === "string") {
                        eval("res = " + obj.boolCallback);
                    } else {
                        res = obj.boolCallback();
                    }
                    obj.conditional(el, res);
                });

            });
        }

        // run htmlWrappers
        this.RunHtmlWrappers = function () {


            /*
             * RUN PLUGINS
             * 
             */
            var innerCount = 0;
            var innerKeys = Object.keys(a.PluginWrapper.prototype);
            var innerFunc = function () {

                var pluginName = innerKeys[innerCount];
                if (pluginName !== "Presenter") {

                    // lowercase the name
                    var nmLower = pluginName.toLowerCase();

                    // find els
                    var els = ts.Container.find("[an-" + nmLower + "]");
                    els.each(function (i, el) {

                        // get element
                        var jEl = ts.DomHelper(el);

                        // iterate option keys and set from attributes
                        var opts = {};
                        a.DomHelper.each(el.attributes, function (ai, attr) {
                            if (a.Helpers.StartsWith(attr.name, "an-" + nmLower) && attr.name !== "an-" + nmLower) {
                                opts[attr.name.replace("an-" + nmLower + "-", "")] = attr.value;
                            }
                        });

                        // find the plugin object in global list
                        var foundPlugin = a.PresenterPlugins[pluginName];

                        // set wrapperPropName in opts
                        if (!(a.Helpers.IsUndefinedOrNull(foundPlugin.wrapperProp))) {
                            opts[foundPlugin.wrapperProp] = jEl.attr("an-" + nmLower);
                        }

                        // call presenter.plugins[pluginName](el, opts)
                        ts.Plugins[pluginName](el, opts);
                    });

                }

                innerCount++;
                if (innerCount < innerKeys.length) {
                    innerFunc();
                }

            }
            innerFunc();


            /*
             * 
             * RUN CONDITIONALS
             * 
             */
            innerCount = 0;
            innerKeys = Object.keys(a.PresenterConditionals);
            innerFunc = function () {

                var condName = innerKeys[innerCount];
                var nmLower = condName.toLowerCase();
                var els = ts.Container.find("[an-" + nmLower + "]");
                els.each(function (i, el) {

                    // get element
                    var jEl = ts.DomHelper(el);

                    // eval
                    var evalStr =
                        "ts.Conditionals[condName](jEl, function () {" +
                            "return ts.Model." + jEl.attr("an-" + nmLower) + " || false;" +
                        "});";
                    eval(evalStr);
                });

                innerCount++;
                if (innerCount < innerKeys.length) {
                    innerFunc();
                }

            }
            innerFunc();

        };

        // observes
        this.RunElObserves = function () {

            ts._observables.forEach(function (obs) {

                if (!a.Helpers.IsUndefinedOrNull(obs.Elements)) {
                    var contxt;
                    var propNameSplt = obs.PropName.split(".");
                    var propString = "contxt = ts.Model";
                    for (var i = 0; i < propNameSplt.length - 1; i++) {
                        propString += "." + propNameSplt[0];
                    }
                    eval(propString);

                    // ReSharper disable once UsageOfPossiblyUnassignedValue
                    a._checkAndFireFromObservable(contxt, obs, obs.PropName, contxt[obs.PropName]);

                }

            });

        }

        // should be observable
        var shouldBeObservableArray = function (obj) {
            return a.ShouldBeObservableArray(obj);
        }

        // convert to observable
        var convertToObservableArray = function (theValue, parentObj, childObjName, theObservables, fullName) {
            return a.ConvertToObservableArray(theValue, parentObj, childObjName, theObservables, fullName);
        }

        // check and change at top level
        var checkAndChangeArrays = function (obj, preName) {

            if (a.Helpers.IsUndefinedOrNull(preName))
                preName = "";

            for (var ooo in obj) {
                var innerObj = obj[ooo];
                if (shouldBeObservableArray(innerObj)) {
                    obj[ooo] = convertToObservableArray(obj[ooo], obj, ooo, _observables, preName + ooo);
                }
            }
        }

        // model
        this.Model = model;

        // bind
        this.Bind = function (propNameOrData, selectors, callback) {

            if (a.Helpers.IsUndefinedOrNull(callback) && typeof selectors === "function") {
                callback = selectors;
                selectors = undefined;
            }

            if (typeof propNameOrData === "string") {

                if (typeof callback === "function" && a.Helpers.IsUndefinedOrNull(selectors)) {
                    bind(propNameOrData, callback);
                } else {

                    // dynamic
                    if (a.Helpers.IsArray(selectors)) {
                        bindElements(propNameOrData, selectors, callback);
                    } else {
                        bindElement(propNameOrData, selectors, callback);
                    }
                }

            } else {
                // static
                if (a.Helpers.IsArray(selectors)) {
                    bindElementsStatic(propNameOrData, selectors, callback);
                } else {
                    bindElementStatic(propNameOrData, selectors, callback);
                }
            }

            return ts;

        };

        // eveal
        this.GetEvalString = function (toBeSet, presenterAlias, str) {

            if (typeof str === "string" && typeof toBeSet === "string" && typeof presenterAlias === "string") {

                // check
                if (a.Helpers.EndsWith(str, ";")) str = a.Helpers.StripLast(str);

                // switch
                switch (str) {
                    case "false":
                    case "False":
                    case "FALSE":

                        {
                            return(toBeSet + " = false");
                            break;
                        }
                    case "true":
                    case "True":
                    case "TRUE":
                        {
                            return (toBeSet + " = true");
                            break;
                        }
                    default:
                        {
                            // replace
                            str = str.replace("{Presenter}.", "ts.");
                            str = str.replace("{Model}.", "ts.Model.");
                            str = str.replace("{Ui}.", "ts.Model.Ui.");
                            str = str.replace("{Data}.", "ts.Model.Data.");
                            str = str.replace("{Form}.", "ts.Model.Form.");
                            str = str.replace("ts.", presenterAlias + ".");

                            // eval
                            return (toBeSet + " = " + str);
                        }

                }

            }

            throw new Error("Presenter.GetEvalString: toBeSet, presenterAlias and str must be strings");
        }

        // Add observer
        var bind = function (propName, func) {
            _observables.push({ PropName: propName, Callback: func, Elements: null });
            return ts;
        }

        // Add element observer
        var bindElement = function (propName, selector, func) {

            var el;

            // check
            if (typeof selector !== "string") {
                el = selector;
            } else {
                if (a.Helpers.IsUndefinedOrNull(propName) || propName.IsNullOrEmpty() || selector.IsNullOrEmpty())
                    throw ("BindElement: propName and selector must be a string with value");
                el = ts.Element(selector);
            }

            _observables.push({ PropName: propName, Callback: func, Elements: [el] });
            return el;
        }

        // Add element observer
        var bindElements = function (propName, selectors, func) {
            if (a.Helpers.IsUndefinedOrNull(propName) || propName.IsNullOrEmpty() || selectors.IsNullOrEmpty())
                throw new Error("BindElements: propName and selectors must be a string with value");
            var els = [];
            selectors.forEach(function (sl) {
                els.push(ts.Element(sl));
            });
            _observables.push({ PropName: propName, Callback: func, Elements: els });
            return els;

        }

        // Add element observer
        var bindElementStatic = function (val, selector) {
            if (a.Helpers.IsUndefinedOrNull(val) || val.IsNullOrEmpty() || selector.IsNullOrEmpty())
                throw ("BindElementStatic: val and selector must be a string with value");
            var el = ts.Element(selector);
            el.html(val);
            el.val(val);
            return el;
        }

        // Add element observer
        var bindElementsStatic = function (val, selectors) {
            if (a.Helpers.IsUndefinedOrNull(val) || val.IsNullOrEmpty() || selectors.IsNullOrEmpty())
                throw new Error("BindElementsStatic: val and selectors must be a string with value");
            var els = [];
            selectors.forEach(function (sl) {
                var el = ts.Element(sl);
                el.html(val);
                el.val(val);
                els.push(el);
            });
            return els;

        }

        // repeater
        this.BindRepeater = function (opts) {

            // check
            if (typeof opts.data === "string") {

                // bind
                ts.Bind(opts.data, function (newVal) {

                    opts.data = newVal;
                    if (a.Helpers.IsUndefinedOrNull(opts.guid) || opts.guid.IsNullOrEmpty())
                        opts.guid = a.Helpers.GetRandom(true);
                    ts.BindRepeater(opts);

                });

                return ts.Element(opts.selector);

            } else {

                // check
                if (opts.data.toString() !== "Another.ObservableArray") {
                    throw new Error("Presenter.BindRepeater = options.data must be an array");
                }

                if (a.Helpers.IsUndefinedOrNull(opts.guid) || opts.guid.IsNullOrEmpty())
                    opts.guid = a.Helpers.GetRandom(true);

                // wrapper
                var wrapper = a.RepeaterWrappers[opts.guid];
                if (a.Helpers.IsUndefinedOrNull(wrapper)) {
                    wrapper = new a.RepeaterWrapper(opts, ts);
                    a.RepeaterWrappers[opts.guid] = wrapper;
                }

                return wrapper.Element();
            }

        }

        // bind repeater controls
        this.BindRepeaterControl = function (slOrEl, opts) {

            // check
            if (a.Helpers.StringIsNullOrEmpty(opts.valueField) || a.Helpers.StringIsNullOrEmpty(opts.textField)) {
                throw new Error("BindRepeaterControl: options.selector, options.valueField and options.textField cannot be null or empty");
            }

            // check
            if (typeof opts.data === "string") {
                ts.Bind(opts.data, function (newVal) {

                    opts.data = newVal;
                    ts.BindRepeaterControl(slOrEl, opts);

                });
                var outputEl = typeof slOrEl === "object" ? slOrEl : ts.Container.find(slOrEl);
                if (outputEl.length < 1) outputEl = ts.DomHelper("<div />");
                return outputEl;
            } else {

                // get context
                var contxt;
                var propNameSplt = opts.model.split(".");
                var propString = "contxt = ts.Model";
                for (var i = 0; i < propNameSplt.length - 1; i++) {
                    propString += "." + propNameSplt[0];
                }
                eval(propString);
                var setContextProp = function (vl) {
                    contxt[propNameSplt[propNameSplt.length - 1]] = vl;
                }
                var getContextProp = function () {
                    return contxt[propNameSplt[propNameSplt.length - 1]];
                }

                // get element
                var el = typeof slOrEl === "object" ? slOrEl : ts.Container.find(slOrEl);

                // check and mock if necessary
                if (el.length <= 0)
                    el = ts.DomHelper("<div />");

                // group
                var theGroup = [];

                // kill children
                el.children().remove();

                // switch type and do general stuff
                switch (opts.type) {
                    case "select":
                        {
                            if (opts.multi === true) {
                                el.attr("multiple", "multiple");
                            }
                            break;
                        }
                    default:
                        break;
                }

                // create children
                var newName = a.Helpers.GetRandom(true);
                if (opts.data === undefined || opts.data.length <= 0) {

                    return el;

                } else {
                    opts.data.forEach(function (d) {

                        if (!a.Helpers.IsUndefinedOrNull(d)) {


                            // start
                            var newInput;
                            var newInputHtml;
                            var newLabelHtml;
                            var newLabel;
                            var evName;
                            var controlClass = a.Helpers.IsUndefinedOrNull(opts.controlClass) ? "" : " class='" + opts.controlClass + " " + opts.controlClass + "-" + opts.type + "'";
                            var labelClass = a.Helpers.IsUndefinedOrNull(opts.labelClass) ? "" : " class='" + opts.labelClass + " " + opts.labelClass + "-" + opts.type + "'";

                            // switch types
                            switch (opts.type) {
                                case "radio":
                                    {
                                        newInputHtml = "<input" + controlClass + " type='radio' name='" + newName + "' value='" + d[opts.valueField] + "' />";
                                        newLabelHtml = "<span" + labelClass + ">" + d[opts.textField] + "</span>";
                                        newInput = domHelper(newInputHtml);
                                        newLabel = domHelper(newLabelHtml);
                                        evName = "click";
                                        el.parent().children("label:first").attr("for", newName);
                                        break;
                                    }
                                case "checkbox":
                                    {
                                        newInputHtml = "<input" + controlClass + " type='checkbox' name='" + newName + "' value='" + d[opts.valueField] + "' />";
                                        newLabelHtml = "<span" + labelClass + ">" + d[opts.textField] + "</span>";
                                        newInput = domHelper(newInputHtml);
                                        newLabel = domHelper(newLabelHtml);
                                        evName = "click";
                                        el.parent().children("label:first").attr("for", newName);
                                        break;
                                    }
                                case "select":
                                    {
                                        var vl = d[opts.valueField];
                                        var vltxt = vl === undefined ? "" : vl;
                                        newInputHtml = "<option value='" + vltxt + "'>" + d[opts.textField] + "</option>";
                                        newInput = domHelper(newInputHtml);
                                        break;
                                    }
                                default:
                                    throw new Error("BindRepeaterControl: " + opts.type + " not implemented");
                            }

                            // not select
                            if (opts.type !== "select") {

                                // bind change / click / whatever
                                if (!a.Helpers.IsUndefinedOrNull(evName) && newInput.data(evName + "_bound") !== true) {
                                    newInput.data(evName + "_bound", true);
                                    newInput.bind(evName, function (e) {

                                        // denote coming from element event
                                        el.data("change_from_element", true);

                                        // 
                                        if (opts.multi !== true) {


                                            // switch type
                                            switch (opts.type) {

                                                case "checkbox":
                                                    {
                                                        var ischkd = newInput[0].checked;
                                                        theGroup.forEach(function (theEl) {
                                                            theEl[0].checked = false;
                                                        });
                                                        newInput[0].checked = ischkd;
                                                        if (ischkd) {
                                                            setContextProp(newInput.val());
                                                        } else {
                                                            setContextProp(undefined);
                                                        }
                                                        break;
                                                    }
                                                default:
                                                    {
                                                        setContextProp(newInput.val());
                                                        break;
                                                    }
                                            }
                                            if (opts.type === "checkbox") {

                                            }

                                        } else {

                                            // create data bucket
                                            if (getContextProp() === undefined)
                                                setContextProp([]);

                                            // create temp
                                            var tempBucket = [];
                                            getContextProp().forEach(function (tmp) {
                                                tempBucket.push(tmp);
                                            });

                                            // add
                                            if (tempBucket.indexOf(newInput.val()) < 0) {
                                                if (newInput[0].checked || newInput.attr("selected") === "selected") {
                                                    tempBucket.push(newInput.val());
                                                }
                                            } else {
                                                if (!newInput[0].checked || newInput.attr("selected") !== "selected") {
                                                    var indx = tempBucket.indexOf(newInput.val());
                                                    tempBucket.splice(indx, 1);
                                                }
                                            }

                                            // finally apply
                                            setContextProp(tempBucket);

                                        }

                                    });
                                }
                            }

                            // add
                            el.append(newInput);
                            switch (opts.type) {

                                case "radio":
                                case "checkbox":
                                    {
                                        // ReSharper disable once UsageOfPossiblyUnassignedValue
                                        el.append(newLabel);
                                        break;
                                    }
                                default:
                                    break;
                            }
                            theGroup.push(newInput);
                        }
                    });

                }

                // do select binding
                if (opts.data !== undefined && opts.type === "select") {

                    if (el.data("changed_bound") !== true) {

                        // bind change
                        el.data("changed_bound", true);
                        el.bind("change", function (e) {

                            // denote coming from element event
                            el.data("change_from_element", true);

                            // set model
                            var theDataInner = el.val();
                            setContextProp(
                                theDataInner === "" ? undefined :
                                a.Helpers.IsUndefinedOrNull(theDataInner) ? (opts.multi === true ? [] : undefined) : theDataInner);

                        });

                    }

                    // set model and trigger once!
                    el.data("change_from_element", true);
                    var theData = el.val();
                    setContextProp(
                        theData === "" ? undefined :
                        a.Helpers.IsUndefinedOrNull(theData) ? (opts.multi === true ? [] : undefined) : theData);
                    el.trigger("change");

                }

                // bind overall
                ts.Bind(opts.model, function (newVal) {

                    if (el.data("change_from_element") === true) {
                        el.data("change_from_element", false);
                    } else {
                        theGroup.forEach(function (jEl) {

                            var chekd;
                            if (opts.multi === true) {
                                chekd = !a.Helpers.IsUndefinedOrNull(getContextProp()) && getContextProp().indexOf(jEl.val()) > -1;
                            } else {
                                chekd = getContextProp() == jEl.val();
                            }
                            switch (opts.type) {
                                case "radio":
                                case "checkbox":
                                    {
                                        jEl.checked = chekd;
                                        break;
                                    }
                                case "select":
                                    {
                                        if (chekd === true) {
                                            jEl.attr("selected", "selected");
                                        } else {
                                            jEl.removeAttr("selected");
                                        }
                                    }
                                default:
                                    break;
                            }

                        });
                    }

                    // finally
                    if (!a.Helpers.IsUndefinedOrNull(opts.onChange) && a.Helpers.IsFunc(opts.onChange)) {
                        opts.onChange(getContextProp());
                    }
                });

                //
                return el;
            }

        }

        // set observer
        this.SetObserve = function () {

            // check and change array
            checkAndChangeArrays(ts.Model);

            // set
            Object.observe(ts.Model, function (newVals) {

                ts.RunConditionals();
                doOnObserve(newVals, ts.Model);

            });

            //
            return ts;
        }

        // observer inner
        this.ObserveInnerObject = function (theName) {

            if (ts.InnerObservers[theName] === undefined) {


                // do via eval str
                var outputString = "Object.observe(";
                var modelString = "ts.Model";
                var splt = theName.split(".");
                var joinStr = splt.join(".") + ".";
                for (var i = 0; i < splt.length; i++) {
                    modelString += "['" + splt[i] + "']";
                }
                outputString = "checkAndChangeArrays(" + modelString + ",'" + joinStr + "'); " + outputString;
                outputString += modelString + ", function (newVals) {";
                outputString += "ts.RunConditionals(); doOnObserve(newVals, " + modelString + ", '" + joinStr + "');";
                outputString += "});";


                eval(outputString);

                ts.InnerObservers[theName] = theName;

                return ts;
            }

        }

        // inner observes
        this.InnerObservers = {};

        // conditionals
        this.PresenterConditionals = [];

        // get service
        this.GetService = function (svcName) {
            return a.GetService(svcName);
        }

        // raise event
        this.RaiseEvent = function (evName, obj) {
            a.RaiseEvent(evName, obj);
            return ts;
        }

        // subscribe
        this.SubscribeToEvent = function (evName, func) {
            a.SubscribeToEvent(evName, func);
            return ts;
        }

        // update model
        this.UpdateModel = function (propName, theVal) {

            if (propName.indexOf(".") < 0) {
                ts.Model[propName] = theVal;
            } else {

                var str = "ts.Model";
                propName.split(".").forEach(function (pn) {

                    str += "['" + pn + "']";

                });
                str += " = theVal;";
                eval(str);
            }
        }

        // plugins
        this.Plugins = new a.PluginWrapper(ts);

        // plugins
        this.Conditionals = new a.ConditionalsWrapper(ts);

    };


})(Another);