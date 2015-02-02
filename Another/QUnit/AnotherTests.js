
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
        var p = app.InitializePresenter("Layout", "#test_el1");
        ass.ok(p !== undefined, "Presenter exists");
        ass.ok(p.Model.SearchTerm === "", "Has search term");
    });
    QUnit.test("Index person presenter", function (ass) {

        var done = ass.async();
        var p;
        setTimeout(function() {
            p = app.InitializePresenter("PersonIndex", "#test_el1", [1, 2, 3]);
            ass.ok(p.Model.SubDepts === undefined || p.Model.SubDepts.length < 1, "No sub depts");
            p.Model.DeptId = 2;
            done();
        }, 100);

        var done2 = ass.async();
        setTimeout(function () {
            ass.ok(p.Model.SubDepts.length > 0, "Has sub depts");
            p.Model.DeptId = undefined;
            done2();
        }, 200);

        var done3 = ass.async();
        setTimeout(function () {
            ass.ok(p.Model.SubDepts.length === 0, "Has no sub depts");
            p.Model.DeptId = 1;
            done3();
        }, 300);

        var done4 = ass.async();
        setTimeout(function () {
            ass.ok(p.Model.SubDepts.length > 0, "Has  sub depts");
            done4();
        }, 400);

        
        
        
       
        
    });
    QUnit.test("Test dependency has been mocked. (Testing the test)", function (ass) {
        var dep = app.GetDependency("TestDep");
        ass.ok(dep.Funk() === undefined, "This means the mocking bloody works bloody hell");
    });
    QUnit.test("Test dom-less", function (ass) {

        var x;
        var done = ass.async();
        app.CreatePresenter("Test", function(p) {
            p.Model.Test = undefined;
            x = p.BindElements("Test", ["kkokopkok", "posfdpokfsdpokf", "psopsdijfsijdf"]);
        });
        app.InitializePresenter("Test", "#test_el1", [], function(p) {

            ass.ok(x.length > 0, "Dom-less element exists");
            done();

        });
        

    });


})(mainApp);

