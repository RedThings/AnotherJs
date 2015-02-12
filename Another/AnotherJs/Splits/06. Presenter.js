'use strict';

(function (a) {

    // presenter class
    a.AnotherPresenter = function (name, container) {

        // this
        var ts = this;

        //
        this.Name = name;

        // container
        this.Container = container;

        // dom helper
        this.DomHelper = a.GetDependency("DomHelper");

        // check
        if (a.IsUndefinedOrNull(container) || container.length < 1)
            throw new Error("Presenter: container must be at least one element");

        // element
        this.Element = function (selector) {
            var output = ts.Container.find(selector);
            if (output.length < 1) {
                output = ts.DomHelper("<div />");
            }
            return output;
        }

        // helpers
        this.ShouldBeObservableArray = function (obj) {
            return a.IsArray(obj) && obj.toString() !== "Another.ObservableArray";
        }
        this.Aliases = [];
        this.AddAlias = function (alias, realValStr) {
            
            // add
            alias = "{" + alias + "}";

            // add to collection
            ts.Aliases.push({ alias: alias, str: realValStr });

        }
        this.Eval = function (str, obj, spltStringArr) {
            
            // set str
            str = ts.GetUnaliasedString(str, obj, spltStringArr);

            // output
            var output = undefined;

            // try evals
            try {
                eval("output = " + str);
            } catch (err) {
                if (window.location.toString().indexOf("localhost") > -1)
                    console.log("Error evaluating " + str + ": ",err);
            }

            // 
            return output;

        }
        this.EvalSet=function(str, val) {
            
            str = ts.GetUnaliasedString(str);
            try {
                eval(str + " = val;");
            } catch (err) {
                if (window.location.toString().indexOf("localhost") > -1)
                    console.log("Error evaluating " + str);// + ": ",err);
            }
        }
        this.GetUnaliasedString = function (str, obj, spltStringArr) {
            
            // check
            var includeMethods = false;
            if (str.indexOf("(") > -1 && str.indexOf(")") > -1) {
                includeMethods = true;
            }

            // sort params
            if (spltStringArr === undefined && a.IsArray(obj)) {
                spltStringArr = obj;
                obj = undefined;
            }
            if (spltStringArr === undefined) {
                spltStringArr = ts.SplitAliasedString(str, includeMethods);
            }

            // now find and replace chunks with ts
            // ReSharper disable once QualifiedExpressionMaybeNull
            spltStringArr.forEach(function (match) {
                str = a.ReplaceAll(str, match, "ts." + match);
            });


            // now replace aliases
            ts.Aliases.forEach(function (alias) {

                str = a.ReplaceAll(str, alias.alias, alias.str);

            });

            // now loop obj
            if (!a.IsUndefinedOrNull(obj) && typeof obj === "object") {
                ts.DomHelper.each(obj, function (key) {
                    str = a.ReplaceAll(str, key, "obj[" + key + "]");
                });
            }

            return str;

        };
        this.SplitAliasedString = function (str, includeMethods) {

            // example '{Model}.ShowSomething != {Data}.FuckOff || false'
            // should return ["{Model}.ShowSomething","{Data}.FuckOff"]
            // str = '{Model}.ShowSomething != {Data}.FuckOff || false';


            // loop aliases
            var match;
            var matcher;
            var matches = [];
            ts.Aliases.forEach(function (aliasObj) {

                matcher = new RegExp(aliasObj.alias + (includeMethods ? "[^\s\*\/%!=|+-]*" : "[^(\s\*\/%!=|+-]*"));
                match = matcher.exec(str);
                if (!a.IsUndefinedOrNull(match)) {
                    matches.push(match);
                }


            });
            return matches.map(function (m) {
                return m[0];
            });
        }

        // observe and object
        this.Observe = function (aliasedName) {
            if (aliasedName.indexOf("{") < 0 || aliasedName.indexOf("}") < 0) {
                aliasedName = a.ReplaceAll(aliasedName, "{", "");
                aliasedName = a.ReplaceAll(aliasedName, "}", "");
                aliasedName = "{" + aliasedName + "}";
            }
            // get object strings
            var objStrings = ts.SplitAliasedString(aliasedName);

            // loop
            objStrings.forEach(function (str) {
                
                // get obj
                var obj = ts.Eval(str, objStrings);

                // check if exists, then carry on
                if (!(a.IsUndefinedOrNull(obj) || typeof obj !== "object")) {

                    // check
                    var exists = !a.IsUndefinedOrNull(_alreadyObserving[str]);
                    if (!exists) {

                        // observe
                        Object.observe(obj, function (vals) {
                            onObjectChanged(str, vals);

                        });

                        // add to observing list
                        _alreadyObserving[str] = obj;

                        // next, check for arrays and other objects
                        ts.DomHelper.each(obj, function (key, innerObj) {

                            checkForArraysAndOrObjectsToBind(str, key, innerObj);

                        });

                    }

                }

            });



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
        var onObjectChanged = function (fullName, changedValues) {
            
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
                var parentObj = ts.Eval(fullName);
                var found2 = _changeObservers.filter(function (co) {
                    return co.fullName == fullName;
                });
                found2.forEach(function (f) {

                    f.changeFunc(parentObj, vl.name, newVal);

                });



            });

        }
        this.ConvertToObservableArray = function (fullname, arr) {

            var newArr = new a.ObservableArray();
            newArr.initialize(fullname, arr);
            ts.EvalSet(fullname,newArr);
            //eval(ts.GetPresenterBasedEvalString("ts", fullname) + " = newArr;");
            return newArr;

        }
        this.ObserveChange = function (fullname, changeFunc) {
            
            // get chunks
            var chunks = ts.SplitAliasedString(fullname, false);
            //loop
            chunks.forEach(function(ch) {
                _changeObservers.push({ fullName: ch, changeFunc: changeFunc });
            });
        }
        var _changeObservers = [];


        // initialize dom
        this.InitializeDom = function (domContext) {

            // look at presenters
            ts.DomHelper.each(a.Plugins, function (pluginName, plugin) {

                // vars
                var attrName = plugin.attrName;
                var selector = "[" + attrName + "]";

                // inspect dom
                domContext.find(selector).each(function (i, el) {

                    // jQuery el
                    var jEl = ts.DomHelper(el);

                    // attrs
                    var opts = {};
                    ts.DomHelper.each(el.attributes, function (ai, attr) {
                        if (a.StartsWith(attr.name, attrName) && attr.name !== attrName) {
                            opts[attr.name.replace(attrName, "")] = attr.value;
                        }
                    });

                    // set wrapperPropName in opts
                    var finalVal = jEl.attr(attrName);
                    opts.main = finalVal;

                    // call presenter.plugins[pluginName](el, opts)
                    ts.Plugins[pluginName](jEl, opts);

                });

            });

        }


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

    };


})(Another);