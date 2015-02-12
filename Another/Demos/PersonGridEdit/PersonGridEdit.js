'use strict';



(function (app, a) {

    var theData = [
    { Name: "Rob J", Id: 1 },
    { Name: "Em J", Id: 2 },
    { Name: "Joe B", Id: 3 },
    { Name: "Jane D", Id: 4 }
    ];

    /*
     * 
     * HTMLWRAPPED
     * 
     */
    app.CreatePresenter("PersonGridEdit1", function (presenter, model, form, ui, data) {
       
        // set data
        theData.forEach(function(d) {
            d.ReadOnly = true;
        });
        data.Persons = theData;

        // methods
        model.Edit = function (row) {
            row.ResetRow = a.Clone(row);
            row.ReadOnly = false;
        }
        model.Reset = function (row) {
            row.ReApply(row.ResetRow);
        }
        model.Save = function (row) {
            console.log("TODO: save this: ", row);
            presenter.GetService("PersonService").Save(row).success(function(d) {
                row.ReadOnly = true;
            }).error(function(err) {
                alert(err);
            });
        }

    });

})(AnotherDemosApp, Another);