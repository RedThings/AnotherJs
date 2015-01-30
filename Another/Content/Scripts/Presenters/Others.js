(function (app) {



    app
        .CreatePresenter("Home", function (p) {

        })
        .CreatePresenter("About", function (p) {

        })
        .CreatePresenter("PersonEdit", function (p, id, somethingElse, someOther) {

            var personId = p.BindElementStatic(id, "#person_id");
            var personId1 = p.BindElementStatic(somethingElse, "#person_id1");
            var personId2 = p.BindElementStatic(someOther, "#person_id2");

            p.Model.Id = id;
            p.Model.Email = "";
            p.Model.Password = "";

            p.CheckEmail = function () {
                p.Model.ErrorMessage = "Email already taken";
                return false;
            };


        });



})(mainApp);