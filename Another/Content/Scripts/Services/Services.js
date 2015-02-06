var servicesApp = Another.CreateApplication("Services");
(function (app, a) {

    var baseUrl = function (restOfUrl) {
        return "https://dazzling-fire-9056.firebaseio.com/" + restOfUrl;
    }

    app.AddService("PersonService", "Static", ["Http"], function (http) {

        

        this.GetDepts = function (callback) {
            http.Get(baseUrl("Dept.json"))
                .success(function (d) {
                    callback(d);
                });
        }
        this.GetSubDepts = function (callback) {
            http.Get(baseUrl("SubDept.json"))
                .success(function (d) {
                    callback(d);
                });
        }
        this.GetJobs = function (callback) {
            http.Get(baseUrl("Job.json"))
                .success(function (d) {
                    callback(d);
                });
        }
        this.GetAges = function (callback) {
            http.Get(baseUrl("AgeRange.json"))
                .success(function (d) {
                    callback(d);
                });
        }

    });

    app.AddService("FormService", "Static", ["Http"], function (http) {

        this.GetData = function () {

            //http.Get(baseUrl("Dept.json")).success(function(checkData) {
            //    if (checkData === null) {
            //        http.Put(baseUrl("Dept/1.json"), { Name: "Finance", Id: 1 });
            //        http.Put(baseUrl("Dept/2.json"), { Name: "Marketing", Id: 2 });
            //        http.Put(baseUrl("Dept/3.json"), { Name: "Development", Id: 3 });
            //        http.Put(baseUrl("Dept/4.json"), { Name: "HR", Id: 4 });
            //    }
            //});
            //http.Get(baseUrl("SubDept.json")).success(function (checkData) {
            //    if (checkData === null) {
            //        http.Put(baseUrl("SubDept/1.json"), { Name: "Accounts", Id: 1, DeptId: 1 });
            //        http.Put(baseUrl("SubDept/2.json"), { Name: "Compliance", Id: 2, DeptId: 1 });
            //        http.Put(baseUrl("SubDept/3.json"), { Name: "CRM", Id: 3, DeptId: 2 });
            //        http.Put(baseUrl("SubDept/4.json"), { Name: "Design", Id: 4, DeptId: 2 });
            //        http.Put(baseUrl("SubDept/5.json"), { Name: "Main", Id: 5, DeptId: 3 });
            //        http.Put(baseUrl("SubDept/6.json"), { Name: "Special projects", Id: 6, DeptId: 3 });
            //        http.Put(baseUrl("SubDept/7.json"), { Name: "Recruitment", Id: 7, DeptId: 4 });
            //        http.Put(baseUrl("SubDept/8.json"), { Name: "Team", Id: 8, DeptId: 4 });
            //    }
            //});
            //http.Get(baseUrl("Job.json")).success(function (checkData) {
            //    if (checkData === null) {
            //        http.Put(baseUrl("Job/1.json"), { Name: "Accountant", Id: 1 });
            //        http.Put(baseUrl("Job/2.json"), { Name: "Developer", Id: 2 });
            //        http.Put(baseUrl("Job/3.json"), { Name: "Designer", Id: 3 });
            //        http.Put(baseUrl("Job/4.json"), { Name: "HR Assistant", Id: 4 });
            //    }
            //});
            //http.Get(baseUrl("AgeRange.json")).success(function (checkData) {
            //    if (checkData === null) {
            //        http.Put(baseUrl("AgeRange/1.json"), { Name: "18-30", Id: 1 });
            //        http.Put(baseUrl("AgeRange/2.json"), { Name: "31-40", Id: 2 });
            //        http.Put(baseUrl("AgeRange/3.json"), { Name: "40-49", Id: 3 });
            //        http.Put(baseUrl("AgeRange/4.json"), { Name: "50+", Id: 4 });
            //    }
            //});

        };

    });

})(servicesApp, Another);