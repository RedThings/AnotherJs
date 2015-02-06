var servicesApp = Another.CreateApplication("Services");
(function (app, a) {

    app.AddService("FormService", "Static", ["Http"], function (http) {

        this.GetData = function () {
            //var rand = "ROBERT_" + a.Helpers.GetRandom(true);
            //http
            //    .Put("https://dazzling-fire-9056.firebaseio.com/Person/" + rand + ".json", { Name: "Rob J", Id: a.Helpers.GetRandom(), Dob: Date.now() })
            //    .success(function (d) {
            //        http
            //           .Patch("https://dazzling-fire-9056.firebaseio.com/Person/" + rand + "/.json", {
            //               Name: "This has changed"
            //           })
            //           .success(function (d) {
            //               console.log("PATCH success ", d);
            //           })
            //           .error(function (err) {
            //               console.log("PATCH ERROR ", d);
            //           });
            //    })
            //    .error(function (err) {
            //        console.log("ERROR ", err);
            //    });


            //return http.Get("https://dazzling-fire-9056.firebaseio.com/Person.json", function (data) {
            //    console.log(data);
            //});

        };

    });

})(servicesApp, Another);