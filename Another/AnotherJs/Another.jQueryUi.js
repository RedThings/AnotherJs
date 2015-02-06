/*
 * Another.jQueryUi.js
 * 
 * Adds jQuery ui bits
 * 
 * Includes:
 * 
 *  jQuery ui helpers
 * 
 */

'use strict';

// declare another literal
if (window.Another === undefined) {
    throw new Error("Another.Routing requires Another");
}

Another.jQueryUi = Another.CreateApplication("Another.jQueryUi");

(function (aj, a) {

    aj.AddPresenterPlugin("JuiDatepicker", function (selectors, opts, presenter) {

        selectors.forEach(function (sl) {

            var el = presenter.DomHelper(sl);
            if (!a.Helpers.StringIsNullOrEmpty(opts.model)) {

                // check if inner observe
                if (opts.model.indexOf(".") > -1) {

                    var splt = opts.model.split(".");
                    var innerName = "";
                    for (var i = 0; i < splt.length - 1; i++) {
                        innerName += splt[i];
                        if (i < splt.length - 2) innerName += ".";
                    }
                    presenter.ObserveInnerObject(innerName);
                }

                // bind el
                presenter.Bind(opts.model, el);

                // sort out options
                var origSelect = opts.onSelect;
                opts.onSelect = function (vl, dp) {
                    if (!a.Helpers.StringIsNullOrEmpty(opts.model)) {
                        presenter.UpdateModel(opts.model, vl);
                    }
                    dp.input.trigger("change");
                    if (origSelect !== undefined) origSelect(vl, dp);
                }

                // bind button
                if (!a.Helpers.IsUndefinedOrNull(opts.opener)) {
                    presenter.Element(opts.opener);
                    presenter.Click(opts.opener, {
                        onClick: function () {
                            el.datepicker("show");
                        }
                    });
                }


                // set dp
                el.datepicker(opts);



            }

        });

    });

})(Another.jQueryUi, Another);