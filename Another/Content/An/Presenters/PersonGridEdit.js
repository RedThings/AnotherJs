'use strict';

var theData = [
    { Name: "Rob J", Id: 1 },
    { Name: "Em J", Id: 2 },
    { Name: "Joe B", Id: 3 },
    { Name: "Jane D", Id: 4 },
];

(function (app, a) {

    /*
     * 
     * HTMLWRAPPED
     * 
     */
    app.CreatePresenter("PersonGridEdit1", function (presenter, model, form, ui, data) {
        console.log("P1 init");
        
        // set data
        data.Persons = theData;
        ui.ShowSomething = false;
        

        // click/submit
        model.SubmitForm = function (e, el) {
            alert("Submit");
        };
        model.ClickMe = function (e, el) {
            alert("Clicked");
        }
        model.ChangeSomething = function(e, el) {
            data.Persons[1].Id = 1231456;
        }

    });

    /*
     * 
     * JS ONLY
     * 
     */
    app.CreatePresenter("PersonGridEdit2", function (presenter,model,form,ui,data) {
        console.log("P2 init");
        
        // set data
        data.Persons = a.Clone(theData);

        // set repeater
        presenter.Plugins.AnRepeater("#person_grid_row", {
            data: "row in {Data}.Persons",
            onRowBinding: "{Model}.BindRepeaterRow()"
        });

        // set test buttons etc
        presenter.Plugins.AnSubmit("#the_form", {
            onsubmit: "{Ui}.Submit()"
        });
        presenter.Plugins.AnClick("#btnClick", {
            onclick: "{Ui}.ClickMe()"
        });
        presenter.Plugins.AnClick("#btnShowHide", {
            onclick: "{Ui}.ShowSomething = !{Ui}.ShowSomething;"
        });
        presenter.Plugins.AnIftext("#btnShowHide", {
            condition: "{Ui}.ShowSomething ? 'Hide':'Show'"
        });
        presenter.Plugins.AnShow("#h1Shown", {
            condition: "{Ui}.ShowSomething"
        });

        ui.ShowSomething = false;

    });

})(AnotherDemosApp, Another);