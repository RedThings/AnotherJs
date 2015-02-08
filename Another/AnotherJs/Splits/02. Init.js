'use strict';

// check jQuery
if (jQuery === undefined) {
    throw new Error("Another currently uses jQuery v2.x as a dom helper");
}
// declare another literal
if (window.Another === undefined) {
    window.Another = {};
}