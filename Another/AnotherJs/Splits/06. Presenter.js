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

            //if (str.indexOf("{row})") > -1) debugger;

            // set str
            str = ts.GetUnaliasedString(str, obj, spltStringArr);

            // output
            var output = undefined;

            // try evals
            try {
                eval("output = " + str);
            } catch (err) {
                //if (window.location.toString().indexOf("localhost") > -1)
                // console.log("Error evaluating " + str + ": ",err);
            }

            // 
            return output;

        }
        this.EvalSet = function (str, val) {

            str = ts.GetUnaliasedString(str);
            try {
                eval(str + " = val;");
            } catch (err) {
                //if (window.location.toString().indexOf("localhost") > -1)
                //console.log("Error evaluating " + str);// + ": ",err);
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
                    str = a.ReplaceAll(str, key, "obj['" + key + "']");
                });
            }

            return str;

        };
        this.SplitAliasedString = function (str, includeMethods) {

            // get from cache
            var output = _splits[str];

            // check
            if (output === undefined) {

                // example '{Model}.ShowSomething != {Data}.FuckOff || false'
                // should return ["{Model}.ShowSomething","{Data}.FuckOff"]
                //str = '{Model}.ShowSomething.Cock({e},{el}) != {Data}.FuckOff || false';
                //includeMethods = true;
                //if (ts.Aliases.filter(function(x) { return x.alias === "{row}"; }).length > 0) debugger;

                // loop aliases
                var match;
                var matcher;
                var matchStr;
                var matches = [];
                ts.Aliases.forEach(function (aliasObj) {
                    //if (/*str.indexOf("{row}.ReadOnly") > -1 &&*/ aliasObj.alias === "{row}") console.log(str);
                    matchStr = aliasObj.alias + (includeMethods ? "[^\\s\\*\\/\\%\\!\\=\\|\\+\\-]*" : "[^\\s\\*\\/\\%\!\\=\\|\\+\\-\\(]*");
                    //matchStr = "{row}[^ \*\/%!=|+-\(]*";
                    matcher = new RegExp(matchStr);
                    match = matcher.exec(str);
                    if (!a.IsUndefinedOrNull(match)) {
                        matches.push(match);
                    }
                });
                output = matches.map(function (m) {
                    return a.StripWhitespace(m[0]);
                });
                _splits[str] = output;
            }

            return output;
        }
        var _splits = {};

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
        var checkForArraysAndOrObjectsToBind = function (aliasedName, propName, obj) {

            // start
            var childPropName = propName;

            // try parse num
            if (!isNaN(propName)) {
                childPropName = "[" + childPropName + "]";
            } else {
                childPropName = "." + childPropName;
            }

            // GETTING RID OF THIS - LEGACY - [] - go away
            if (childPropName.indexOf("[") < 0) {
                
                // childname
                var childName = aliasedName + childPropName;

                // array?
                if (ts.ShouldBeObservableArray(obj)) {
                    var theArray = ts.Eval(childName);
                    ts.ConvertToObservableArray(childName, theArray);
                }

                // object
                if (typeof obj === "object") {

                    ts.Observe(childName);

                }

            }

        }
        var onObjectChanged = function (aliasedName, changedValues) {
            console.log(aliasedName + " changed. ", changedValues);
            // add
            changedValues.forEach(function (vl) {

                // new val
                var newVal = vl.object[vl.name];

                // check if add
                if (vl.type === "add") {

                    // check
                    checkForArraysAndOrObjectsToBind(aliasedName, vl.name, newVal);
                }

                // get name that would be in ts.ChangeObservers;
                var changeObserversKey = aliasedName + "." + vl.name;

                // find in observers
                var found = ts.ChangeObservers.filter(function (co) {
                    return co.aliasedName == changeObserversKey;
                }).sort(a.OrderSort);
                found.forEach(function (f) {

                    f.changeFunc(newVal);

                });

                //// find by parent
                //var parentObj = ts.Eval(aliasedName);
                //var found2 = ts.ChangeObservers.filter(function (co) {
                //    return co.aliasedName == aliasedName;
                //}).sort(a.OrderSort);
                //found2.forEach(function (f) {

                //    f.changeFunc(parentObj, vl.name, newVal);

                //});



            });

        }
        this.ConvertToObservableArray = function (aliasedName, arr) {

            var newArr = new a.ObservableArray();
            newArr.initialize(aliasedName, arr);
            ts.EvalSet(aliasedName, newArr);
            return newArr;

        }
        this.ObserveChange = function (executionOrder, aliasedName, changeFunc) {

            if (a.StringIsNullOrEmpty(aliasedName) || !a.IsFunc(changeFunc)) return;

            // get chunks
            var chunks = ts.SplitAliasedString(aliasedName, false);

            // check children
            //ts.ChildPresenters.forEach(function (ch) {
            //    var chChunks = ch.SplitAliasedString(aliasedName, false);
            //    if (chChunks.length > 0) {
            //        chunks.concat(chChunks);
            //    }
            //});

            //loop
            chunks.forEach(function (ch) {
                ts.ChangeObservers.push({ aliasedName: ch, changeFunc: changeFunc, order: executionOrder });
                ts.ChildPresenters.forEach(function (ch2) {
                    ch2.ChangeObservers.push({ aliasedName: ch, changeFunc: changeFunc, order: executionOrder });
                });
            });

            //var initVal = ts.Eval(aliasedName);
            //changeFunc(initVal);

        }
        this.ChangeObservers = [];
        this.ChildPresenters = [];
        this.ParentPresenter = undefined;
        this.ForceObserve = function () {

            // find in observers
            var found = ts.ChangeObservers;
            //var foundParents = ts.ParentPresenter === undefined ? []: ts.ParentPresenter.ChangeObservers;
            //var foundChildren = [];
            //ts.ChildPresenters.forEach(function (ch) {
            //    var foundChildrenInner = ch.ChangeObservers;
            //    foundChildrenInner.forEach(function (inn) {
            //        foundChildren.push(inn);
            //    });
            //});

            // final
            var finalArr =
                found;
            //.concat(foundParents)
            //.concat(foundChildren)
            //.sort(a.OrderSort);

            // loop
            finalArr.forEach(function (obsObj) {
                var theVal = ts.Eval(obsObj.aliasedName);
                obsObj.changeFunc(theVal);
            });
        }

        // initialize dom
        this.InitializeDom = function (domContext) {

            inspectElement(domContext[0]);

        }
        var inspectElement = function (el) {

            // jQuery el
            var jEl = ts.DomHelper(el);

            // recurse?
            var shouldRecurse = true;

            // ordered plugins
            var orderedPlugins = a.GetPluginsAsArrayOrdered();

            // look at presenters
            orderedPlugins.forEach(function (plugin) {
                //ts.DomHelper.each(a.Plugins, function (pluginName, plugin) {

                // vars
                var attrName = plugin.attrName;

                // get attr
                var attr = el.attributes[attrName];

                // check
                if (attr !== undefined) {

                    // init
                    initializeElement(jEl, el, plugin.name, attrName);

                    // set recurse
                    if (a.IsExcludedFromDomTraversal(attrName)) {
                        shouldRecurse = false;
                    }
                }
            });

            // check
            if (shouldRecurse === true) {
                jEl.children().each(function (iii, elelel) {
                    inspectElement(elelel);
                });
            }

        }
        var initializeElement = function (jEl, el, pluginName, attrName) {

            // attrs
            var opts = {};

            // set wrapperPropName in opts
            var finalVal = jEl.attr(attrName);
            opts.main = finalVal;

            // remove attr
            jEl.removeAttr(attrName);

            // set other attributes
            ts.DomHelper.each(el.attributes, function (ai, attr) {

                if (a.StartsWith(attr.name, attrName)) {
                    opts[attr.name.replace(attrName + "-", "")] = attr.value;
                }
            });

            // call presenter.plugins[pluginName](el, opts)
            ts.Plugins[pluginName](jEl, opts);
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