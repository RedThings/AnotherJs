'use strict';

(function (a) {

    a.PresenterPluginsApp = a.CreateApplication("Another.PresenterPluginsApp");
    (function (ap) {

        // Presenter.Click
        ap.AddPresenterPlugin("Click", "onClick", function (selectors, opts, presenter) {

            opts.elements = [];
            selectors.forEach(function (sl) {

                var theEl = typeof sl === "object" ? sl : presenter.Container.find(sl);
                if (theEl.jquery === undefined)
                    theEl = a.DomHelper(theEl);
                if (theEl.length <= 0)
                    theEl = presenter.DomHelper("<a />");
                opts.elements.push(theEl);

                // check if string
                if (typeof opts.onClick === "string") {
                    eval(
                    "opts.onClick = function(e,el){" +
                       "presenter." + opts.onClick +
                    "}");
                }

                if (typeof sl === "string" || sl.jquery === undefined) {
                    sl = presenter.Element(sl);
                }

                // on click
                sl.on("click", presenter.Container, function (e) {

                    e.preventDefault();
                    opts.onClick(e, theEl);

                });

            });

        });

        // Presenter.Submit
        ap.AddPresenterPlugin("Submit", "onSubmit", function (selectors, opts, presenter) {

            opts.elements = [];
            selectors.forEach(function (sl) {


                var theForm = typeof sl === "object" ? presenter.DomHelper(sl) : presenter.Container.find(sl);
                if (theForm.jquery === undefined)
                    theForm = a.DomHelper(theForm);
                if (theForm.length <= 0)
                    theForm = presenter.DomHelper("<form />");
                theForm.IsDirty = function () {
                    return theForm.data("isDirty") === true;
                };
                opts.elements.push(theForm);
                theForm.each(function (i, chld) {
                    var child = presenter.DomHelper(chld);
                    child.change(function () {
                        theForm.data("isDirty", true);
                    });
                });

                // check if string
                if (typeof opts.onSubmit === "string") {
                    eval(
                    "opts.onSubmit = function(xx,yy){" +
                       "presenter." + opts.onSubmit +
                    "}");
                }

                presenter.Container.on("submit", sl, function (e) {

                    e.preventDefault();
                    opts.onSubmit(e, theForm);
                    return false;

                });

            });

        });

        // BindRepeaterControl
        ap.AddPresenterPlugin("Repeater", "data", function (selectors, opts, presenter) {

            opts.elements = [];
            selectors.forEach(function (sl) {

                var theEl = typeof sl === "object" ? sl : presenter.Container.find(sl);
                if (theEl.jquery === undefined)
                    theEl = a.DomHelper(theEl);
                opts.elements.push(theEl);

                // get chunks
                var chunks = opts.data.split(" ");
                if (chunks[1] !== "in")
                    throw new Error("Repeater options.data must be in the format '[alias] in [property]'");

                // get vals
                var rowAlias = chunks[0];
                var data;
                eval(presenter.GetEvalString("data", "presenter", chunks[2]));


                // do on rowBinding
                var onRowBinding;

                // not wrapper
                if (!a.Helpers.IsUndefinedOrNull(opts.onRowBinding)) {
                    onRowBinding = opts.onRowBinding;
                } else {

                    // is HTML wrapper
                    onRowBinding = function (elRow, dataRow) {
                        
                        /*
                         * 
                         * 
                         * THIS IS FOR ANOTHER DAY.
                         * 
                         * 
                         */

                    }
                }



                /**/
                // ReSharper disable UsageOfPossiblyUnassignedValue
                // ReSharper disable QualifiedExpressionIsNull
                // ReSharper disable QualifiedExpressionMaybeNull

                // check data
                var obsData = data;
                if (a.ShouldBeObservableArray(obsData)) {
                    var parentName = a.GetParentName(chunks[2]);
                    var childName = a.GetChildName(chunks[2]);
                    var fullName = a.GetFullName(chunks[2]);
                    var parentObj;
                    eval("parentObj = presenter." + parentName);
                    obsData = a.ConvertToObservableArray(obsData, parentObj, childName, presenter._observables, fullName);
                }

                // create wrapper and go!
                var wrapper = new a.RepeaterWrapper({ data: obsData, selector: theEl, onRowBinding: onRowBinding }, presenter);
                obsData.setRepeater(wrapper);


                /**/
                // ReSharper restore QualifiedExpressionMaybeNull
                // ReSharper restore QualifiedExpressionIsNull
                // ReSharper restore UsageOfPossiblyUnassignedValue


            });

        });


    })(a.PresenterPluginsApp);


})(Another);