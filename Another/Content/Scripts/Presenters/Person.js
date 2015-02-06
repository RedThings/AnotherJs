(function (app) {

    // add blank
    var addBlank = function(d) {
        d.unshift({ Name: "", Id: "" });
        return d;
    }

    app
        .CreatePresenter("PersonIndex", function (p) {

            function setModel() {

                // empty model
                p.Model.Form = {};
                p.ObserveInnerObject("Form");

            }
            function getData() {
                // get service
                var svc = p.GetService("PersonService");

                // get data
                svc.GetDepts(function (d) { p.Model.Depts = d; });
                svc.GetSubDepts(function (d) { p.Model.SubDepts = d; });
                svc.GetJobs(function (d) { p.Model.Jobs = d; });
                svc.GetAges(function (d) { p.Model.Ages = addBlank(d); });
            }
            function bindControls() {

                // date
                p.JuiDatepicker("#person_search_dob", {
                    dateFormat: "yy-mm-dd",
                    model: "Form.Dob",
                    constrainInput: true,
                    opener: "#btnOpenCalendar"
                });

                // bind repeaters
                p.BindRepeaterControl({
                    selector: "#person_search_dept",
                    type: "radio",
                    model: "Form.DeptId",
                    data: "Depts",
                    valueField: "Id",
                    textField: "Name",
                    controlClass: "another-control",
                    labelClass: "another-control-label",
                    onChange: function (deptId) {

                        var subs = p.Model.SubDepts.filter(function (s) {
                            return s !== null && s.DeptId == deptId;
                        });
                        p.Model.CurrentSubDepts = addBlank(subs);
                        p.Model.ShowSubs = subs.length > 0;

                    }
                });
                p.ShowWhen("#person_search_subdept_row", function () {
                    return p.Model.ShowSubs;
                });
                p.BindRepeaterControl({
                    selector: "#person_search_subdept",
                    type: "select",
                    model: "Form.SubDeptIds",
                    data: "CurrentSubDepts",
                    valueField: "Id",
                    textField: "Name",
                    multi: true
                });
                p.BindRepeaterControl({
                    selector: "#person_search_job",
                    type: "checkbox",
                    model: "Form.JobIds",
                    data: "Jobs",
                    valueField: "Id",
                    textField: "Name",
                    controlClass: "another-control",
                    labelClass:"another-control-label",
                    multi: true
                });
                p.BindRepeaterControl({
                    selector: "#person_search_age",
                    type: "select",
                    model: "Form.Ages",
                    data: "Ages",
                    valueField: "Id",
                    textField: "Name",
                    multi: false
                });
            }
            function bindForm() {
                p.Submit("#person_search_form", {
                    onSubmit:function(e, frm) {
                        console.log(p.Model.Form);
                    }
                });
            }
            
            // go
            setModel();
            getData();
            bindControls();
            bindForm();

        })
        .CreatePresenter("PersonCreate", function (p) {

        })
        .CreatePresenter("PersonEdit", function (p, id) {

        })
        .CreatePresenter("PersonRead", function (p, id) {

        });


})(mainApp);