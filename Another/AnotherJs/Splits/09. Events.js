'use strict';

(function(a) {
    

    // events
    a.Events = {};

    // subscribe to event
    a.SubscribeToEvent = function (name, func) {

        // find
        var foundEv = a.CreateEvent(name);

        // add to subscribers
        foundEv.Subscribers.push(func);
    }

    // raise event
    a.RaiseEvent = function (name, obj) {
        
        // find
        var foundEv = a.CreateEvent(name);
        
        // check
        if (typeof obj !== "object") {
            obj = { value: obj };
        }

        // create obj
        obj.event = { timestamp: new Date(), name: name }

        // loop subscibers
        foundEv.Subscribers.forEach(function (s) {
            s(obj);
        });
    }

    // create event
    a.CreateEvent = function (name) {
        if (a.IsUndefinedOrNull(a.Events[name])) {

            a.Events[name] = {
                Subscribers: []
            };

        }
        return a.Events[name];

    }



})(Another);