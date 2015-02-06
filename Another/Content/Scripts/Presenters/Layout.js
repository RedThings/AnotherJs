
(function (app) {

    // create layout presenter
    var layoutPresenter = function (presenter) {
        
        // initialize model
        presenter.Model.SearchTerm = "";

        // get menu elements
        var menuButton = presenter.Element("#menu_button");
        var menu = presenter.Element("#menu");

        // bind button
        menuButton.click(function (e) {

            e.preventDefault();
            if (presenter.MenuOpen !== true) {
                menu.slideDown(200);
                presenter.MenuOpen = true;
            } else {
                presenter.MenuOpen = false;
                menu.slideUp(200);
            }

        });

        // bind search term
        presenter.Bind("SearchTerm", ["#search_box", "#search_term"]);

        // test crap
        var svc = presenter.GetService("FormService");
        svc.GetData();

        presenter.WhenClicked("#search_box");

        presenter.BindRepeater({
            selector: "#repeater_data",
            onRowBinding: function (el, rw) {
                el.html(rw);
            },
            data: "Bucket.Inner.RepeaterData"

        });
        presenter.Model.Bucket = { Inner: {} };
        presenter.ObserveInnerObject("Bucket.Inner");

        //presenter.SubscribeToEvent("OnModelChanged", function(obj) {
        //    console.log(obj);
        //});

    }

    app.CreatePresenter("Layout", layoutPresenter);

})(mainApp);