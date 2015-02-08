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
                ObservableArray.prototype.checkRepeater.call(this, function (rpt) {
                    rpt.AddNewElement(value);
                });
                this.fireChange();
                return this;
            },

            // pop
            pop: function () {
                Array.prototype.pop.call(this);
                ObservableArray.prototype.checkRepeater.call(this, function (rpt) {
                    rpt.RemoveLastElement();
                });
                this.fireChange();
                return this;
            },

            // reverse
            reverse: function () {
                Array.prototype.reverse.call(this);
                ObservableArray.prototype.checkRepeater.call(this, function (rpt) {
                    rpt.ReverseElements();
                });
                this.fireChange();
                return this;
            },

            // slice
            slice: function (start, end) {
                var output = Array.prototype.slice.call(this, start, end);
                //this.fireChange();
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
                ObservableArray.prototype.checkRepeater.call(this, function (rpt) {
                    if (strt === undefined) {
                        rpt.RemoveAllElements();
                    } else {
                        rpt.SpliceElements(args);
                    }
                });
                this.fireChange();
                return this;
            },

            // sort
            sort: function () {
                throw new Error("Type Another.ObservableArray cannot 'sort'");
            },

            // shift
            shift: function () {
                var output = Array.prototype.shift.call(this);
                ObservableArray.prototype.checkRepeater.call(this, function (rpt) {
                    rpt.RemoveFirstElement();
                });
                this.fireChange();
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
                ObservableArray.prototype.checkRepeater.call(this, function (rpt) {
                    rpt.AddElementsInFront(args);
                });
                this.fireChange();
                return this;
            },

            // toString
            toString: function () {
                return "Another.ObservableArray";
            },

            // set observables
            setObservables: function (parentObj, childObjName, theObservables, fullName) {
                this.parentObj = parentObj;
                this.childObjName = childObjName;
                this.observables = theObservables;
                this.fullName = fullName;
            },

            // fire change
            fireChange: function () {

                // self
                var self = this;
                var theValue = self;

                // find in observables
                var found = a._getObservable(this.observables, this.fullName);

                // check
                if (found.length > 0) {
                    found.forEach(function (f) {

                        a._checkAndFireFromObservable(self.parentObj, f, self.childObjName, theValue);

                    });
                }

            },

            // set repeater
            setRepeater: function (rpt) {
                this.repeater = rpt;
            },

            // check repeater
            checkRepeater: function (func) {
                if (!a.Helpers.IsUndefinedOrNull(this.repeater) && a.Helpers.IsFunc(func)) {
                    func(this.repeater);
                }
            }


        };


        // ------------------------------------------------------ //
        // ------------------------------------------------------ //
        // ------------------------------------------------------ //
        // ------------------------------------------------------ //


        // Return the collection constructor.
        return (ObservableArray);


    }).call({});
    
    // convert
    a.ConvertToObservableArray = function (theValue, parentObj, childObjName, theObservables, fullName) {

        if (!a.ShouldBeObservableArray(theValue)) {
            return theValue;
        }
        if (a.Helpers.IsUndefinedOrNull(fullName) || fullName.IsNullOrEmpty())
            throw new Error("ConverToObservable final parameter is full graph name preceding the property name eg 'Level1.Leve2.'");
        var oArray = new a.ObservableArray();
        oArray.setObservables(parentObj, childObjName, theObservables, fullName);
        theValue.forEach(function (v) {
            oArray.pushNoFire(v);
        });
        return oArray;

    };

    // should be
    a.ShouldBeObservableArray = function (obj) {
        return a.Helpers.IsArray(obj) && obj.toString() !== "Another.ObservableArray";
    }

})(Another);