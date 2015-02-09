'use strict';

(function(a) {
    
    // observable array
    // Adapted from http://www.bennadel.com/blog/2292-extending-javascript-arrays-while-keeping-native-bracket-notation-functionality.htm
    // Define the collection class.
    a.ObservableArray = (function () {


        // I am the constructor function.
        // ReSharper disable once InconsistentNaming
        function ObservableArray() {

            // When creating the collection, we are going to work off
            // the core array. In order to maintain all of the native
            // array features, we need to build off a native array.
            var collection = Object.create(Array.prototype);

            // Initialize the array. This line is more complicated than
            // it needs to be, but I'm trying to keep the approach
            // generic for learning purposes.
            collection = (Array.apply(collection, arguments) || collection);

            // Add all the class methods to the collection.
            ObservableArray.injectClassMethods(collection);

            // Return the new collection object.
            return (collection);

        }


        // ------------------------------------------------------ //
        // ------------------------------------------------------ //


        // Define the static methods.
        ObservableArray.injectClassMethods = function (collection) {

            // Loop over all the prototype methods and add them
            // to the new collection.
            for (var method in ObservableArray.prototype) {

                // Make sure this is a local method.
                if (ObservableArray.prototype.hasOwnProperty(method)) {

                    // Add the method to the collection.
                    collection[method] = ObservableArray.prototype[method];

                }

            }

            // Return the updated collection.
            return (collection);

        };


        // I create a new collection from the given array.
        ObservableArray.fromArray = function (array) {

            // Create a new collection.
            var collection = ObservableArray.apply(null, array);

            // Return the new collection.
            return (collection);

        };


        // I determine if the given object is an array.
        ObservableArray.isArray = function (value) {

            // Get it's stringified version.
            var stringValue = Object.prototype.toString.call(value);

            // Check to see if the string represtnation denotes array.
            return (stringValue.toLowerCase() === "[object array]");

        };


        // ------------------------------------------------------ //
        // ------------------------------------------------------ //


        // Define the class methods.
        ObservableArray.prototype = {

            // I add the given item to the collection. If the given item
            // is an array, then each item within the array is added
            // individually.
            add: function (value) {

                // Check to see if the item is an array.
                if (ObservableArray.isArray(value)) {

                    // Add each item in the array.
                    for (var i = 0 ; i < value.length ; i++) {

                        // Add the sub-item using default push() method.
                        Array.prototype.push.call(this, value[i]);

                    }

                } else {

                    // Use the default push() method.
                    Array.prototype.push.call(this, value);

                }

                // Return this object reference for method chaining.
                return (this);

            },


            // I add all the given items to the collection.
            addAll: function () {

                // Loop over all the arguments to add them to the
                // collection individually.
                for (var i = 0 ; i < arguments.length ; i++) {

                    // Add the given value.
                    this.add(arguments[i]);

                }

                // Return this object reference for method chaining.
                return (this);

            },

            // push no fire
            pushNoFire: function (value) {
                Array.prototype.push.call(this, value);
                return this;
            },

            // push
            push: function (value) {
                
                Array.prototype.push.call(this, value);

                var args = arguments;
                this.fireChange("push", args);

                return this;
            },

            // pop
            pop: function () {
                Array.prototype.pop.call(this);
                var args = arguments;
                this.fireChange("pop", args);
                return this;
            },

            // reverse
            reverse: function () {
                Array.prototype.reverse.call(this);
                var args = arguments;
                this.fireChange("reverse", args);
                return this;
            },

            // slice
            slice: function (start, end) {
                var output = Array.prototype.slice.call(this, start, end);
                return output;
            },

            // splice
            splice: function (strt, lngth) {
                var args = arguments;
                Array.prototype.splice.call(this, strt, lngth);
                var countr = 2;
                for (countr; countr < args.length; countr++) {
                    var theVal = args[countr];
                    Array.prototype.splice.call(this, strt, 0, theVal);
                    strt++;
                }
                this.fireChange("splice", args);
                return this;
            },

            // sort
            sort: function () {
                throw new Error("Type Another.ObservableArray cannot 'sort'");
            },

            // shift
            shift: function () {
                var output = Array.prototype.shift.call(this);
                var args = arguments;
                this.fireChange("shift", args);
                return output;
            },

            // unshift
            unshift: function () {
                var args = arguments;
                var countr = 0;
                for (countr; countr < args.length; countr++) {
                    var theVal = args[countr];
                    Array.prototype.splice.call(this, 0, 0, theVal);
                }
                this.fireChange("unshift", args);
                return this;
            },

            // toString
            toString: function () {
                return "Another.ObservableArray";
            },

            //// set observables
            //setObservables: function (parentObj, childObjName, theObservables, fullName) {
            //    this.parentObj = parentObj;
            //    this.childObjName = childObjName;
            //    this.observables = theObservables;
            //    this.fullName = fullName;
            //},

            subscribeToChanges:function(func) {
                if (this.subscribers === undefined) this.subscribers = [];
                this.subscribers.push(func);
            },

            // fire change
            fireChange: function (nm,args) {

                var ts = this;
                if (this.subscribers !== undefined) {
                    ts.subscribers.forEach(function(func) {

                        func(nm,args,ts);

                    });
                }

            },

            initialize:function(fullName, origArr) {

                // self
                var ts = this;

                // set name
                this.fullName = fullName;

                // set arr
                this.originalArray = origArr;
                this.originalArray.forEach(function(d) {
                    ts.pushNoFire(d);
                });


            }

        };


        // ------------------------------------------------------ //
        // ------------------------------------------------------ //
        // ------------------------------------------------------ //
        // ------------------------------------------------------ //


        // Return the collection constructor.
        return (ObservableArray);


    }).call({});
    
    //// convert
    //a.ConvertToObservableArray = function (theValue, parentObj, childObjName, theObservables, fullName) {

    //    if (!a.ShouldBeObservableArray(theValue)) {
    //        return theValue;
    //    }
    //    if (a.IsUndefinedOrNull(fullName) || fullName.IsNullOrEmpty())
    //        throw new Error("ConverToObservable final parameter is full graph name preceding the property name eg 'Level1.Leve2.'");
    //    var oArray = new a.ObservableArray();
    //    oArray.setObservables(parentObj, childObjName, theObservables, fullName);
    //    theValue.forEach(function (v) {
    //        oArray.pushNoFire(v);
    //    });
    //    return oArray;

    //};

    

})(Another);