'use strict';

var data = [
    { Name: "Rob J", Id: 1 },
    { Name: "Em J", Id: 2 },
    { Name: "Joe B", Id: 3 },
    { Name: "Jane D", Id: 4 },
];

(function(app,a) {

    /*
     * 
     * HTMLWRAPPED
     * 
     */
    app.CreatePresenter("PersonGridEdit1", function(presenter) {
        console.log("P1 init");

        // set data
        presenter.Model.Data.Persons = a.Helpers.Clone(data);

       

    });

    /*
     * 
     * JS ONLY
     * 
     */
    app.CreatePresenter("PersonGridEdit2", function (presenter) {
        console.log("P2 init");

        // set data
        presenter.Model.Data.Persons = a.Helpers.Clone(data);
        
        // set repeater
        presenter.Plugins.Repeater("#person_grid_row", {
            
            data:"row in {Data}.Persons",
            onRowBinding: function (elementRow, dataRow) {
                elementRow.append("<td>" + dataRow.Id + "</td>");
                elementRow.append("<td>" + dataRow.Name + "</td>");
            }
        });

    });

})(AnotherDemosApp,Another);