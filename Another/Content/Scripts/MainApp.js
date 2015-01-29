// app.js
var mainApp = Another.CreateApplication("Main");

(function (app) {

    app.Configure(function () {

        // configure routing
        app.ConfigureRoutes("section#main", function (builder) {

            builder
                .CacheViews(true)
                .MapRoute(
                "Test2",
                "Test2", {
                    view: "/Views/Test/Test2.html",
                    presenter: "Testy2"
                })
                .MapRoute(
                "Test",
                "Test/Testy", {
                    view: "/Views/Test/Testy.html",
                    presenter: "Testy"
                })
                .MapRoute(
                "Default",
                "{controller}/{action}", {
                    controller: "Home",
                    action: "Index"
                })
                .AddRoutingController("Home", function () {

                    this.Index = function () {

                        return builder.View("/Views/Home/Index.html", "Home");

                    };

                    this.About = function() {

                        return builder.View("/Views/Home/About.html", "About");

                    }

                })
                .AddRoutingController("Person", function() {
                    
                    this.Edit = function(id) {

                        return builder.View("/Views/Person/Edit.html", "PersonEdit");

                    }

                });

            app.SubscribeToEvent("OnRouteNotFound", function (e) {

                

            });
            

        });

    });

    app.Run(function () {

        app.InitializePresenter("Layout", function (p) {

            

        });

    });

})(mainApp);