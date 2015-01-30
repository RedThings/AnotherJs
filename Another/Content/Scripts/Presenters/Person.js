(function (app) {


    app
        .CreatePresenter("PersonIndex", function (p) {

            // menu data
            p.MenuData = [["Create", "List"], ["Create2", "List2"]];
            var btn = p.DomHelper("#change_menu_button");
            var menuCounter = 0;
            btn.click(function(e) {
                e.preventDefault();
                menuCounter = menuCounter === 0 ? 1 : 0;
                p.Model.MenuData = p.MenuData[menuCounter];
            });
            p.Model.MenuData = p.MenuData[menuCounter];
            p.BindRepeater({
                data: "MenuData",
                selector: "#person_menu_item",
                onRowBinding:function(el, row) {
                    el.html(row);
                }
            });
            var btnClear = p.DomHelper("#clear_vals");
            btnClear.click(function(e) {
                e.preventDefault();
                //p.Model.DeptId =  p.PushChange(p.Model.DeptId, function(c) {
                //    c.splice(1, 1);
                //});
                p.Model.DeptId = undefined;
            });

            // set dummy data
            p.DeptsData = [{ Name: "Dept 1", Id: 1 }, { Name: "Dept 2", Id: 2 }, { Name: "Dept 3", Id: 3 }];
            p.Model.SubDeptsData = {};
            p.Model.SubDeptsData[1] = [{ Name: "Dept 1.1", Id: 11 }, { Name: "Dept 1.2", Id: 12 }, { Name: "Dept 1.3", Id: 13 }];
            p.Model.SubDeptsData[2] = [{ Name: "Dept 2.1", Id: 21 }, { Name: "Dept 2.2", Id: 22 }, { Name: "Dept 2.3", Id: 23 }];
            p.Model.SubDeptsData[3] = [{ Name: "Dept 3.1", Id: 31 }, { Name: "Dept 3.2", Id: 32 }, { Name: "Dept 3.3", Id: 33 }];
            p.Model.DeptId = undefined;
            p.Model.SubDepts = [];
            p.Model.SubDeptId = undefined;

            // bindings
            p.BindElement("Name", "#search_form_name");
            p.BindCheckGroup({
                dataProp: "DeptId",
                selector: "#person_dept",
                data: p.DeptsData,
                dataTextField: "Name",
                dataValueField: "Id",
                multiselect: false,
                type:"radio"
            });


        })
        .CreatePresenter("PersonCreate", function (p) {

        })
        .CreatePresenter("PersonEdit", function (p, id) {

        })
        .CreatePresenter("PersonRead", function (p, id) {

        });


})(mainApp);