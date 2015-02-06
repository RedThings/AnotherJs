(function (app) {



    app
        .CreatePresenter("Home", function (p) {

            p.Model.LongRepeater = [];
            var i = 0;
            var latesti = 0;

            latesti = i;
            p.BindRepeater({
                data: "LongRepeater",
                selector: "#long_repeater",
                onRowBinding: function (el, row) {
                    el.html("<a href='#' data-aclick>"+row+"</a>");
                }
            });
            p.Click("[data-aclick]", {
                onClick: function (e, el) {
                    console.log("Clicked: ", el);
                    console.log("From event: ", e);
                }
            });

            var recurse = function () {
                p.Model.LongRepeater.push("No." + i);
                i++;
                if (i <= 2000) {
                    //window.setTimeout(recurse, 0);
                    recurse();
                }
            }
            p.Element("#btnStart").click(function (e) {

                e.preventDefault();

                p.Model.LongRepeater.splice();
                i = 0;
                latesti = 0;
                recurse();


            });
            p.Element("#btnAddMore").click(function (e) {
                e.preventDefault();
                console.log("Before ", p.Model.LongRepeater.length);
                for (i; i < latesti + 10; i++) {
                    p.Model.LongRepeater.push("No." + i);
                }
                latesti = i;
                console.log("After ", p.Model.LongRepeater.length);
            });
            p.Element("#btnReverse").click(function (e) {
                e.preventDefault();
                p.Model.LongRepeater.reverse();
                console.log("Reversed!! First element is now ", p.Model.LongRepeater[0]);
            });
            p.Element("#btnPop").click(function (e) {
                e.preventDefault();
                p.Model.LongRepeater.pop();
                console.log("Popped!! Last element is now ", p.Model.LongRepeater[p.Model.LongRepeater.length - 1]);
            });
            p.Element("#btnShift").click(function (e) {
                e.preventDefault();
                p.Model.LongRepeater.shift();
                console.log("Shifted!! First element is now ", p.Model.LongRepeater[0]);
            });
            var spliceCount = 0;
            p.Element("#btnSplice").click(function (e) {
                e.preventDefault();
                p.Model.LongRepeater.splice(200 - spliceCount, 200, "A___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS", "B___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS", "C___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS", "D___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS", "E___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS", "F___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS", "G___AAAAAAAAAAAARRRRRRRRRRRRRGGGGGGGGGGGGGGSSSSSSSSSSSSSS");
                console.log("Spliced!!");
                spliceCount -= 20;
            });
            p.Element("#btnUnshift").click(function (e) {
                e.preventDefault();
                p.Model.LongRepeater.unshift("A___*******", "B___*******", "C___*******", "D___*******", "E___*******", "F___*******", "G___*******");
                console.log("Spliced!!");
            });

        })
        .CreatePresenter("About", function (p) {

            // set model state
            p.Model.Inner = {}
            p.Model.Inner.ShowImages = false;
            p.Model.Inner.EnableButton = true;

            // set inner observes
            p.ObserveInnerObject("Inner");

            // set events
            p.Element("#btnShowHide").click(function (e) {
                e.preventDefault();
                p.Model.Inner.ShowImages = !p.Model.Inner.ShowImages;
            });
            p.Element("#btnDisable").click(function (e) {
                e.preventDefault();
                p.Model.Inner.EnableButton = !p.Model.Inner.EnableButton;
            });

            // set conditionals
            p.ShowWhen(["#firstImage", "[data-showhide]"], function () {
                return p.Model.Inner.ShowImages;
            });
            p.EnableWhen(["#btnShowHide"], function () {
                return p.Model.Inner.EnableButton === true;
            });

            // set bindings
            p.Bind("Inner.ShowImages", function (res) {
                console.log("Show Images ", res);
            });

        });



})(mainApp);