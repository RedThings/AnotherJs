
Another.Initialize();

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
    QUnit.test("DUMMY", function(ass) {
        ass.equal("COCK", undefined.x.y, "OH DEAR");
    });


})(mainApp);