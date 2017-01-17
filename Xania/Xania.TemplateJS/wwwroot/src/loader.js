"use strict";
var dom_1 = require("./dom");
var core_1 = require("./core");
var template_1 = require("./template");
var fsharp_1 = require("./fsharp");
var Loader;
(function (Loader) {
    function domReady(fn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (document.readyState !== "loading") {
            fn.apply(null, args);
        }
        else {
            document.addEventListener("DOMContentLoaded", function () { return fn.apply(null, args); });
        }
    }
    function init(root) {
        var stack = [root];
        while (stack.length > 0) {
            var dom = stack.pop();
            if (!!dom["content"] && !!dom.attributes["name"]) {
                var name = dom.attributes["name"].value;
                var parts = name.split('.');
            }
            else {
                for (var i = 0; i < dom.childNodes.length; i++) {
                    var child = dom.childNodes[i];
                    if (child.nodeType === 1)
                        stack.push(child);
                }
            }
        }
    }
    Loader.init = init;
})(Loader || (Loader = {}));
var Parser = (function () {
    function Parser() {
    }
    Parser.parseText = function (text) {
        var parts = [];
        var appendText = function (x) {
            var s = x.trim();
            if (s.length > 0)
                parts.push(x);
        };
        var offset = 0;
        while (offset < text.length) {
            var begin = text.indexOf("{{", offset);
            if (begin >= 0) {
                if (begin > offset)
                    appendText(text.substring(offset, begin));
                offset = begin + 2;
                var end = text.indexOf("}}", offset);
                if (end >= 0) {
                    parts.push(fsharp_1.fsharp(text.substring(offset, end)));
                    offset = end + 2;
                }
                else {
                    throw new SyntaxError("Expected '}}' but not found starting from index: " + offset);
                }
            }
            else {
                appendText(text.substring(offset));
                break;
            }
        }
        if (parts.length === 1)
            return parts[0];
        return parts;
    };
    Parser.parseAttr = function (tagElement, attr) {
        var name = attr.name;
        if (name === "click" || name.startsWith("keyup.")) {
            var fn = this.parseText(attr.value);
            tagElement.addEvent(name, fn);
        }
        else if (name === "data-select" || name === "data-from") {
            var fn = this.parseText(attr.value);
            tagElement.select(fn);
        }
        else if (name === "checked") {
            var fn = this.parseText(attr.value);
            tagElement.attr(name, core_1.Core.compose(function (ctx) { return !!ctx ? "checked" : null; }, fn));
        }
        else {
            var tpl = this.parseText(attr.value);
            tagElement.attr(name, tpl || attr.value);
            if (!!tagElement.name.match(/^input$/i) && !!attr.name.match(/^name$/i) && tagElement.getAttribute("value") != undefined) {
                var valueAccessor = this.parseText(attr.value);
                tagElement.attr("value", valueAccessor);
            }
        }
    };
    Parser.parseNode = function (root) {
        var stack = [root];
        while (stack.length > 0) {
            var node = stack.pop();
            if (node.nodeType === 1) {
                var elt = node;
                var template = new template_1.Template.TagTemplate(elt.tagName, elt.namespaceURI);
                for (var i = 0; !!elt.attributes && i < elt.attributes.length; i++) {
                    var attribute = elt.attributes[i];
                    this.parseAttr(template, attribute);
                }
                return template;
            }
            else if (node.nodeType === 3) {
                var textContent = node.textContent;
                if (textContent.trim().length > 0) {
                    var tpl = this.parseText(textContent);
                    return new template_1.Template.TextTemplate(tpl || node.textContent);
                }
            }
        }
        return undefined;
    };
    return Parser;
}());
function bind(node) {
    var children = [];
    if (!!node["content"]) {
        var content = node["content"];
        for (var i = content.childNodes.length - 1; i >= 0; i--) {
            var tpl = Parser.parseNode(content.childNodes[i]);
            if (tpl)
                children.push(tpl);
        }
    }
    console.log(node, node.parentElement);
    return new dom_1.Dom.ContentBinding(null, function (dom) { return node.parentElement.insertBefore(dom, node); }, children);
}
exports.bind = bind;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkJBQTJCO0FBQzNCLCtCQUE2QjtBQUM3Qix1Q0FBcUM7QUFDckMsbUNBQXVDO0FBSXZDLElBQU8sTUFBTSxDQWtFWjtBQWxFRCxXQUFPLE1BQU07SUFHVCxrQkFBa0IsRUFBRTtRQUFFLGNBQWM7YUFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO1lBQWQsNkJBQWM7O1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNwQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsY0FBTSxPQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFDOUUsQ0FBQztJQUNMLENBQUM7SUFFRCxjQUFxQixJQUFJO1FBSXJCLElBQUksS0FBSyxHQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0IsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3RCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUV0QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBSXhDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxL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QUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFhLElBQUksSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDeEQsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxDQUFDLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxJQUFJLEVBQXhCLENBQXdCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBR3pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFP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QUFJLEVBQUUsVUFBQSxHQUFHLElBQUksT0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQTFDLENBQTBDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDckcsQ0FBQztBQWJELG9CQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRG9tIH0gZnJvbSBcIi4vZG9tXCJcclxuaW1wb3J0IHsgQ29yZSB9IGZyb20gJy4vY29yZSdcclxuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tIFwiLi90ZW1wbGF0ZVwiXHJcbmltcG9ydCB7IGZzaGFycCBhcyBmcyB9IGZyb20gXCIuL2ZzaGFycFwiXHJcblxyXG5kZWNsYXJlIGZ1bmN0aW9uIHJlcXVpcmUobW9kdWxlOiBzdHJpbmcpO1xyXG5cclxubW9kdWxlIExvYWRlciB7XHJcbiAgICBkZWNsYXJlIHZhciBkb2N1bWVudDogYW55O1xyXG5cclxuICAgIGZ1bmN0aW9uIGRvbVJlYWR5KGZuLCAuLi5hcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIikge1xyXG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiBmbi5hcHBseShudWxsLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbml0KHJvb3QpIHtcclxuXHJcbiAgICAgICAgLy8gICAgdmFyIGNvbnRhaW5lciA9IG5ldyBEYXRhLk9iamVjdENvbnRhaW5lcigpO1xyXG4gICAgICAgIC8vICAgIC8vIEZpbmQgdG9wIGxldmVsIGNvbXBvbmVudHMgYW5kIGJpbmRcclxuICAgICAgICB2YXIgc3RhY2s6IE5vZGVbXSA9IFtyb290XTtcclxuXHJcbiAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGRvbSA9IHN0YWNrLnBvcCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEhZG9tW1wiY29udGVudFwiXSAmJiAhIWRvbS5hdHRyaWJ1dGVzW1wibmFtZVwiXSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBkb20uYXR0cmlidXRlc1tcIm5hbWVcIl0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAvLyBsZXQgbW9kZWwgPSBldmFsKCcoJyArIG5hbWVBdHRyLnZhbHVlICsgJyknKTtcclxuICAgICAgICAgICAgICAgIC8vIHZhciBzdG9yZSA9IG5ldyBSZS5TdG9yZShtb2RlbCwgW0NvcmUuTGlzdCwgQ29yZS5NYXRoLCBDb3JlLkRhdGVzXS5yZWR1Y2UoKHgsIHkpID0+IE9iamVjdC5hc3NpZ24oeCwgeSksIHt9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdCgnLicpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHZhciBtb2R1bGUgPSByZXF1aXJlKHBhcnRzWzBdKTtcclxuICAgICAgICAgICAgICAgIC8vIHZhciBjb21wb25lbnQgPSBtb2R1bGVbcGFydHNbMV1dO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbXBvbmVudCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcGFyc2VEb20oZG9tKTtcclxuICAgICAgICAgICAgICAgIC8vIERvbS5iaW5kKGRvbSwgc3RvcmUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vaWYgKCEhbW9kZWwuaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgbW9kZWwuaW5pdChzdG9yZSk7XHJcbiAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgICAgIC8vfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vICAgIHZhciBuYW1lID0gZG9tLm5vZGVOYW1lLnJlcGxhY2UoL1xcLS8sIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICBsZXQgbW9kZWwgPSBjb250YWluZXIuZ2V0KG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgaWYgKG1vZGVsICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9tLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgdmFyIGF0dHIgPSBkb20uYXR0cmlidXRlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBtb2RlbFthdHRyLm5hbWVdID0gZXZhbChhdHRyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9tO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgIERvbS5pbXBvcnRWaWV3KGRvbS5ub2RlTmFtZSArIFwiLmh0bWxcIilcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgLnRoZW4oZG9tID0+IHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IG5ldyBEYXRhLlN0b3JlKG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIFtDb3JlLkxpc3QsIENvcmUuTWF0aCwgQ29yZS5EYXRlc10ucmVkdWNlKCh4LCB5KSA9PiBPYmplY3QuYXNzaWduKHgsIHkpLCB7fSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIHZhciBmcmFnbWVudCA9IERvbS5iaW5kKGRvbSwgc3RvcmUpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdGVtcGxhdGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZnJhZ21lbnQsIHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvbS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gZG9tLmNoaWxkTm9kZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyAgICAgZG9tUmVhZHkoaW5pdCwgZG9jdW1lbnQuYm9keSk7XHJcbn1cclxuXHJcbmNsYXNzIFBhcnNlciB7XHJcblxyXG4gICAgc3RhdGljIHBhcnNlVGV4dCh0ZXh0KTogYW55W10ge1xyXG4gICAgICAgIHZhciBwYXJ0czogYW55W10gPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIGFwcGVuZFRleHQgPSAoeCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgcyA9IHgudHJpbSgpO1xyXG4gICAgICAgICAgICBpZiAocy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgcGFydHMucHVzaCh4KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcclxuICAgICAgICB3aGlsZSAob2Zmc2V0IDwgdGV4dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIGJlZ2luID0gdGV4dC5pbmRleE9mKFwie3tcIiwgb2Zmc2V0KTtcclxuICAgICAgICAgICAgaWYgKGJlZ2luID49IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChiZWdpbiA+IG9mZnNldClcclxuICAgICAgICAgICAgICAgICAgICBhcHBlbmRUZXh0KHRleHQuc3Vic3RyaW5nKG9mZnNldCwgYmVnaW4pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBiZWdpbiArIDI7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSB0ZXh0LmluZGV4T2YoXCJ9fVwiLCBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVuZCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFydHMucHVzaChmcyh0ZXh0LnN1YnN0cmluZyhvZmZzZXQsIGVuZCkpKTtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBlbmQgKyAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJFeHBlY3RlZCAnfX0nIGJ1dCBub3QgZm91bmQgc3RhcnRpbmcgZnJvbSBpbmRleDogXCIgKyBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kVGV4dCh0ZXh0LnN1YnN0cmluZyhvZmZzZXQpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICByZXR1cm4gcGFydHNbMF07XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJ0cztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcGFyc2VBdHRyKHRhZ0VsZW1lbnQ6IFRlbXBsYXRlLlRhZ1RlbXBsYXRlLCBhdHRyOiBBdHRyKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGF0dHIubmFtZTtcclxuICAgICAgICBpZiAobmFtZSA9PT0gXCJjbGlja1wiIHx8IG5hbWUuc3RhcnRzV2l0aChcImtleXVwLlwiKSkge1xyXG4gICAgICAgICAgICBjb25zdCBmbiA9IHRoaXMucGFyc2VUZXh0KGF0dHIudmFsdWUpO1xyXG4gICAgICAgICAgICB0YWdFbGVtZW50LmFkZEV2ZW50KG5hbWUsIGZuKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5hbWUgPT09IFwiZGF0YS1zZWxlY3RcIiB8fCBuYW1lID09PSBcImRhdGEtZnJvbVwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZuID0gdGhpcy5wYXJzZVRleHQoYXR0ci52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRhZ0VsZW1lbnQuc2VsZWN0KGZuKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5hbWUgPT09IFwiY2hlY2tlZFwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZuID0gdGhpcy5wYXJzZVRleHQoYXR0ci52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRhZ0VsZW1lbnQuYXR0cihuYW1lLCBDb3JlLmNvbXBvc2UoY3R4ID0+ICEhY3R4ID8gXCJjaGVja2VkXCIgOiBudWxsLCBmbikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRwbCA9IHRoaXMucGFyc2VUZXh0KGF0dHIudmFsdWUpO1xyXG4gICAgICAgICAgICB0YWdFbGVtZW50LmF0dHIobmFtZSwgdHBsIHx8IGF0dHIudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gY29udmVudGlvbnNcclxuICAgICAgICAgICAgaWYgKCEhdGFnRWxlbWVudC5uYW1lLm1hdGNoKC9eaW5wdXQkL2kpICYmICEhYXR0ci5uYW1lLm1hdGNoKC9ebmFtZSQvaSkgJiYgdGFnRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlQWNjZXNzb3IgPSB0aGlzLnBhcnNlVGV4dChhdHRyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRhZ0VsZW1lbnQuYXR0cihcInZhbHVlXCIsIHZhbHVlQWNjZXNzb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBwYXJzZU5vZGUocm9vdDogTm9kZSk6IFRlbXBsYXRlLklOb2RlIHtcclxuICAgICAgICB2YXIgc3RhY2sgPSBbcm9vdF07XHJcblxyXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gc3RhY2sucG9wKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZWx0ID0gPEhUTUxFbGVtZW50Pm5vZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZS5UYWdUZW1wbGF0ZShlbHQudGFnTmFtZSwgZWx0Lm5hbWVzcGFjZVVSSSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7ICEhZWx0LmF0dHJpYnV0ZXMgJiYgaSA8IGVsdC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZSA9IGVsdC5hdHRyaWJ1dGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VBdHRyKHRlbXBsYXRlLCBhdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGV4dENvbnRlbnQgPSBub2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRleHRDb250ZW50LnRyaW0oKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHBsID0gdGhpcy5wYXJzZVRleHQodGV4dENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVGVtcGxhdGUuVGV4dFRlbXBsYXRlKHRwbCB8fCBub2RlLnRleHRDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmluZChub2RlKSB7XHJcbiAgICB2YXIgY2hpbGRyZW4gPSBbXTtcclxuICAgIGlmICghIW5vZGVbXCJjb250ZW50XCJdKSB7XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IDxIVE1MRWxlbWVudD5ub2RlW1wiY29udGVudFwiXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciB0cGwgPSBQYXJzZXIucGFyc2VOb2RlKGNvbnRlbnQuY2hpbGROb2Rlc1tpXSk7XHJcbiAgICAgICAgICAgIGlmICh0cGwpXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKHRwbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKG5vZGUsIG5vZGUucGFyZW50RWxlbWVudCk7XHJcbiAgICByZXR1cm4gbmV3IERvbS5Db250ZW50QmluZGluZyhudWxsLCBkb20gPT4gbm9kZS5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShkb20sIG5vZGUpLCBjaGlsZHJlbik7XHJcbn1cclxuIl19