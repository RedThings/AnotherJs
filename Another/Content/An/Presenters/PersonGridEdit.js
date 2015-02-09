'use strict';

var data = [
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
    app.CreatePresenter("PersonGridEdit1", function (presenter) {
        console.log("P1 init");

        // set data
        presenter.Model.Data.Persons = data;
        presenter.Model.Ui.ShowSomething = false;
        

        // click/submit
        presenter.SubmitForm = function (e, el) {
            alert("Submit");
        };
        presenter.ClickMe = function (e, el) {
            alert("Clicked");
        }
        presenter.ChangeSomething = function(e, el) {
            presenter.Model.Data.Persons[1].Id = 1231456;
        }

    });

    /*
     * 
     * JS ONLY
     * 
     */
    app.CreatePresenter("PersonGridEdit2", function (presenter) {
        console.log("P2 init");

        // set data
        presenter.Model.Data.Persons = a.Clone(data);

        // set repeater
        presenter.Plugins.Repeater("#person_grid_row", {
            data: "row in {Data}.Persons",
            onRowBinding: function (el, data) {
                
            }
        });

        // set test buttons etc
        presenter.Plugins.Submit("#the_form", {
            onsubmit: function (e, el) {
                alert("I'm submitted 2");
            }
        });
        presenter.Plugins.Click("#btnClick", {
            onclick: function (e, el) {
                alert("I'm clicked 2");
            }
        });
        presenter.Plugins.Click("#btnShowHide", {
            onclick: function () {
                presenter.Model.Ui.ShowSomething = !presenter.Model.Ui.ShowSomething;
            }
        });
        presenter.Plugins.IfText("#btnShowHide", {
            propName: "{Ui}.ShowSomething",
            trueState: "Hide",
            falseState: "Show"
        });
        presenter.Conditionals.Show("#h1Shown", function() {
            return presenter.Model.Ui.ShowSomething === true;
        });

        presenter.Model.Ui.ShowSomething = false;

    });

})(AnotherDemosApp, Another);