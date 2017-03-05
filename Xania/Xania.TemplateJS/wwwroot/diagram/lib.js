"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require("./diagram.css");
var dom_1 = require("../src/dom");
var compile_1 = require("../src/compile");
var GraphApp = (function () {
    function GraphApp() {
        this.P1 = { x: 100, y: 10 };
        this.P2 = { x: 400, y: 100 };
    }
    GraphApp.horizontalArrow = function (_a, _b) {
        var x1 = _a.x, y1 = _a.y;
        var x2 = _b.x, y2 = _b.y;
        var d = (x2 - x1) / 2;
        return "m" + x1 + "," + y1 + " C" + (x1 + d) + "," + y1 + " " + (x2 - d) + "," + y2 + " " + x2 + "," + y2;
    };
    GraphApp.input = function (x, y) {
        return { x: x, y: y + 50 };
    };
    GraphApp.output = function (x, y) {
        return { x: x + 100, y: y + 50 };
    };
    GraphApp.prototype.view = function (xania) {
        return (xania.tag("div", { style: "height: 100%;" },
            xania.tag("div", { className: ["xania-diagram", compile_1.default("pressed -> ' pressed'")] },
                xania.tag(Draggable, { x: compile_1.default("P1.x"), y: compile_1.default("P1.y"), style: "background-color: blue;" }),
                xania.tag(Draggable, { x: compile_1.default("P2.x"), y: compile_1.default("P2.y"), style: "background-color: orange;" }),
                xania.tag("svg", null,
                    xania.tag("g", null,
                        xania.tag("path", { d: compile_1.default("horizontalArrow (output P1.x P1.y) (input P2.x P2.y)"), stroke: "black" }))))));
    };
    return GraphApp;
}());
exports.GraphApp = GraphApp;
var Canvas = (function () {
    function Canvas(attrs, children) {
        this.attrs = attrs;
        this.children = children;
    }
    Canvas.prototype.bind = function () {
        var tag = new dom_1.Dom.TagBinding("div", null, this.children.map(function (x) { return x.bind(); })), attrs = this.attrs;
        for (var prop in attrs) {
            if (attrs.hasOwnProperty(prop)) {
                var attrValue = attrs[prop];
                tag.attr(prop.toLowerCase(), attrValue);
            }
        }
        return tag;
    };
    return Canvas;
}());
var Draggable = (function () {
    function Draggable(attrs, children) {
        this.attrs = attrs;
        this.children = children;
    }
    Draggable.prototype.bind = function () {
        var tag = new DraggableBinding(this.attrs.x, this.attrs.y, this.children.map(function (x) { return x.bind(); })), attrs = this.attrs;
        tag.attr("class", "xania-draggable");
        for (var prop in attrs) {
            if (attrs.hasOwnProperty(prop) && prop !== "x" && prop !== "y") {
                var attrValue = attrs[prop];
                if (prop === "className" || prop === "classname" || prop === "clazz")
                    tag.attr("class", "xania-draggable " + attrValue);
                else
                    tag.attr(prop.toLowerCase(), attrValue);
            }
        }
        return tag;
    };
    return Draggable;
}());
var DraggableBinding = (function (_super) {
    __extends(DraggableBinding, _super);
    function DraggableBinding(x, y, childBindings) {
        var _this = _super.call(this, "div", null, childBindings) || this;
        _this.x = x;
        _this.y = y;
        _this.pressed = null;
        _this.state = { left: 0, top: 0, clientX: 0, clientY: 0 };
        _this.press = function (event) {
            event.stopPropagation();
            var clientX = event.clientX, clientY = event.clientY, target = event.target;
            do {
                if (target.classList.contains("xania-draggable"))
                    break;
                target = target.parentElement;
            } while (target);
            if (!target)
                return;
            var _a = window.getComputedStyle(target), top = _a.top, left = _a.left;
            _this.state = {
                top: DraggableBinding.prixels(top),
                left: DraggableBinding.prixels(left),
                clientX: clientX,
                clientY: clientY
            };
            _this.pressed = target;
        };
        _this.release = function (event) {
            _this.pressed = null;
            _this.state = null;
        };
        _this.drag = function (event) {
            if (event.buttons !== 1)
                return false;
            var clientX = event.clientX, clientY = event.clientY;
            var state = _this.state;
            if (!state)
                return false;
            var left = state.left + clientX - state.clientX;
            var top = state.top + clientY - state.clientY;
            if (state.left !== left || state.top !== top) {
                state.clientX = clientX;
                state.clientY = clientY;
                state.left = left;
                state.top = top;
                var x = _this.evaluateObject(_this.x);
                var y = _this.evaluateObject(_this.y);
                x.set(left);
                y.set(top);
                return true;
            }
            return false;
        };
        _this.event("mousedown", _this.press);
        _this.event("mousemove", _this.drag);
        _this.event("mouseup", _this.release);
        return _this;
    }
    DraggableBinding.prixels = function (px) {
        return parseFloat(px.replace("px", "")) || 0;
    };
    DraggableBinding.prototype.render = function (context, driver) {
        _super.prototype.render.call(this, context, driver);
        var x = this.evaluateText(this.x);
        var y = this.evaluateText(this.y);
        var style = this.tagNode.style;
        style.left = x + "px";
        style.top = y + "px";
    };
    return DraggableBinding;
}(dom_1.Dom.TagBinding));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGliLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx5QkFBc0I7QUFFdEIsa0NBQWlDO0FBQ2pDLDBDQUFrQztBQUVsQztJQUFBO1FBRVksT0FBRSxHQUFVLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDOUIsT0FBRSxHQUFVLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUE2QjNDLENBQUM7SUEzQlUsd0JBQWUsR0FBdEIsVUFBdUIsRUFBYyxFQUFFLEVBQWM7WUFBN0IsU0FBSyxFQUFFLFNBQUs7WUFBSSxTQUFLLEVBQUUsU0FBSztRQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLE1BQUksRUFBRSxTQUFJLEVBQUUsV0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFJLEVBQUUsVUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFJLEVBQUUsU0FBSSxFQUFFLFNBQUksRUFBSSxDQUFDO0lBQ3ZFLENBQUM7SUFFTSxjQUFLLEdBQVosVUFBYSxDQUFDLEVBQUUsQ0FBQztRQUNiLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUNNLGVBQU0sR0FBYixVQUFjLENBQUMsRUFBRSxDQUFDO1FBQ2QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsdUJBQUksR0FBSixVQUFLLEtBQUs7UUFDTixNQUFNLENBQUMsQ0FDSCxtQkFBSyxLQUFLLEVBQUMsZUFBZTtZQUN0QixtQkFBSyxTQUFTLEVBQUUsQ0FB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QUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQUFDLEFBcEZELENBQStCLFNBQUcsQ0FBQyxVQUFVLEdBb0Y1QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9kaWFncmFtLmNzcydcclxuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tIFwiLi4vc3JjL3RlbXBsYXRlXCI7XHJcbmltcG9ydCB7IERvbSB9IGZyb20gXCIuLi9zcmMvZG9tXCI7XHJcbmltcG9ydCBleHByIGZyb20gXCIuLi9zcmMvY29tcGlsZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoQXBwIHtcclxuXHJcbiAgICBwcml2YXRlIFAxOiBQb2ludCA9IHsgeDogMTAwLCB5OiAxMCB9O1xyXG4gICAgcHJpdmF0ZSBQMjogUG9pbnQgPSB7IHg6IDQwMCwgeTogMTAwIH07XHJcblxyXG4gICAgc3RhdGljIGhvcml6b250YWxBcnJvdyh7eDogeDEsIHk6IHkxfSwge3g6IHgyLCB5OiB5Mn0pIHtcclxuICAgICAgICB2YXIgZCA9ICh4MiAtIHgxKSAvIDI7XHJcbiAgICAgICAgcmV0dXJuIGBtJHt4MX0sJHt5MX0gQyR7eDEgKyBkfSwke3kxfSAke3gyIC0gZH0sJHt5Mn0gJHt4Mn0sJHt5Mn1gO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpbnB1dCh4LCB5KSB7XHJcbiAgICAgICAgcmV0dXJuIHsgeCwgeTogeSArIDUwIH07XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgb3V0cHV0KHgsIHkpIHtcclxuICAgICAgICByZXR1cm4geyB4OiB4ICsgMTAwLCB5OiB5ICsgNTAgfTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3KHhhbmlhKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImhlaWdodDogMTAwJTtcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtbXCJ4YW5pYS1kaWFncmFtXCIsIGV4cHIoXCJwcmVzc2VkIC0+ICcgcHJlc3NlZCdcIildfT5cclxuICAgICAgICAgICAgICAgICAgICA8RHJhZ2dhYmxlIHg9e2V4cHIoXCJQMS54XCIpfSB5PXtleHByKFwiUDEueVwiKX0gc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiBibHVlO1wiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPERyYWdnYWJsZSB4PXtleHByKFwiUDIueFwiKX0geT17ZXhwcihcIlAyLnlcIil9IHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlO1wiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPHN2Zz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPXtleHByKFwiaG9yaXpvbnRhbEFycm93IChvdXRwdXQgUDEueCBQMS55KSAoaW5wdXQgUDIueCBQMi55KVwiKX0gc3Ryb2tlPVwiYmxhY2tcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2c+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuaW50ZXJmYWNlIFBvaW50IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxufVxyXG5cclxuY2xhc3MgQ2FudmFzIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXR0cnMsIHByaXZhdGUgY2hpbGRyZW4pIHtcclxuICAgIH1cclxuXHJcblxyXG4gICAgYmluZCgpIHtcclxuICAgICAgICB2YXIgdGFnID0gbmV3IERvbS5UYWdCaW5kaW5nKFwiZGl2XCIsIG51bGwsIHRoaXMuY2hpbGRyZW4ubWFwKHggPT4geC5iaW5kKCkpKSxcclxuICAgICAgICAgICAgYXR0cnMgPSB0aGlzLmF0dHJzO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBwcm9wIGluIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHJzW3Byb3BdO1xyXG4gICAgICAgICAgICAgICAgdGFnLmF0dHIocHJvcC50b0xvd2VyQ2FzZSgpLCBhdHRyVmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGFnO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEcmFnZ2FibGUge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBhdHRycywgcHJpdmF0ZSBjaGlsZHJlbikge1xyXG4gICAgfVxyXG5cclxuICAgIGJpbmQoKSB7XHJcbiAgICAgICAgdmFyIHRhZyA9IG5ldyBEcmFnZ2FibGVCaW5kaW5nKHRoaXMuYXR0cnMueCwgdGhpcy5hdHRycy55LCB0aGlzLmNoaWxkcmVuLm1hcCh4ID0+IHguYmluZCgpKSksXHJcbiAgICAgICAgICAgIGF0dHJzID0gdGhpcy5hdHRycztcclxuXHJcbiAgICAgICAgdGFnLmF0dHIoXCJjbGFzc1wiLCBcInhhbmlhLWRyYWdnYWJsZVwiKTtcclxuICAgICAgICBmb3IgKHZhciBwcm9wIGluIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBwcm9wICE9PSBcInhcIiAmJiBwcm9wICE9PSBcInlcIikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHJzW3Byb3BdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3AgPT09IFwiY2xhc3NOYW1lXCIgfHwgcHJvcCA9PT0gXCJjbGFzc25hbWVcIiB8fCBwcm9wID09PSBcImNsYXp6XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnLmF0dHIoXCJjbGFzc1wiLCBcInhhbmlhLWRyYWdnYWJsZSBcIiArIGF0dHJWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnLmF0dHIocHJvcC50b0xvd2VyQ2FzZSgpLCBhdHRyVmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGFnO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEcmFnZ2FibGVCaW5kaW5nIGV4dGVuZHMgRG9tLlRhZ0JpbmRpbmcge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB4LCBwcml2YXRlIHksIGNoaWxkQmluZGluZ3MpIHtcclxuICAgICAgICBzdXBlcihcImRpdlwiLCBudWxsLCBjaGlsZEJpbmRpbmdzKTtcclxuICAgICAgICB0aGlzLmV2ZW50KFwibW91c2Vkb3duXCIsIHRoaXMucHJlc3MpO1xyXG4gICAgICAgIHRoaXMuZXZlbnQoXCJtb3VzZW1vdmVcIiwgdGhpcy5kcmFnKTtcclxuICAgICAgICB0aGlzLmV2ZW50KFwibW91c2V1cFwiLCB0aGlzLnJlbGVhc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcHJlc3NlZDogYW55ID0gbnVsbDtcclxuICAgIHByaXZhdGUgc3RhdGUgPSB7IGxlZnQ6IDAsIHRvcDogMCwgY2xpZW50WDogMCwgY2xpZW50WTogMCB9O1xyXG5cclxuICAgIHByaXZhdGUgcHJlc3MgPSBldmVudCA9PiB7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIHZhciB7IGNsaWVudFgsIGNsaWVudFksIHRhcmdldCB9ID0gZXZlbnQ7XHJcblxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ4YW5pYS1kcmFnZ2FibGVcIikpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfSB3aGlsZSAodGFyZ2V0KTtcclxuXHJcbiAgICAgICAgaWYgKCF0YXJnZXQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIHsgdG9wLCBsZWZ0IH0gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0ge1xyXG4gICAgICAgICAgICB0b3A6IERyYWdnYWJsZUJpbmRpbmcucHJpeGVscyh0b3ApLFxyXG4gICAgICAgICAgICBsZWZ0OiBEcmFnZ2FibGVCaW5kaW5nLnByaXhlbHMobGVmdCksXHJcbiAgICAgICAgICAgIGNsaWVudFgsXHJcbiAgICAgICAgICAgIGNsaWVudFlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucHJlc3NlZCA9IHRhcmdldDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcHJpeGVscyhweDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQocHgucmVwbGFjZShcInB4XCIsIFwiXCIpKSB8fCAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVsZWFzZSA9IGV2ZW50ID0+IHtcclxuICAgICAgICB0aGlzLnByZXNzZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhZyA9IGV2ZW50ID0+IHtcclxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9ucyAhPT0gMSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudDtcclxuICAgICAgICB2YXIgeyBzdGF0ZSB9ID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgbGVmdCA9IHN0YXRlLmxlZnQgKyBjbGllbnRYIC0gc3RhdGUuY2xpZW50WDtcclxuICAgICAgICB2YXIgdG9wID0gc3RhdGUudG9wICsgY2xpZW50WSAtIHN0YXRlLmNsaWVudFk7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5sZWZ0ICE9PSBsZWZ0IHx8IHN0YXRlLnRvcCAhPT0gdG9wKSB7XHJcbiAgICAgICAgICAgIHN0YXRlLmNsaWVudFggPSBjbGllbnRYO1xyXG4gICAgICAgICAgICBzdGF0ZS5jbGllbnRZID0gY2xpZW50WTtcclxuICAgICAgICAgICAgc3RhdGUubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgICAgIHN0YXRlLnRvcCA9IHRvcDtcclxuXHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5ldmFsdWF0ZU9iamVjdCh0aGlzLngpO1xyXG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMuZXZhbHVhdGVPYmplY3QodGhpcy55KTtcclxuICAgICAgICAgICAgeC5zZXQobGVmdCk7XHJcbiAgICAgICAgICAgIHkuc2V0KHRvcCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcihjb250ZXh0LCBkcml2ZXIpIHtcclxuICAgICAgICBzdXBlci5yZW5kZXIoY29udGV4dCwgZHJpdmVyKTtcclxuXHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmV2YWx1YXRlVGV4dCh0aGlzLngpO1xyXG4gICAgICAgIHZhciB5ID0gdGhpcy5ldmFsdWF0ZVRleHQodGhpcy55KTtcclxuXHJcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy50YWdOb2RlLnN0eWxlO1xyXG4gICAgICAgIHN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgICAgIHN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XHJcbiAgICB9XHJcbn0iXX0=