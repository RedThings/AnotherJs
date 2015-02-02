
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
        presenter.BindElements("SearchTerm", ["#search_box", "#search_term"]);

        // test crap
        var svc = presenter.GetService("FormService");
        svc.GetData();

        presenter.WhenClicked("#search_box");

    }

    app.CreatePresenter("Layout", layoutPresenter);

})(mainApp);