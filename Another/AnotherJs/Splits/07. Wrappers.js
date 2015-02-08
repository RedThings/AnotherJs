'use strict';

(function(a) {
    
    // repeater wrapper
    a.RepeaterWrapper = function (opts, prsnt) {

        // self
        var ts = this;

        // set "private" methods / props
        this.opts = opts;
        this.prsnt = prsnt;
        this.el = prsnt.Element(opts.selector);
        this.prnt = this.el.parent();
        if (this.prnt.length <= 0) {
            this.prnt = this.prsnt.DomHelper("<div />");
        }
        this.cloneText = this.el[0].outerHTML;
        this.el.remove();
        this.data = opts.data;
        if (this.data.toString() !== "Another.ObservableArray")
            throw new TypeError("RepeaterWrapper.data must be of type Another.ObservableArray");
        this.data.setRepeater(this);


        // element
        this.Element = function () {
            return ts.el;
        };

        // get element
        this.CreateElement = function () {
            var newEl = ts.prsnt.DomHelper(ts.cloneText);
            newEl.removeAttr("id");
            newEl.children().each(function (i, theEl) {
                var jTheEl = ts.prsnt.DomHelper(theEl);
                var theId = jTheEl.attr("id");
                if (!a.Helpers.IsUndefinedOrNull(theId) && theId.length > 0) {
                    jTheEl.attr("id", theId + "_" + a.Helpers.GetRandom(true));
                }
            });
            return newEl;
        }

        // add new element
        this.AddNewElement = function (rowVal, override) {

            if (override || this.firstBindingComplete === true) {

                // create new
                var newEl = ts.CreateElement();

                // append
                ts.prnt.append(newEl);

                // fire binding
                ts.opts.onRowBinding(newEl, rowVal);

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

        // init
        this.data.forEach(function (d) {
            ts.AddNewElement(d, true);
        });
        //this.AddElementsInFront(ts.data);
        this.firstBindingComplete = true;
    };

    // plugin wrapper
    a.PluginWrapper = function (presenter) {
        this.Presenter = presenter;
    };

    // conditional wrapper
    a.ConditionalsWrapper = function (presenter) {
        this.Presenter = presenter;
    };


})(Another);