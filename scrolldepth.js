/*!
 * scrolldepth.js with dojo flavor | v0.1
 * Copyright (c) 2013 Conceptboard GmbH (@conceptboardapp)
 * Licensed under the MIT and GPL licenses.
 */

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dojo/window",
        "dojo/on"
    ],
    function(
        declare,
        lang,
        array,
        domGeom,
        win,
        on
    ) {
    
    return declare(null, {
        elements: [],
        minHeight: 0,
        percentage: true,
        testing: false,
        
        constructor: function(args){
            lang.mixin(this, args);
            this.startTime = +new Date;
            this.cache = [];
            this.init();
        },
        
        init: function(){
            // Return early if document height is too small
            if (domGeom.position(dojo.body()).h < this.minHeight) {
                console.warn("minHeight succeeds document height");
                return;
            }
            
            // Establish baseline (0% scroll)
            this.sendEvent('Percentage', 'Baseline');
            
            // Connect to scroll event
            this.scrollEvent = on(window, 'scroll', lang.hitch(this, this._handleScroll));
        },
        
        sendEvent: function(action, label, timing){
            if (!this.testing) {
                _gaq.push(['_trackEvent', 'Scroll Depth', action, label, 1, true]);
                if (arguments.length > 2) {
                    _gaq.push(['_trackTiming', 'Scroll Depth', action, timing, label, 100]);
                }
            } else {
                console.log(action + ': ' + label);
            }
        },
        
        calculateMarks: function(docHeight){
            return {
                '25%' : parseInt(docHeight * 0.25, 10),
                '50%' : parseInt(docHeight * 0.50, 10),
                '75%' : parseInt(docHeight * 0.75, 10),
                '100%': docHeight - 1 // 1px cushion to trigger 100% event in iOS
            };
        },
        
        checkMarks: function(marks, scrollDistance, timing) {
            for (var key in marks){
                if (array.indexOf(this.cache, key) === -1 && scrollDistance >= marks[key]) {
                    this.sendEvent('Percentage', key, timing);
                    this.cache.push(key);
                }
            }
        },

        /*
        checkElements: function(elements, scrollDistance, timing) {
            array.forEach(elements, function(index, elem) {
                if (array.indexOf(elem, this.cache) === -1 && elem.length) {
                    if (scrollDistance >= elem.offset().top) {
                        this.sendEvent('Elements', elem, timing);
                        this.cache.push(elem);
                    }
                }
            });
        },
        */
        
        _handleScroll: function(){
             // We calculate document and window height on each scroll event to account for dynamic DOM changes.
             var docHeight = domGeom.position(dojo.body()).h;
             var winHeight = win.getBox().h;
             var scrollDistance = dojo.body().scrollTop + winHeight;

             // Recalculate percentage marks
             var marks = this.calculateMarks(docHeight);

             // Timing
             var timing = +new Date - this.startTime;
             
             // If all marks already hit, unbind scroll event
             if (this.cache.length >= 4 + this.elements.length) {
                 this.scrollEvent.remove();
                 return;
             }
             
             /*
             // Check specified DOM elements (optional)
             if (this.elements.length > 0) {
                 this.checkElements(this.elements, scrollDistance, timing);
             }
             */

             // Check standard marks (default)
             if (this.percentage) {        
                 this.checkMarks(marks, scrollDistance, timing);
             }
        }
    });
});