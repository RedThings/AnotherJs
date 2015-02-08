'use strict';

(function (a) {

    a.PresenterConditionalsApp = a.CreateApplication("Another.PresenterConditionalsApp");
    (function (ac) {

        // show when
        ac.AddPresenterConditional("Show", function (el, res) {
            debugger;
            if (res) {
                el.show();
            } else {
                el.hide();
            }

        });

        // enable when
        ac.AddPresenterConditional("Enable", function (el, res) {

            if (res) {
                el.removeAttr('disabled');
            } else {
                el.attr('disabled', 'disabled');
            }

        });


    })(a.PresenterConditionalsApp);


})(Another);