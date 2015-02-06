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

(function (aj,a) {
    
    aj.AddPresenterPlugin("JuiDatepicker", function(selectors, opts, presenter) {
        
        selectors.forEach(function(sl) {
        
            var el = presenter.DomHelper(sl);
            if (!a.Helpers.StringIsNullOrEmpty(opts.model)) {
                
                // check if inner observe
                if (opts.model.indexOf(".") > -1) {

                    var splt = opts.model.split(".");
                    var innerName = "";
                    for (var i = 0; i < splt.length - 1;i++) {
                        innerName += splt[i];
                        if (i < splt.length - 2) innerName += ".";
                    }
                    
                    presenter.ObserveInnerObject(innerName);
                }

                // bind el
                presenter.BindElement(opts.model, el);

                // sort out options
                var origSelect = opts.onSelect;
                opts.onSelect = function (vl, dp) {
                    if (!a.Helpers.StringIsNullOrEmpty(opts.model)) {
                        presenter.UpdateModel(opts.model, vl);
                    }
                    dp.input.trigger("change");
                    if (origSelect !== undefined) origSelect(vl, dp);
                }

                // finally
                el.datepicker(opts);

            }

        });

    });

    var onslct = function(p, modelName, dt, theEl) {
        if (!a.Helpers.IsUndefinedOrNull(modelName)) {
            p.UpdateModel(modelName, dt);
        }
        theEl.input.change();
    }
    var bindDp = function (p, el) {
        var jEl = p.DomHelper(el);
        var attrVal = jEl.attr("another-date-picker") || jEl.attr("data-another-date-picker");
        jEl.removeAttr("another-date-picker");
        jEl.removeAttr("data-another-date-picker");

        var optsName;
        var modelName ="";

        if (attrVal.indexOf(":") > -1) {
            var splt = attrVal.split(":");
            optsName = splt[0];
            modelName = splt[1];
        } else {
            optsName = attrVal;
        }


        if (optsName.indexOf(".") > -1) {
            throw new Error("DatePicker: options presenter property cannot be a sub property");
        }
        
        var opts = p[optsName];
        if (typeof opts === "object") {
            if (opts != null && !a.Helpers.IsUndefinedOrNull(opts.onSelect)) {
                opts.onSelect = function(dt, theEl) {
                    onslct(p, modelName, dt, theEl);
                }
            } else {
                var orig = opts.onSelect;
                opts.onSelect = function (dt, theEl) {
                    onslct(p, modelName, dt, theEl);
                    orig(dt, theEl);
                }
            }
            jEl.datepicker(opts);
        } else {
            jEl.datepicker({
                onSelect:function(dt, theEl) {
                    onslct(p, modelName, dt, theEl);
                    p.DomHelper(theEl).change();
                }
            });
        }

        // bind
        if (!modelName.IsNullOrWhitespace()) {

            p.BindElement(modelName, jEl, function() {
                //jEl.trigger("change");
            });

        }
    }
    //aj.AddPresenterInitializer(false, function (p) {
        
    //    // get options
    //    p.Container.find("[data-another-date-picker]").each(function (i, el) {
    //        bindDp(p, el);
    //    });
    //    p.Container.find("[another-date-picker]").each(function (i, el) {
    //        bindDp(p, el);
    //    });

    //});

})(Another.jQueryUi,Another);