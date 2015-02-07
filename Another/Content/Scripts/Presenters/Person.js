(function (app) {

    // add blank
    var addBlank = function (d) {
        d.unshift({ Name: "", Id: "" });
        return d;
    }

    app
        .CreatePresenter("PersonIndex", function (p) {

            function getData() {

                // get service
                var svc = p.GetService("PersonService");

                // get data
                svc.GetDepts(function (d) { p.Model.Data.Depts = d; });
                svc.GetSubDepts(function (d) { p.Model.Data.SubDepts = d; });
                svc.GetJobs(function (d) { p.Model.Data.Jobs = d; });
                svc.GetAges(function (d) { p.Model.Data.Ages = addBlank(d); });
            }

            function bindControls() {

                // bind repeaters
                p.Plugins.Repeater("#person_search_dept", {
                    type: "radio",
                    model: "Form.DeptId",
                    data: "Data.Depts",
                    valueField: "Id",
                    textField: "Name",
                    controlClass: "another-control",
                    labelClass: "another-control-label",
                    onChange: function (deptId) {

                        var subs = p.Model.Data.SubDepts.filter(function (s) {
                            return s !== null && s.DeptId == deptId;
                        });
                        p.Model.Data.CurrentSubDepts = addBlank(subs);
                        p.Model.Ui.ShowSubs = subs.length > 0;

                    }
                });
                p.BindRepeaterControl("#person_search_subdept", {
                    type: "select",
                    model: "Form.SubDeptIds",
                    data: "Data.CurrentSubDepts",
                    valueField: "Id",
                    textField: "Name",
                    multi: true
                });
                p.Plugins.Repeater("#person_search_job", {
                    type: "checkbox",
                    model: "Form.JobIds",
                    data: "Data.Jobs",
                    valueField: "Id",
                    textField: "Name",
                    controlClass: "another-control",
                    labelClass: "another-control-label",
                    multi: true
                });
                p.Plugins.Repeater("#person_search_age", {
                    type: "select",
                    model: "Form.Ages",
                    data: "Data.Ages",
                    valueField: "Id",
                    textField: "Name",
                    multi: false
                });
            }

            p.DoSubmit = function() {

                console.log(p.Model.Form);

            };

            // go
            getData();
            bindControls();

        })
        .CreatePresenter("PersonCreate", function (p) {

        })
        .CreatePresenter("PersonEdit", function (p, id) {

        })
        .CreatePresenter("PersonRead", function (p, id) {

        });


})(mainApp);