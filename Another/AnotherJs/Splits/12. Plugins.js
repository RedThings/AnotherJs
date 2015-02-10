'use strict';

(function (a) {

    a.PresenterPluginsApp = a.CreateApplication("Another.PresenterPluginsApp");
    (function (ap) {

        // Presenter.Plugins.Model
        ap.AddPresenterPlugin("AnModel", "model", function (theEl, opts, presenter) {

            // get value
            var theVal = presenter.GetPresenterValue(opts.model);

            // change
            presenter.ObserveChange(opts.model, function (newVal) {

                // set
                if (theEl.data("change_from_element") !== true) {
                    theEl.html(newVal);
                    theEl.val(newVal);
                } else {
                    theEl.data("change_from_element", false);
                }

            });

            // evName
            var evName = undefined;
            var tagName = theEl[0].tagName;
            switch (tagName) {
                case "TEXTAREA":
                    {
                        evName = "keyup";
                        break;
                    }
                case "INPUT":
                    {
                        if (theEl.attr("type") !== "submit") evName = "keyup";
                        break;
                    }
                default:
                    break;

            }


            // bind
            theEl.bind("change", function (e) {
                theEl.data("change_from_element", true);
                presenter.SetPresenterValue(opts.model, theEl.val());
            });
            if (evName !== undefined) {
                theEl.bind(evName, function (e) {
                    theEl.data("change_from_element", true);
                    presenter.SetPresenterValue(opts.model, theEl.val());
                });
            }

            // init
            theEl.html(theVal);
            theEl.val(theVal);

        });

        // Presenter.Plugins.Click
        ap.AddPresenterPlugin("AnClick", "onclick", function (theEl, opts, presenter) {

            // on click
            theEl.on("click", presenter.Container, function (e) {

                e.preventDefault();
                presenter.Eval(opts.onclick, { "{e}": e, "{el}": theEl });

            });

        });

        // Presenter.Plugins.Submit
        ap.AddPresenterPlugin("AnSubmit", "onsubmit", function (theForm, opts, presenter) {

            theForm.each(function (i, chld) {
                var child = presenter.DomHelper(chld);
                child.change(function () {
                    theForm.data("isDirty", true);
                });
            });

            theForm.submit(function (e) {

                e.preventDefault();
                presenter.Eval(opts.onsubmit, { "{e}": e, "{el}": theForm });
                return false;

            });

        });

        // IfText
        ap.AddPresenterPlugin("AnIftext", "condition", function (element, opts, presenter) {

            // from html
            var spltLeft = opts.condition.split("?");
            opts.propName = a.StripWhitespace(spltLeft[0]);
            var spltRight = spltLeft[1].split(':');
            opts.trueState = a.StripWhitespace(spltRight[0]);
            opts.trueState = a.ReplaceAll(opts.trueState, "'", "");
            opts.trueState = a.ReplaceAll(opts.trueState, "\"", "");
            opts.falseState = a.StripWhitespace(spltRight[1]).replace("'", "").replace("\"", "");
            opts.falseState = a.ReplaceAll(opts.falseState, "'", "");
            opts.falseState = a.ReplaceAll(opts.falseState, "\"", "");

            // now add observe
            presenter.ObserveChange(opts.propName, function (newVal) {
                var txt = newVal === true ? opts.trueState : opts.falseState;
                element.html(txt);
            });

        });

        // show
        ap.AddPresenterPlugin("AnShow", "condition", function(element, opts, presenter) {

            presenter.ObserveChange(opts.condition, function(newVal) {

                if (newVal === true) {
                    element.show();
                } else {
                    element.hide();
                }
                
            });

        });

        // enable
        ap.AddPresenterPlugin("AnEnable", "condition", function (element, opts, presenter) {
            
            presenter.ObserveChange(opts.condition, function (newVal) {
                if (newVal === true) {
                    element.removeAttr("disabled");
                } else {
                    element.attr("disabled","disabled");
                }
            });

        });

        // Presenter.Plugins.Repeater
        ap.AddPresenterPlugin("AnRepeater", "data", function (element, opts, presenter) {

            // create repeater
            var rpt = new ap.Repeater(element, opts, presenter);

            // go
            rpt.Initialize();

        });

        // repeater ui
        ap.Repeater = function (element, opts, presenter) {

            // self
            var ts = this;

            // construct
            var construct = function () {

                // set simple ones
                ts.Presenter = presenter;
                ts.ParentElement = element.parent();
                ts.ClonedHtml = element[0].outerHTML;
                element.remove();
                ts.Presenter = presenter;
                ts.OnRowBinding = opts.onRowBinding;

                // set data
                ts.Data = undefined;
                var splt = opts.data.split(" ");
                if (splt[1] !== "in")
                    throw new Error("Repeater options.data must be in the format '[alias] in [property]'");
                ts.RowAlias = splt[0];
                ts.FullName = presenter.GetFullName(splt[2]);
                ts.Data = presenter.Eval(ts.FullName);

                // do checks
                if (ts.Data.toString() !== "Another.ObservableArray") {
                    if (a.IsArray(ts.Data)) {
                        presenter.ConvertToObservableArray(ts.FullName, ts.Data);
                        ts.Data = presenter.Eval(ts.FullName);
                    } else {
                        throw new Error("Another.Repeater data must be an Array or an Another.ObservableArray");
                    }
                }
                if (typeof ts.OnRowBinding === "string") {
                    eval("ts.OnRowBinding = function(el,data,rowPresenter){ " + presenter.GetPresenterBasedEvalString("presenter", ts.FullName) + " }");
                }
                if (ts.OnRowBinding === undefined) {
                    ts.OnRowBinding = function () { }
                }

                // subscribe
                ts.Data.subscribeToChanges(function (changeName, args) {

                    switch (changeName) {
                        case "push":
                            {
                                var val = args[0];
                                var indx = ts.ParentElement.children().length;
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


            };

            // construct
            construct();

            // first run
            this.Initialize = function () {

                // init
                ts.Presenter.DomHelper.each(ts.Data, function (indx, d) {
                    ts.AddNewElement(d, true);
                });
                this.firstBindingComplete = true;

            };

            // on row change
            this.OnRowChanged = function (dataRow, propName, propVal) {
                //console.log("Changed property " + propName + " to " + propVal + ". Row data now: ", dataRow);
            }

            // create
            this.CreateElement = function (rowVal, callback) {

                // get id
                var id = a.GetRandom(true);

                // create new
                var newEl = ts.Presenter.DomHelper(ts.ClonedHtml);
                newEl.hide();

                // add id
                newEl.attr("id", id);

                // create presenter
                var pName = ts.CreatePresenter();

                // get model
                var mdl = ts.Presenter.Model;

                // indx
                ap.InitializePresenter(pName, newEl, mdl, function (p) {

                    p.AddProperty(ts.RowAlias, rowVal);
                    p.Observe(ts.RowAlias);

                }, function (p) {

                    // fire binding
                    ts.OnRowBinding(newEl, rowVal, p);

                    // show
                    newEl.show();

                    // check
                    if (a.IsFunc(callback)) callback(newEl);
                });

            }

            // add new element
            this.AddNewElement = function (rowVal, override) {

                if (override || this.firstBindingComplete === true) {
                    ts.CreateElement(rowVal, function (el) {
                        ts.ParentElement.append(el);
                    });
                }
            }

            // presenterName
            this.CreatePresenter = function () {

                // get name
                var pName = "___rpt_" + a.GetRandom(true);

                // create
                ap.CreatePresenter(pName, function (p) { });

                //
                return pName;

            };

            // reverse
            this.ReverseElements = function () {
                var childrn = ts.ParentElement.children();
                for (var i = 0; i < childrn.length; i++) {

                    ts.ParentElement.prepend(childrn[i]);
                }
            }

            // pop
            this.RemoveLastElement = function () {
                ts.ParentElement.children().last().remove();
            };

            // shift
            this.RemoveFirstElement = function () {
                ts.ParentElement.children().first().remove();
            };

            // splice()
            this.RemoveAllElements = function () {
                ts.ParentElement.children().remove();
            };

            // unshift
            this.AddElementsInFront = function (args) {

                // find el to put before
                var childrn = ts.ParentElement.children();
                var elBefore = ts.Presenter.DomHelper(childrn.get(0));

                // iterate args
                for (var arg = 0; arg < args.length; ++arg) {
                    var d = args[arg];
                    ts.CreateElement(d, function (newEl) {
                        newEl.show();

                        if (elBefore.length < 1) {
                            ts.ParentElement.append(newEl);
                        } else {

                            if (arg === 0) {

                                elBefore.before(newEl);
                            } else {
                                elBefore.after(newEl);
                            }

                        }
                        elBefore = newEl;

                    });
                }
            }

            // splice
            this.SpliceElements = function (args) {

                // get vars
                var indx = args[0];
                var count = args[1];
                var childrn = ts.ParentElement.children();
                var lastIndex = indx + (count - 1);

                // add remove class
                childrn.each(function (ii, ch) {

                    if (ii >= indx && ii <= lastIndex) {
                        ts.Presenter.DomHelper(ch).addClass("tbm___");
                    }

                });

                // remove
                var toRemove = ts.ParentElement.find(".tbm___");
                toRemove.remove();

                // find el to put after
                var elBefore = ts.Presenter.DomHelper(childrn.get(indx - 1));

                // iterate args
                for (var arg = 2; arg < args.length; ++arg) {
                    var d = args[arg];
                    var newEl = ts.CreateElement();
                    ts.opts.onRowBinding(newEl, d);
                    newEl.show();
                    if (elBefore.length < 1) {
                        ts.ParentElement.append(newEl);
                    } else {
                        elBefore.after(newEl);
                    }
                    elBefore = newEl;
                }
            }
        };

    })(a.PresenterPluginsApp);

})(Another);