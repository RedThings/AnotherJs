var servicesApp = Another.CreateApplication("Services");
(function(app) {

    app.AddService("FormService", "Static", ["Http"], function (http) {

        this.GetData = function () {

            return http.Get("/Json/test.json", function (data) {
                console.log(data.SomeData);
            });

        };

    });

})(servicesApp);