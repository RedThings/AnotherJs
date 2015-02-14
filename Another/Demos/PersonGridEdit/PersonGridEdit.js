'use strict';



(function (app, a) {

    var theData = [
    { Name: "Rob J", Id: 1, JobTitleId: 1, JobTitle: undefined },
    { Name: "Em J", Id: 2, JobTitleId: 2, JobTitle: undefined },
    { Name: "Joe B", Id: 3, JobTitleId: 3, JobTitle: undefined },
    { Name: "Jane D", Id: 4, JobTitleId: 4, JobTitle: undefined }
    ];

    var jobTitles = [{ Id: 1, Name: "Developer" }, { Id: 2, Name: "Accountant" }, { Id: 3, Name: "Cleaner" }, { Id: 4, Name: "CEO" }];

    /*
     * 
     * HTMLWRAPPED
     * 
     */
    app.CreatePresenter("PersonGridEdit1", function (presenter, model, form, ui, data) {

        ui.OnJobTitleChanged = function (newVal, row) {
            var filtered = data.JobTitles.filter(function (t) {
                return t.Id == newVal;
            });
            row.JobTitle = filtered.length > 0 ? filtered[0].Name : "--ERROR--";
        }

        // set data
        theData.forEach(function (d) {
            d.ReadOnly = true;
            //ui.OnJobTitleChanged(undefined, undefined, d);
        });
        data.Persons = theData;
        data.JobTitles = jobTitles;

        // methods
        model.Edit = function (row) {
            row.ResetRow = a.Clone(row);
            row.ReadOnly = false;
        }
        model.Reset = function (row) {
            row.ReApply(row.ResetRow);
        }
        model.Save = function (row) {

            console.log("Dummy save: ", row);
            row.ReadOnly = true;
            row.ReApply(a.Clone(row));

            //presenter.GetService("PersonService").Save(row).success(function(d) {
            //    row.ReadOnly = true;
            //}).error(function(err) {
            //    alert(err);
            //});
        }



    });

})(AnotherDemosApp, Another);