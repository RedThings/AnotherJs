'use strict';

(function (a) {

    a.PresenterPluginsApp = a.CreateApplication("Another.PresenterPluginsApp");
    (function (ap) {

        // Presenter.Plugins.Click
        ap.AddPresenterPlugin("Click", "onclick", function (theEl, opts, presenter) {

            // check if string
            if (typeof opts.onclick === "string") {

                var evalStr = "opts.onclick = function(e,el) {" +
                   presenter.GetPresenterBasedEvalString("presenter", opts.onclick) +
                "}";



                eval(evalStr);
            }

            // on click
            theEl.on("click", presenter.Container, function (e) {

                e.preventDefault();
                opts.onclick(e, theEl);

            });

        });

        // Presenter.Plugins.Submit
        ap.AddPresenterPlugin("Submit", "onsubmit", function (theForm, opts, presenter) {

            theForm.each(function (i, chld) {
                var child = presenter.DomHelper(chld);
                child.change(function () {
                    theForm.data("isDirty", true);
                });
            });

            // check if string
            if (typeof opts.onsubmit === "string") {
                eval(
                "opts.onsubmit = function(e,el){" +
                   presenter.GetPresenterBasedEvalString("presenter", opts.onsubmit) +
                "}");
            }

            theForm.submit(function (e) {

                e.preventDefault();
                opts.onsubmit(e, theForm);
                return false;

            });

        });

        // IfText
        ap.AddPresenterPlugin("IfText", "fullconditional", function (element, opts, presenter) {

            // from html?
            if (!a.StringIsNullOrEmpty(opts.fullconditional)) {

                // from html
                var spltLeft = opts.fullconditional.split("?");
                opts.propName = a.StripWhitespace(spltLeft[0]);
                var spltRight = spltLeft[1].split(':');
                opts.trueState = a.StripWhitespace(spltRight[0]);
                opts.trueState = a.ReplaceAll(opts.trueState, "'", "");
                opts.trueState = a.ReplaceAll(opts.trueState, "\"", "");
                opts.falseState = a.StripWhitespace(spltRight[1]).replace("'", "").replace("\"", "");
                opts.falseState = a.ReplaceAll(opts.falseState, "'", "");
                opts.falseState = a.ReplaceAll(opts.falseState, "\"", "");

            }

            // now add observe
            presenter.ObserveChange(opts.propName, function (newVal) {
                var txt = newVal === true ? opts.trueState : opts.falseState;
                element.html(txt);
            });

        });

        // Presenter.Plugins.Repeater
        ap.AddPresenterPlugin("Repeater", "data", function (element, opts, presenter) {

            // create repeater
            var rpt = new a.Repeater(element, opts, presenter);
            // go
            rpt.Initialize();

        });



    })(a.PresenterPluginsApp);

    // repeater ui
    a.Repeater = function (element, opts, presenter) {

        // self
        var ts = this;

        // construct
        var construct = function () {

            // set simple ones
            ts.Presenter = presenter;
            ts.Element = element;
            ts.ParentElement = element.parent();
            ts.ClonedHtml = element[0].outerHTML;
            ts.Presenter = presenter;
            ts.OnRowBinding = opts.onRowBinding;

            // set data
            ts.Data = undefined;
            var splt = opts.data.split(" ");
            if (splt[1] !== "in")
                throw new Error("Repeater options.data must be in the format '[alias] in [property]'");
            ts.RowAlias = splt[0];
            ts.FullName = presenter.GetFullName(splt[2]);
            ts.Data = presenter.GetPresenterValue(ts.FullName);

            // do checks
            if (ts.Data.toString() !== "Another.ObservableArray") {
                if (a.IsArray(ts.Data)) {
                    presenter.ConvertToObservableArray(ts.FullName, ts.Data);
                    ts.Data = presenter.GetPresenterValue(ts.FullName);
                } else {
                    throw new Error("Another.Repeater data must be Another.ObservableArray or Array");
                }
            }
            if (typeof ts.OnRowBinding === "string") {
                eval("ts.OnRowBinding = function(el,data){ " + presenter.GetPresenterBasedEvalString("presenter", ts.FullName) + " }");
            }
            if (ts.OnRowBinding === undefined) {
                ts.OnRowBinding = function (){}
            }

            // subscribe
            ts.Data.subscribeToChanges(function (changeName, args) {

                switch (changeName) {
                    case "push":
                        {
                            var val = args[0];
                            ts.AddNewElement(val);
                            break;
                        }
                    case "pop":
                        {
                            ts.RemoveLastElement();
                            break;
                        }
                    case "reverse":
                        {
                            ts.ReverseElements();
                            break;
                        }
                    case "splice":
                        {
                            var strt = args[0];
                            if (strt === undefined) {
                                ts.RemoveAllElements();
                            } else {
                                ts.SpliceElements(args);
                            }
                            break;
                        }

                    case "shift":
                        {
                            ts.RemoveFirstElement();
                            break;
                        }
                    case "unshift":
                        {
                            ts.AddElementsInFront(args);
                            break;
                        }
                    default:
                        break;
                }

            });

            // observe
            ts.Presenter.DomHelper.each(ts.Data, function(dCount, d) {
                var obsName = ts.FullName + "[" + dCount + "]";
                ts.Presenter.ObserveChange(obsName, function (row, name, newVal) {
                    ts.OnRowChanged(dCount, row, name, newVal);
                });
            });
            

        };

        // construct
        construct();

        // first run
        this.Initialize = function () {

            // init
            ts.Data.forEach(function (d) {
                ts.AddNewElement(d, true);
            });
            this.firstBindingComplete = true;

        };

        // on row change
        ts.OnRowChanged= function(indx, dataRow, propName, propVal) {
            console.log("this[" + indx + "] changed property " + propName + " to " + propVal + ". Row data now: ", dataRow);
        }

        // get element
        this.CreateElement = function() {
            var newEl = ts.Presenter.DomHelper(ts.ClonedHtml);
            newEl.removeAttr("id");
            return newEl;
        };

        // add new element
        this.AddNewElement = function (rowVal, override) {

            if (override || this.firstBindingComplete === true) {

                // create new
                var newEl = ts.CreateElement();

                // append
                ts.ParentElement.append(newEl);

                // fire binding
                ts.OnRowBinding(newEl, rowVal);

                // show
                newEl.show();
            }
        }

        // reverse
        this.ReverseElements = function () {
            var childrn = ts.prnt.children();
            for (var i = 0; i < childrn.length; i++) {

                ts.prnt.prepend(childrn[i]);
            }
        }

        // pop
        this.RemoveLastElement = function () {
            ts.prnt.children().last().remove();
        };

        // shift
        this.RemoveFirstElement = function () {
            ts.prnt.children().first().remove();
        };

        // splice()
        this.RemoveAllElements = function () {
            ts.prnt.children().remove();
        };

        // unshift
        this.AddElementsInFront = function (args) {

            // find el to put before
            var childrn = ts.prnt.children();
            var elBefore = ts.prsnt.DomHelper(childrn.get(0));

            // iterate args
            for (var arg = 0; arg < args.length; ++arg) {
                var d = args[arg];
                var newEl = ts.CreateElement();
                ts.opts.onRowBinding(newEl, d);
                newEl.show();

                if (elBefore.length < 1) {
                    ts.prnt.append(newEl);
                } else {

                    if (arg === 0) {

                        elBefore.before(newEl);
                    } else {
                        elBefore.after(newEl);
                    }

                }
                elBefore = newEl;
            }
        }

        // splice
        this.SpliceElements = function (args) {

            // get vars
            var indx = args[0];
            var count = args[1];
            var childrn = ts.prnt.children();
            var lastIndex = indx + (count - 1);

            // add remove class
            childrn.each(function (ii, ch) {

                if (ii >= indx && ii <= lastIndex) {
                    ts.prsnt.DomHelper(ch).addClass("tbm___");
                }

            });

            // remove
            var toRemove = ts.prnt.find(".tbm___");
            toRemove.remove();

            // find el to put after
            var elBefore = ts.prsnt.DomHelper(childrn.get(indx - 1));

            // iterate args
            for (var arg = 2; arg < args.length; ++arg) {
                var d = args[arg];
                var newEl = ts.CreateElement();
                ts.opts.onRowBinding(newEl, d);
                newEl.show();
                if (elBefore.length < 1) {
                    ts.prnt.append(newEl);
                } else {
                    elBefore.after(newEl);
                }
                elBefore = newEl;
            }
        }
    };

})(Another);