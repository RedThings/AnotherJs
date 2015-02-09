'use strict';

var AnotherDemosApp = Another.CreateApplication("AnotherDemosApp");

(function(app,a) {

    app.OnApplicationStart(function () { "App start"; });
    app.OnApplicationConfigure(function () {
        "App configure"; // on error
        app.OnError(function (err) {
            var outputStr = a.FormatString(
                "Error at line {0}, col {1} of {2} - '{3}' ",
                [err.lineNumber, err.columnNumber, err.fileName, err.message]);
            console.log(outputStr);
            console.log(err);

        });
    });
    app.OnApplicationRun(function () {
        "App run"; 
        app.InitializePresenter("PersonGridEdit2", "#person_grid_edit");
    });

})(AnotherDemosApp,Another);