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



        });

        

    })(a.PresenterPluginsApp);

    // repeater ui
    a.Repeater = function () {


    };

})(Another);