'use strict';

var AnotherDemosApp = Another.CreateApplication("AnotherDemosApp");

(function(app) {

    app.Configure(function() {
        
        // on error
        app.OnError(function (err) {
            var outputStr = Another.Helpers.FormatString(
                "Error at line {0}, col {1} of {2} - '{3}' ",
                [err.lineNumber, err.columnNumber, err.fileName, err.message]);
            console.log(outputStr);
            console.log(err);

        });

    });

    app.Run(function() {

        // on error
        app.InitializePresenter("PersonGridEdit2", "#person_grid_edit");

    });

})(AnotherDemosApp);