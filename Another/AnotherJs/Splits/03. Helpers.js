'use strict';


(function (a) {

    a.EndsWith = function (str, chars) {
        var ok = !a.StringIsNullOrEmpty(str) && str.lastIndexOf(chars) === (str.length) - chars.length;
        return ok;
    };
    a.StripLast = function (str) {
        if (str === undefined || str === null || str === "")
            throw new Error("EndsWith: str cannot be null, empty or undefined");
        return str.substr(0, str.length - 1);
    };
    a.StartsWith = function (str, chars) {
        var ok = !a.StringIsNullOrEmpty(str) && str.substr(0, chars.length) === chars;
        return ok;
    };
    a.StripFirst = function (str) {
        if (str === undefined || str === null || str === "")
            throw new Error("EndsWith: str cannot be null, empty or undefined");
        return str.substr(1);
    }
    a.StringIsNullOrEmpty = function (str) {
        return str === undefined || str === null || str === "";
    };
    a.IsUndefinedOrNull = function (obj) {
        return obj === undefined || obj === null;
    };
    a.Any = function (collection, lambda) {
        if (a.IsUndefinedOrNull(lambda))
            throw new Error("Helpers.Any: lambda cannot be undefined");
        return !a.IsUndefinedOrNull(collection) && collection.length > 0 && lambda(collection).length > 0;
    };
    a.IsFunc = function (func) {
        return !a.IsUndefinedOrNull(func) && typeof func === "function";
    };
    a.IsArray = function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };
    a.GetRandom = function (forId) {

        var rand = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return forId ? "id_" + rand.replace("-", "") : rand;
    };
    a.Clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    a.EscapeRegExp = function (str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
    a.ReplaceAll = function (str, mtch, replWith) {
        str = str.replace(new RegExp(a.EscapeRegExp(mtch), 'g'), replWith);
        return str;
    };
    a.FormatString = function (str, arr) {
        for (var i = 0; i < arr.length; i++) {
            var replWith = arr[i];
            if (a.IsUndefinedOrNull(replWith)) {
                replWith = '';
            } else {
                replWith = replWith.toString();
            }
            str = a.ReplaceAll(str, "{" + i + "}", replWith);
        }
        return str;
    },
    a.StripWhitespace=function(str) {
        return str.replace(/ /g, '');
    }

})(Another);

