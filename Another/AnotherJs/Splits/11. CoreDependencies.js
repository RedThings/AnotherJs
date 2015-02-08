'use strict';

(function(a) {
    
    // create dependencies app
    a.DependenciesApplication = a.CreateApplication("Another.Dependencies");

    // closure
    (function (ad) {

        ad.AddDependency("Http", "Static", [], function () {

            this.Get = a.DomHelper.get;
            this.Post = function (url, data) {
                return a.DomHelper.post(url, JSON.stringify(data));
            }
            this.Ajax = a.DomHelper.ajax;
            this.Put = function (url, data) {
                return a.DomHelper.ajax({
                    url: url,
                    data: JSON.stringify(data),
                    type: "PUT",

                });

            }

            this.Delete = function (url, data) {
                return a.DomHelper.ajax({
                    url: url,
                    data: JSON.stringify(data),
                    type: "DELETE"
                });

            }

            this.Patch = function (url, data) {
                return a.DomHelper.ajax({
                    url: url,
                    data: JSON.stringify(data),
                    type: "PATCH"
                });
            }

        });

        ad.AddDependency("DomHelper", "Static", [], function () {

            return a.DomHelper;

        });

    })(a.DependenciesApplication);



})(Another);