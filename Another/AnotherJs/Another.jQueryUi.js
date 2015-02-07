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

    aj.AddPresenterPlugin("JuiDatepicker", "name", function (selectors, opts, presenter) {

        selectors.forEach(function (sl) {
            
            var el = presenter.DomHelper(sl);
            if (!a.Helpers.StringIsNullOrEmpty(opts.model)) {
                
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
                    presenter.Plugins.Click(opts.opener, {
                        onClick: function () {
                            el.datepicker("show");
                        }
                    });
                }


                // set dp
                el.datepicker(opts);
                //console.log("DPNAME: ", opts.name);


            }

        });

    });

})(Another.jQueryUi, Another);