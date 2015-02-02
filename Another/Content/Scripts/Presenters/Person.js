(function (app) {


    app
        .CreatePresenter("PersonIndex", function (p) {

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
            subDeptEl = p.BindRepeaterControl({
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

            // init form
            var submitForm = function (frm) {
                console.log("Is form dirty? ", frm.IsDirty());
                console.log(p.Model.SubDeptIds);
            }
            p.Form("#person_search_form", submitForm);
            p.Model.DeptId = undefined;

        })
        .CreatePresenter("PersonCreate", function (p) {

        })
        .CreatePresenter("PersonEdit", function (p, id) {

        })
        .CreatePresenter("PersonRead", function (p, id) {

        });


})(mainApp);