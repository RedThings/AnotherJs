// app.js
var mainApp = Another.CreateApplication("Main");

(function (app) {

    // add dep
    app.AddDependency("TestDep", "PerRequest", ["DomHelper"], function (domHelper) {

        this.Funk = function () {

            var x = domHelper("#funkyfunks");
            console.log(domHelper);
            if (x.length < 1) throw "MOCK ME DAMN YOU";

        };

    });

    app.Configure(function () {

        // subscribe
        app.SubscribeToEvent("OnRouteNotFound", function (e) {
            alert("Page not found");
            console.log(e);
        });
        
        var d = app.GetDependency("TestDep");
        //d.Funk();

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

                    this.About = function () {

                        return builder.View("/Views/Home/About.html", "About");

                    }

                })
                .AddRoutingController("Person", function () {

                    this.Index = function() {

                        return builder.View("/Views/Person/Index.html","PersonIndex");

                    }

                    this.Create = function (id) {

                        return builder.View("/Views/Person/Edit.html", "PersonCreate");

                    }

                    this.Update = function (id) {

                        return builder.View("/Views/Person/Edit.html", "PersonUpdate");

                    }

                    this.Read = function (id) {

                        return builder.View("/Views/Person/Edit.html", "PersonRead");

                    }

                });

        });

    });

    app.Run(function () {

        app.InitializePresenter("Layout", function (p) {

            // can do stuff here.

        });

    });

})(mainApp);