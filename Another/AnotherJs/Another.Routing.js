/*
 * Another.Routing.js
 * 
 * Routing module
 * 
 * Includes:
 * 
 *  - Routing, obviously
 * 
 */

'use strict';

// declare another literal
if (window.Another === undefined) {
    throw new Error("Another.Routing requires Another");
}

// closure
(function (a) {

    var app = a.CreateApplication("Another.Routing");

    app.Configure(function () {

        // route build
        a.RouteBuilder = function (selector) {

            // this
            var ts = this;
            var container = a.DomHelper(selector);
            //if (container.length < 1) container = a.DomHelper("<div />");

            // map route
            this.MapRoute = function (name, route, defaults) {

                if (container.length > 0) {

                    // checks
                    if (a.Helpers.StringIsNullOrEmpty(name))
                        throw new Error("RouteBuilder: name cannot be null or empty");
                    if (a.Helpers.StringIsNullOrEmpty(route))
                        throw new Error("RouteBuilder: route cannot be null or empty");
                    if (a.Helpers.IsUndefinedOrNull(defaults))
                        throw new Error("RouteBuilder: route cannot be null or empty");
                    if (a.Helpers.Any(ts.Routes, function (r) { return r.Name === name; }))
                        throw ("RouteBuilder: there is already a route named " + name);
                    if (a.Helpers.EndsWith(route, "/"))
                        route = a.Helpers.StripLast(route);
                    if (Another.Helpers.StartsWith(route, "/"))
                        route = a.Helpers.StripFirst(route);
                    //if (a.Helpers.StringIsNullOrEmpty(defaults.controller))
                    //    throw "RouteBuilder: defaults must have a controller";
                    //if (a.Helpers.StringIsNullOrEmpty(defaults.action))
                    //    throw "RouteBuilder: defaults must have an action";

                    // add
                    ts.Routes.push({ Name: name, Route: route, Chunks: route.split("/"), Defaults: defaults });

                }

                return ts;
            }

            // controller
            this.AddRoutingController = function (name, func) {

                if (container.length > 0) {

                    if (ts.Controllers[name] !== undefined)
                        throw new Error(("RouteBuilder: controller " + name + " already exists"));
                    ts.Controllers[name] = new func();

                }

                return ts;
            }

            // hash change
            var doHashChange = function () {

                if (container.length > 0) {

                    // check and remove
                    if (!a.Helpers.IsUndefinedOrNull(a.Route) && !a.Helpers.IsUndefinedOrNull(a.Route.Presenter)) {
                        delete a.Route.Presenter;
                    }
                    a.Route = {};

                    // check for no trailing slash redirect
                    if (a.Helpers.StringIsNullOrEmpty(window.location.hash)) {
                        window.location.hash = "/";
                        a.RaiseEvent("OnRouteRedirect", { Route: a.Route, Message: "Trailing slash not present" });
                        return;
                    }

                    // begin
                    a.RaiseEvent("OnRouteChangeStart", { Route: a.Route });

                    // get hash
                    var hash = window.location.hash;
                    // add to route
                    var splt = hash.split("#");
                    var searchSplt = splt[1].split("?");
                    a.Route.Path = searchSplt[0];

                    // chunks
                    var chunkPath = a.Route.Path;
                    if (a.Helpers.StartsWith(chunkPath, "/"))
                        chunkPath = a.Helpers.StripFirst(chunkPath);
                    if (a.Helpers.EndsWith(chunkPath, "/"))
                        chunkPath = a.Helpers.StripLast(chunkPath);
                    a.Route.PathNoSlashes = chunkPath;
                    a.Route.Chunks = chunkPath.split("/");

                    // q string
                    a.Route.QueryString = searchSplt[1] || "";
                    // add search (empty)
                    a.Route.Search = {};

                    // add search?
                    if (!a.Helpers.StringIsNullOrEmpty(a.Route.QueryString)) {
                        var qSplit = a.Route.QueryString.split("&");
                        qSplit.forEach(function (str) {
                            var strSplit = str.split("=");
                            a.Route.Search[strSplit[0]] = strSplit[1];
                        });
                    };

                    // check trailing
                    if (!a.Helpers.EndsWith(a.Route.Path, "/")) {
                        window.location.hash = (a.Route.Path) + "/" +
                        (a.Helpers.StringIsNullOrEmpty(a.Route.QueryString) ? "" : "?" + a.Route.QueryString);
                        a.RaiseEvent("OnRouteRedirect", { Route: a.Route, Message: "Trailing slash not present" });
                        return;
                    }

                    // found route
                    var routeFound = null;
                    var controller = null;
                    var action = null;
                    var view = null;
                    var presenter = null;

                    // checj
                    if (a.Route.Chunks.length < 1) {
                        a.Route.Chunks.push("");
                    }

                    // loop through routes
                    for (var i = 0; i < ts.Routes.length; i++) {

                        // route
                        var r = ts.Routes[i];

                        // check c/a/
                        if (r.Route === "{controller}/{action}") {

                            controller = a.Route.Chunks[0] || r.Defaults.controller;
                            action = a.Route.Chunks[1] || r.Defaults.action;
                            routeFound = r;
                            break;

                        } else if (a.Helpers.StartsWith(a.Route.PathNoSlashes, r.Route)) {
                            view = r.Defaults.view;
                            presenter = r.Defaults.presenter;
                            routeFound = r;
                            break;
                        }

                    };

                    // check
                    if (routeFound === null) {
                        a.RaiseEvent("OnRouteNotFound", { Route: a.Route, Message: "No route found for this path" });
                        return;
                    }

                    // we've found a route, so check all makes sense
                    var isMvc = controller !== null && action !== null;
                    if (!isMvc && (a.Helpers.StringIsNullOrEmpty(view) || a.Helpers.StringIsNullOrEmpty(presenter))) {
                        a.RaiseEvent("OnRouteNotFound", { Route: a.Route, Message: "Routes are incorrectly configured" });
                        return;
                    };

                    // all is well
                    if (isMvc) {

                        // controller
                        var actualController = ts.Controllers[controller];
                        if (a.Helpers.IsUndefinedOrNull(actualController))
                            actualController = ts.Controllers[controller.toLowerCase()];
                        if (a.Helpers.IsUndefinedOrNull(actualController)) {
                            a.RaiseEvent("OnRouteNotFound", {
                                Route: a.Route,
                                Message: "Cannot find controller " + controller
                            });
                            return;
                        }

                        // check action
                        var actualAction = actualController[action];
                        if (a.Helpers.IsUndefinedOrNull(actualAction)) {
                            action = action.toLowerCase();
                            actualAction = ts.Controllers[action];
                        }
                        if (a.Helpers.IsUndefinedOrNull(actualAction)) {
                            a.RaiseEvent("OnRouteNotFound", {
                                Route: a.Route,
                                Message: "Cannot find action " + action
                            });
                            return;
                        }

                        // all is well so create string to eval
                        var strCall = "actualController[action](";
                        for (var i2 = 2; i2 < a.Route.Chunks.length; i2++) {
                            strCall += "'" + a.Route.Chunks[i2] + "'";
                            if (i2 + 1 < a.Route.Chunks.length)
                                strCall += ",";
                        }
                        strCall += ");";

                        // call string
                        eval(strCall);

                    } else if (presenter !== null && view !== null) {

                        ts.View(view, presenter);

                    } else {
                        a.RaiseEvent("OnRouteNotFound", {
                            Route: a.Route,
                            Message: "Presenter or View default is null for this route"
                        });
                    }

                }

            }

            // set view container
            this.SetViewContainer = function () {

                // check
                if (container.length > 0) {

                    // set change event
                    a.DomHelper(window).bind("hashchange", function (e) {

                        doHashChange();
                    });

                    //
                    doHashChange();

                }
            };

            // routes
            this.Routes = [];

            // controller
            this.Controllers = {};

            // views
            this.Views = {};
            this.CacheViews = function (bool) {
                cacheViews = bool;
                return ts;
            };
            var cacheViews = false;

            // view
            this.View = function (view, presenter) {

                if (container.length > 0) {

                    // find
                    var found = ts.Views[view];


                    if (found) {
                        container.html(found);
                        a.InitializePresenter(presenter,container,a.Route.Chunks.splice(2));
                        a.Route.Presenter = presenter;
                        a.Route.View = view;
                        a.RaiseEvent("OnRouteChangeSuccess", { Route: a.Route });
                    } else {

                        // load view
                        a
                            .DomHelper
                            .get(view)
                            .success(function (txt) {

                                if (cacheViews)
                                    ts.Views[view] = txt;
                                container.html(txt);
                                a.InitializePresenter(presenter, container, a.Route.Chunks.splice(2));
                                a.Route.Presenter = presenter;
                                a.Route.View = view;
                                a.RaiseEvent("OnRouteChangeSuccess", { Route: a.Route, View: view, Presenter: presenter });
                            })
                            .error(function (ee) {
                                throw new Error("Could not load view " + view);
                            });
                    };

                }
            }


        };

        // map routes
        a.AnotherApplication.prototype.ConfigureRoutes = function (selector, func) {

            var builder = new a.RouteBuilder(selector);
            func(builder);
            builder.SetViewContainer();

        };

    });

})(Another);

