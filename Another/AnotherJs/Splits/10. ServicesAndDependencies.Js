'use strict';

(function(a) {
    
    // services
    a.Services = {};

    // services
    a.StaticServices = {};

    // create service
    a.AddService = function (name, type, deps, svc) {

        if (a.Helpers.IsUndefinedOrNull(deps)) {
            svc = deps;
            deps = undefined;
        }

        if (a.Helpers.IsUndefinedOrNull(name) || a.Helpers.IsUndefinedOrNull(svc) || a.Helpers.IsUndefinedOrNull(type) || type.IsNullOrEmpty() || name.IsNullOrEmpty() || !a.Helpers.IsFunc(svc))
            throw ("AddService: name, type and svc must be strings and a function respectively");
        if (a.Services[name] !== undefined)
            throw ("AddService: service '" + name + "' already exists");

        a.Services[name] = { Name: name, Dependencies: deps, Service: svc, Type: type };
    }

    // get service
    a.GetService = function (svcName) {

        var svc = a.Services[svcName];
        if (a.Helpers.IsUndefinedOrNull(svc))
            throw ("Cannot find service '" + svcName + "'");

        // try static
        if (svc.Type === "Static" && a.StaticServices[svcName] !== undefined)
            return a.StaticServices[svcName];

        // try dependencyless
        if (svc.Dependencies === undefined) {
            if (svc.Type === "Static") {
                var output = new svc.Service();
                a.StaticServices[output.Name] = output;
                return output;
            } else {
                return new svc.Service();
            }
        } else {

            // with deps
            var depsString = "";
            var outputString = "theService = new svc.Service(";
            var theService = undefined;
            for (var i = 0; i < svc.Dependencies.length; i++) {
                depsString += "var d" + i + " = a.GetDependency('" + svc.Dependencies[i] + "'); ";
                outputString += "d" + i;
                if (i < svc.Dependencies.length - 1)
                    outputString += ",";
            }
            outputString += ");";
            eval(depsString + outputString);
            // ReSharper disable once ConditionIsAlwaysConst
            // ReSharper disable once HeuristicallyUnreachableCode
            if (theService !== undefined) {
                if (svc.Type === "Static") {
                    a.StaticDependencies[svc.Name] = theService;
                }
            }

            return theService;
        }
    }

    // dependencies
    a.Dependencies = {};

    // static dependencies
    a.StaticDependencies = {};

    // mocking
    a.MockDependency = function (name, type, dep) {
        a.Dependencies[name] = undefined;
        a.AddDependency(name, type, [], dep);
    }

    // add depenency
    a.AddDependency = function (name, type, deps, dep) {
        if (a.Helpers.IsUndefinedOrNull(dep)) {
            dep = deps;
            deps = [];
        }

        if (a.Helpers.IsUndefinedOrNull(name) || a.Helpers.IsUndefinedOrNull(type) || name.IsNullOrEmpty() || type.IsNullOrEmpty() || !a.Helpers.IsFunc(dep))
            throw ("AddDependency: name and type must be a string and dep must be a function");
        if (a.Dependencies[name] !== undefined)
            throw ("AddDependency: dependency '" + name + "' already exists");

        a.Dependencies[name] = { Name: name, Dependency: dep, Dependencies: deps, Type: type };
    }

    // get dependency
    a.GetDependency = function (dep) {
        var output = a.Dependencies[dep];
        if (a.Helpers.IsUndefinedOrNull(output))
            throw ("GetDependency: '' is not a dependency");

        // check static
        if (output.Type === "Static" && a.StaticDependencies[name] !== undefined) {
            return a.StaticDependencies[name];
        }

        // get deps string
        if (output.Dependencies !== undefined) {
            var depsString = "";
            var outputString = "theDep = new output.Dependency(";
            var theDep = undefined;
            for (var i = 0; i < output.Dependencies.length; i++) {
                depsString += "var d" + i + " = a.GetDependency('" + output.Dependencies[i] + "'); ";
                outputString += "d" + i;
                if (i < output.Dependencies.length - 1)
                    outputString += ",";
            }
            outputString += ");";
            eval(depsString + outputString);
            // ReSharper disable once ConditionIsAlwaysConst
            // ReSharper disable once HeuristicallyUnreachableCode
            if (theDep !== undefined) {
                if (output.Type === "Static") {
                    a.StaticDependencies[output.Name] = theDep;
                }

            }

            return theDep;

        } else {

            if (output.Type === "Static") {
                var depend = new output.Dependency();
                a.StaticDependencies[output.Name] = depend;
                return depend;

            } else {
                return new output.Dependency();
            }
        }
    }


})(Another);