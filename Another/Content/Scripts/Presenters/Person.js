(function (app) {


    app
        .CreatePresenter("PersonIndex", function (p) {
            
            // init model
            p.Model.Inner = {
                Inner: {
                    Inner: {
                        Dob: undefined
                    }
                }
            };
            
            // init datepicker
            p.JuiDatepicker("#person_search_dob", {
                dateFormat: "yy-mm-dd",
                model: "Inner.Inner.Inner.Dob",
                onSelect:function(vl, dp) {
                    //console.log("from presenter");
                }

            });

            // init date
            p.Model.Inner.Inner.Inner.Dob = "1978-11-17";

            // init form
            var submitForm = function (e, frm) {
                console.log("Is form dirty? ", frm.IsDirty());
                console.log(p.Model);
                console.log(p.Model.Inner.Inner.Inner.Dob);
            }
            p.Submit(["#person_search_form"], { onSubmit: submitForm });




            // bind textbox
            var nameBox = p.BindElement("Name", "#person_search_name");

            // bind depts
            var subDeptEl;
            var subDeptRow = p.Element("#person_search_subdept_row");
            var depts = [{ Name: "Dept1", Value: 1 }, { Name: "Dept2", Value: 2 }, { Name: "Dept3", Value: 3 }];
            var subDepts = {
                "1": [{ Name: "Dept11", Value: 11 }, { Name: "Dept12", Value: 12 }, { Name: "Dept13", Value: 13 }],
                "2": [{ Name: "Dept21", Value: 21 }, { Name: "Dept22", Value: 22 }, { Name: "Dept23", Value: 23 }],
                "3": [{ Name: "Dept31", Value: 31 }, { Name: "Dept32", Value: 32 }, { Name: "Dept33", Value: 33 }]
            };
            var jobTitles = [{ Name: "Job1", Value: 1 }, { Name: "Job2", Value: 2 }, { Name: "Job3", Value: 3 }];
            p.BindRepeaterControl({
                type: "radio",
                selector: "#person_search_dept",
                data: depts,
                dataTextField: "Name",
                dataValueField: "Value",
                model: "DeptId",
                onChange: function (newVal) {

                    // change the sub depts
                    p.Model.SubDepts = subDepts[newVal] || [];

                    // hide / show row
                    if (p.Model.SubDepts.length < 1) {
                        subDeptRow.hide();
                    } else {
                        subDeptRow.show();
                    }

                }
            });
            p.BindRepeaterControl({
                type: "select",
                selector: "#person_search_subdept",
                data: "SubDepts",
                dataTextField: "Name",
                dataValueField: "Value",
                model: "SubDeptIds",
                multi: true,
                onChange: function (newVal) {

                }
            });
            p.BindRepeaterControl({
                type: "checkbox",
                selector: "#person_search_job",
                data: jobTitles,
                dataTextField: "Name",
                dataValueField: "Value",
                model: "JobTitleId",
                multi: true,
                onChange: function (newVal) {

                }
            });


            p.Model.DeptId = undefined;

        })
        .CreatePresenter("PersonCreate", function (p) {

        })
        .CreatePresenter("PersonEdit", function (p, id) {

        })
        .CreatePresenter("PersonRead", function (p, id) {

        });


})(mainApp);