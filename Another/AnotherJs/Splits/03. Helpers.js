'use strict';


(function(a) {
    
    // helpers
    a.Helpers = {

        EndsWith: function (str, chars) {
            var ok = !a.Helpers.StringIsNullOrEmpty(str) && str.lastIndexOf(chars) === (str.length) - chars.length;
            return ok;
        },
        StripLast: function (str) {
            if (str === undefined || str === null || str === "")
                throw new Error("EndsWith: str cannot be null, empty or undefined");
            return str.substr(0, str.length - 1);
        },
        StartsWith: function (str, chars) {
            var ok = !a.Helpers.StringIsNullOrEmpty(str) && str.substr(0, chars.length) === chars;
            return ok;
        },
        StripFirst: function (str) {
            if (str === undefined || str === null || str === "")
                throw new Error("EndsWith: str cannot be null, empty or undefined");
            return str.substr(1);
        },
        StringIsNullOrEmpty: function (str) {
            return str === undefined || str === null || str === "";
        },
        IsUndefinedOrNull: function (obj) {
            return obj === undefined || obj === null;
        },
        Any: function (collection, lambda) {
            if (a.Helpers.IsUndefinedOrNull(lambda))
                throw new Error("Helpers.Any: lambda cannot be undefined");
            return !a.Helpers.IsUndefinedOrNull(collection) && collection.length > 0 && lambda(collection).length > 0;
        },
        IsFunc: function (func) {
            return !a.Helpers.IsUndefinedOrNull(func) && typeof func === "function";
        },
        IsArray: function (arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        },
        GetRandom: function (forId) {

            var rand = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            return forId ? "id_" + rand.replace("-", "") : rand;
        },
        Clone: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        EscapeRegExp: function (str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        },
        ReplaceAll: function (str, mtch, replWith) {
            str = str.replace(new RegExp(a.Helpers.EscapeRegExp(mtch), 'g'), replWith);
            return str;
        },
        FormatString: function (str, arr) {
            for (var i = 0; i < arr.length; i++) {
                var replWith = arr[i];
                if (a.Helpers.IsUndefinedOrNull(replWith)) {
                    replWith = '';
                } else {
                    replWith = replWith.toString();
                }
                str = a.Helpers.ReplaceAll(str, "{" + i + "}", replWith);
            }
            return str;
        }

    };

    // extensions
    String.prototype.IsNullOrEmpty = function () {
        return a.Helpers.StringIsNullOrEmpty(this);
    };
    String.prototype.IsNullOrWhitespace = function () {
        return this.IsNullOrEmpty() || this.replace(/^\s+/, '').replace(/\s+$/, '') === '';
    };
    Array.prototype.IsNullOrEmpty = function () {
        return a.Helpers.IsUndefinedOrNull(this) || this.length < 1;
    };
    Object.defineProperty(Object.prototype, "IsNullOrEmpty", {
        value: function () {

            return a.Helpers.IsUndefinedOrNull(this);
        }, enumerable: false
    });

})(Another);

