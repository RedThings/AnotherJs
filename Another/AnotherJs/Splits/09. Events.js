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

        // create obj
        obj.Event = { Timestamp: new Date(), Name: name }

        // loop subscibers
        foundEv.Subscribers.forEach(function (s) {
            s(obj);
        });
    }

    // create event
    a.CreateEvent = function (name) {
        if (a.Helpers.IsUndefinedOrNull(a.Events[name])) {

            a.Events[name] = {
                Subscribers: []
            };

        }
        return a.Events[name];

    }



})(Another);