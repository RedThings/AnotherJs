var servicesApp = Another.CreateApplication("Services");
(function(app) {

    app.Configure(function() {

        app.CreateService("FormService", function(domHelper) {

            this.GetData = function() {

                return domHelper.get("/Json/test.json", function(data) {
                    console.log(data.SomeData);
                });

            };

        });

        app.CreateService("NoDomHelper", function() {


        });
    });

})(servicesApp);