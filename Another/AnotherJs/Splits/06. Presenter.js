'use strict';

(function (a) {

    // presenter class
    a.AnotherPresenter = function (name, model, container) {

        // this
        var ts = this;

        // check
        if (a.IsUndefinedOrNull(container) || container.length < 1)
            throw new Error("Presenter: container must be at least one element");

        // dom helper
        this.DomHelper = a.GetDependency("DomHelper");

        // container
        this.Container = container;

        // element
        this.Element = function (selector) {
            var output = ts.Container.find(selector);
            if (output.length < 1) {
                output = ts.DomHelper("<div />");
            }
            return output;
        }

        // model
        this.Model = model;



        // helpers
        this.GetParentName = function (fullName) {
            var nm = a.GetFullName(fullName);
            var splt = nm.split(".");
            splt.pop();
            return splt.join(".");
        }
        this.GetChildName = function (fullName) {
            var nm = a.GetFullName(fullName);
            var splt = nm.split(".");
            return splt[splt.length - 1];
        }
        this.GetFullName = function (str) {
            str = a.ReplaceAll(str, "{Presenter}", "");
            str = a.ReplaceAll(str, "{Model}", "Model");
            str = a.ReplaceAll(str, "{Ui}", "Model.Ui");
            str = a.ReplaceAll(str, "{Data}", "Model.Data");
            str = a.ReplaceAll(str, "{Form}", "Model.Form");
            return str;
        }
        this.GetPresenterBasedEvalString = function (presenterAlias, str) {
            
            // simple
            var replaced = ts.GetFullName(str);
            var output = a.ReplaceAll(replaced, "Model", presenterAlias + ".Model");
            if (a.StartsWith(output, ".")) return presenterAlias + output;

            // var with props
            var chnk1 = output.split(".")[0];
            var isAddedProp = ts.AddedProperties.filter(function (pr) { return pr === chnk1; }).length > 0;
            if (isAddedProp)
                return presenterAlias + "." + output;

            // finally
            return output;

        }
        this.GetPresenterValue = function (fullName) {
            
            try {
                var evalStr = ts.GetPresenterBasedEvalString("ts", fullName);
                var output = undefined;
                eval("output = " + evalStr + ";");
                return output;
            } catch (err) {
                return undefined;
            }
        };
        this.SetPresenterValue = function (fullName, val) {
            
            try {
                var evalStr = ts.GetPresenterBasedEvalString("ts", fullName);
                eval(evalStr + " = val");
                
            } catch (err) {
                console.log(err);
            }
        };
        this.ShouldBeObservableArray = function (obj) {
            return a.IsArray(obj) && obj.toString() !== "Another.ObservableArray";
        }
        this.AddedProperties = [];
        this.AddProperty = function(nm, val) {
            ts[nm] = val;
            ts.AddedProperties.push(nm);
        }

        // observe and object
        this.Observe = function (preOrFullName) {

            // get full name
            var fullName = ts.GetFullName(preOrFullName);

            // get object
            var obj = ts.GetPresenterValue(fullName);

            // check if exists, then carry on
            if (!(a.IsUndefinedOrNull(obj) || typeof obj !== "object")) {

                // check
                var exists = !a.IsUndefinedOrNull(_alreadyObserving[fullName]);
                if (!exists) {

                    // observe
                    Object.observe(obj, function (vals) {

                        ts.OnObjectChanged(fullName, vals);

                    });

                    // add to observing list
                    _alreadyObserving[fullName] = obj;
                    //console.log("Observing ", fullName);

                    // next, check for arrays and other objects
                    ts.DomHelper.each(obj, function (key, innerObj) {

                        checkForArraysAndOrObjectsToBind(fullName, key, innerObj);

                    });

                }

            }



        }
        var _alreadyObserving = {};
        var checkForArraysAndOrObjectsToBind = function (fullName, propName, obj) {

            // start
            var childPropName = propName;

            // try parse num
            if (!isNaN(propName)) {
                childPropName = "[" + childPropName + "]";
            } else {
                childPropName = "." + childPropName;
            }

            // childname
            var childName = fullName + childPropName;

            // array?
            if (ts.ShouldBeObservableArray(obj)) {

                var childObj = undefined;
                ts.ConvertToObservableArray(childName, childObj);
            }

            // object
            if (typeof obj === "object") {

                ts.Observe(childName);

            }

        }
        this.OnObjectChanged = function (fullName, changedValues) {


            // add
            changedValues.forEach(function (vl) {

                // new val
                var newVal = vl.object[vl.name];

                // check if add
                if (vl.type === "add") {

                    // check
                    checkForArraysAndOrObjectsToBind(fullName, vl.name, newVal);
                }

                // get name that would be in _changeObservers;
                var changeObserversKey = fullName + "." + vl.name;

                // find in observers
                var found = _changeObservers.filter(function (co) {
                    return co.fullName == changeObserversKey;
                });
                found.forEach(function (f) {

                    f.changeFunc(newVal);

                });

                // find by parent
                var parentObj = ts.GetPresenterValue(fullName);
                var found2 = _changeObservers.filter(function (co) {
                    return co.fullName == fullName;
                });
                found2.forEach(function (f) {

                    f.changeFunc(parentObj, vl.name, newVal);

                });



            });

            // now run other stuff
            ts.RunConditionals();

        }
        this.ConvertToObservableArray = function (fullname, arr) {

            var newArr = new a.ObservableArray();
            newArr.initialize(fullname, arr);
            eval(ts.GetPresenterBasedEvalString("ts", fullname) + " = newArr;");
            return newArr;

        }
        this.ObserveChange = function (fullname, changeFunc) {
            fullname = ts.GetFullName(fullname);
            _changeObservers.push({ fullName: fullname, changeFunc: changeFunc });
        }
        var _changeObservers = [];


        // initialize dom
        this.InitializeDom = function (domContext) {

            // look at presenters
            ts.DomHelper.each(a.PresenterPlugins, function (pluginName, plugin) {

                // vars
                var nmLower = pluginName.toLowerCase();
                var attrName = "an-" + nmLower;
                var selector = "[" + attrName + "]";

                // inspect dom
                domContext.find(selector).each(function (i, el) {

                    // jQuery el
                    var jEl = ts.DomHelper(el);

                    // attrs
                    var opts = {};
                    ts.DomHelper.each(el.attributes, function (ai, attr) {
                        var fv = ts.GetFullName(attr.value);
                        if (a.StartsWith(attr.name, "an-" + nmLower) && attr.name !== "an-" + nmLower) {
                            opts[attr.name.replace("an-" + nmLower + "-", "")] = fv;
                        }
                    });

                    // find the plugin object in global list
                    var foundPlugin = a.PresenterPlugins[pluginName];

                    // set wrapperPropName in opts
                    if (!(a.IsUndefinedOrNull(foundPlugin.wrapperProp))) {
                        var finalVal = ts.GetFullName(jEl.attr("an-" + nmLower));
                        opts[foundPlugin.wrapperProp] = finalVal;
                    }

                    // call presenter.plugins[pluginName](el, opts)
                    ts.Plugins[pluginName](jEl, opts);

                });

            });

            // look at conditionals
            ts.DomHelper.each(a.PresenterConditionals, function (cdName, cd) {

                // vars
                var nmLower = cdName.toLowerCase();
                var attrName = "an-" + nmLower;
                var selector = "[" + attrName + "]";

                // inspect dom
                domContext.find(selector).each(function (i, el) {

                    // jQuery el
                    var jEl = ts.DomHelper(el);

                    // attrs
                    var evalStr = ts.GetPresenterBasedEvalString("ts", jEl.attr("an-" + nmLower));
                    var evalBoolFunc;
                    var finalEvalStr = "evalBoolFunc = function(){" +
                        "return " + evalStr + " || false;" +
                        "};";
                    eval(finalEvalStr);

                    ts.PresenterConditionals.push({ name: cdName, element: jEl, boolCallback: evalBoolFunc, conditional: cd });

                });

            });

        }

        // run conditionals
        this.RunConditionals = function () {

            // look for conditionals
            ts.PresenterConditionals.forEach(function (cd) {

                var res = cd.boolCallback();
                cd.conditional(cd.element, res);

            });


        };



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



        // plugins
        this.Plugins = new a.PluginWrapper(ts);


        // conditionals
        this.Conditionals = new a.ConditionalsWrapper(ts);

    };


})(Another);