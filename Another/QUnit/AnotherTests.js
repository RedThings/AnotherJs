
// mock
Another.MockDependency("Http", "Static", function () {

    this.Get = function () {
        var dfd = new jQuery.Deferred();
        return dfd.promise();
    }
    this.Post = function () {
        var dfd = new jQuery.Deferred();
        return dfd.promise();
    }
    this.Ajax = function () {
        var dfd = new jQuery.Deferred();
        return dfd.promise();
    };

});
Another.MockDependency("TestDep", "Static", function () {

    this.Funk = function () {
        console.log("Yes, you mocked me.");
    };

});

// init
Another.Initialize();

// test
(function (app) {

    QUnit.test("App is not null", function (ass) {
        ass.ok(app !== undefined && app !== null, "OK");
    });
    QUnit.test("Layout presenter", function (ass) {
        var p = app.InitializePresenter("Layout");
        ass.ok(p !== undefined, "Presenter exists");
        ass.ok(p.Model.SearchTerm === "", "Has search term");
    });
    QUnit.test("Edit person presenter", function (ass) {
        var p = app.InitializePresenter("PersonEdit", [1, 2, 3]);
        ass.ok(p.Model.Id === "1", "Model.Id === '1'");
        ass.ok(p.Model.Id == 1, "Model.Id == 1");
        ass.ok(p.CheckEmail() === false, "Check email = false");
        ass.ok(p.Model.ErrorMessage === "Email already taken", "Error correct for previous");
    });
    QUnit.test("Test dependency has been mocked. (Testing the test)", function(ass) {
        var dep = app.GetDependency("TestDep");
        ass.ok(dep.Funk() === undefined, "This means the mocking bloody works bloody hell");
    });


})(mainApp);

