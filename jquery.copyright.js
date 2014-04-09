/*
 * jQuery Copyright plugin 0.1.1 
 * https://github.com/absentik/copyright
 * 
 * Author: Seleznev Alexander (ABSENT) 
 * Email: absenteg@gmail.com 
 * Website: http://whoisabsent.ru 
 *  
 * Licensed under the MIT license. 
 * http://www.opensource.org/licenses/mit-license.php 
 */

;(function($, window, document, undefined){

    var pluginName = "copyright";
    var defaults = {
        text: "<br>Original: " + window.location.href, 
        minlength: 0, 
        processing: undefined
    };

    function Copyright(element, options) {
        this.element = element;
        this._defaults = defaults;
        this._name = pluginName;
        this.options = $.extend({}, defaults, options);
        this.action = typeof options === "string" ? options : "default";
        this.init();
    }

    Copyright.prototype.getSelectedText = function() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection) {
            text = document.selection.createRange().text;
        }
        return text;
    };

    Copyright.prototype.setSelectionRange = function() {
        if (window.getSelection) {
            var range = document.createRange();
            range.selectNodeContents(this.div);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.selection && document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(this.div);
            textRange.select();
        }
    };

    Copyright.prototype.removeSelectionRange = function() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    };

    Copyright.prototype.saveSelectionRange = function() {
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                return sel.getRangeAt(0);
            }
        } else if (document.selection) {
            return document.selection.createRange();
        }
        return null;
    };

    Copyright.prototype.restoreSelectionRange = function() {
        if (this.range) {
            if (window.getSelection) {
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(this.range);
            } else if (document.selection) {
                this.range.select();
            }
        }
        else {
            this.it.removeSelectionRange();
        }
    };

    Copyright.prototype.copy = function() {
        var it = this;
        var body = $("body");
        var selectText = it.getSelectedText();
        var range = it.saveSelectionRange(body[0]);

        if (selectText.length > it.options.minlength) {
            if (typeof it.options.processing == "function") {
                selectText = it.options.processing(selectText);
            }
            selectText += it.options.text;
        }

        var div = $("<div/>", { 
            html: selectText, 
            style: "width: 1px; height: 1px; overflow: hidden; position: absolute; top: -99999px; left: -99999px; opacity: 0.01" 
        }).appendTo(body);
        it.setSelectionRange.call({ div: div[0] });

        //after copy function
        window.setTimeout(function() {
            it.restoreSelectionRange.call({ it: it, range: range });
            div.remove();
            return $(it.element).trigger(pluginName + "_AfterCopy");
        }, 0);

        return $(it.element).trigger(pluginName + "_BeforeCopy");
    };

    Copyright.prototype.remove = function() {
        var it = this;
        $(it.element).off("copy");
    };

    Copyright.prototype.start = function() {
        var it = this;
        $(it.element).on("copy", function() { 
            it.copy(); 
        });
    };

    Copyright.prototype.init = function() {
        switch (this.action) {
            case "remove":
                return this.remove();
            break;
            default:
                return this.start();
            break;
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            $.data(this, 'plugin_' + pluginName, new Copyright(this, options));
        });
    }

})(jQuery, window, document);