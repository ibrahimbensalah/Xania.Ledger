"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var reactive_1 = require("./reactive");
var Animate = (function () {
    function Animate(attrs, children) {
        this.attrs = attrs;
        this.children = children;
    }
    Animate.prototype.bind = function () {
        var bindings = this.children.map(function (x) { return x.bind(); });
        return new AnimateBinding(this.attrs, bindings);
    };
    return Animate;
}());
exports.Animate = Animate;
var AnimateBinding = (function (_super) {
    __extends(AnimateBinding, _super);
    function AnimateBinding(attrs, childBindings) {
        var _this = _super.call(this) || this;
        _this.attrs = attrs;
        _this.domElements = [];
        _this.defaults = {
            transform: "translate3d(0, 0, 0) scale(0)",
            width: "0",
            height: "0"
        };
        _this.players = {};
        _this.values = {};
        _this.childBindings = childBindings;
        return _this;
    }
    Object.defineProperty(AnimateBinding.prototype, "length", {
        get: function () {
            var length = 0;
            for (var i = 0; i < this.childBindings.length; i++) {
                length += this.childBindings[i].length;
            }
            return length;
        },
        enumerable: true,
        configurable: true
    });
    AnimateBinding.prototype.update = function (context, driver) {
        _super.prototype.update2.call(this, context, driver);
        for (var i = 0; i < this.childBindings.length; i++) {
            this.childBindings[i].update2(context, this);
        }
        return this;
    };
    AnimateBinding.prototype.insert = function (binding, dom, idx) {
        this.driver.insert(this, dom, idx);
        this.domElements.push(dom);
        this.transform(dom, this.defaults);
    };
    AnimateBinding.prototype.transform = function (dom, defaults) {
        var values = this.values;
        if (Object.keys(values).length === 0)
            return;
        for (var k in values) {
            if (values.hasOwnProperty(k)) {
                var value = values[k];
                if (!value)
                    continue;
                var start = defaults[k] || this.defaults[k];
                var frames = (Array.isArray(value) ? value : [start, value]);
                var keyframes = frames.map(function (x) {
                    var frame = {};
                    frame[k] = x;
                    return frame;
                });
                if (this.players[k]) {
                    this.players[k].cancel();
                    delete this.players[k];
                }
                var timing = { duration: this.attrs.duration || 200, iterations: 1, easing: 'ease-out' };
                var player = dom.animate(keyframes, timing);
                player.onfinish = (function (k, value) { return function (e) {
                    dom.style[k] = Array.isArray(value) ? value[value.length - 1] : value;
                }; })(k, value);
                this.players[k] = player;
            }
        }
    };
    AnimateBinding.prototype.render = function (context) {
        this.values = {};
        var attrs = this.attrs;
        for (var k in attrs) {
            if (attrs.hasOwnProperty(k) && k !== "dispose") {
                var v = this.evaluateObject(attrs[k]);
                this.values[k] = v;
            }
        }
        for (var i = 0; i < this.domElements.length && i < 1; i++) {
            var dom = this.domElements[i];
            this.transform(dom, window.getComputedStyle(dom));
        }
    };
    AnimateBinding.prototype.dispose = function () {
        var bindings = this.childBindings;
        this.childBindings = [];
        var dispose = this.attrs.dispose;
        if (!dispose) {
            for (var e = 0; e < bindings.length; e++) {
                var b = bindings[e];
                b.dispose();
            }
        }
        else {
            var counter = this.domElements.length;
            var onfinish = function () {
                counter--;
                if (counter === 0) {
                    for (var e = 0; e < bindings.length; e++) {
                        var b = bindings[e];
                        b.dispose();
                    }
                }
            };
            for (var i = 0; i < this.domElements.length; i++) {
                var dom = this.domElements[i];
                var timing = { duration: this.attrs.duration || 200, iterations: 1 };
                var animation = dom.animate(dispose, timing);
                animation.onfinish = onfinish;
            }
        }
    };
    return AnimateBinding;
}(reactive_1.Reactive.Binding));
exports.AnimateBinding = AnimateBinding;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuaW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsdUNBQXFDO0FBR3JDO0lBQ0ksaUJBQW9CLEtBQTBDLEVBQVUsUUFBMEI7UUFBOUUsVUFBSyxHQUFMLEtBQUssQ0FBcUM7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFrQjtJQUNsRyxDQUFDO0lBRUQsc0JBQUksR0FBSjtRQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDTCxjQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSwwQkFBTztBQVVwQjtJQUFvQyxrQ0FBZ0I7SUFJaEQsd0JBQW9CLEtBQTBDLEVBQUUsYUFBb0I7UUFBcEYsWUFDSSxpQkFBTyxTQUVWO1FBSG1CLFdBQUssR0FBTCxLQUFLLENBQXFDO1FBRjlELGlCQUFXLEdBQUcsRUFBRSxDQUFDO1FBOEJqQixjQUFRLEdBQUc7WUFDUCxTQUFTLEVBQUUsK0JBQStCO1lBQzFDLEtBQUssRUFBRSxHQUFHO1lBQ1YsTUFBTSxFQUFFLEdBQUc7U0FDZCxDQUFBO1FBc0NPLGFBQU8sR0FBRyxFQUFFLENBQUM7UUFDYixZQUFNLEdBQTRCLEVBQUUsQ0FBQztRQXJFekMsS0FBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7O0lBQ3ZDLENBQUM7SUFFRCxzQkFBSSxrQ0FBTTthQUFWO1lBQ0ksSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0s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QUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU5QixJQUFJLE1BQU0sR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNyRSxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDN0MsU0FBUyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBMUhELENBQW9DLG1CQUFRLENBQUMsT0FBTyxHQTBIbkQ7QUExSFksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZWFjdGl2ZSB9IGZyb20gXCIuL3JlYWN0aXZlXCJcclxuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tIFwiLi90ZW1wbGF0ZVwiXHJcblxyXG5leHBvcnQgY2xhc3MgQW5pbWF0ZSBpbXBsZW1lbnRzIFRlbXBsYXRlLklOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXR0cnM6IHsgdHJhbnNmb3JtPywgZGlzcG9zZT8sIGR1cmF0aW9uPyB9LCBwcml2YXRlIGNoaWxkcmVuOiBUZW1wbGF0ZS5JTm9kZVtdKSB7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZCgpIHtcclxuICAgICAgICBjb25zdCBiaW5kaW5ncyA9IHRoaXMuY2hpbGRyZW4ubWFwKHggPT4geC5iaW5kKCkpO1xyXG4gICAgICAgIHJldHVybiBuZXcgQW5pbWF0ZUJpbmRpbmcodGhpcy5hdHRycywgYmluZGluZ3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQW5pbWF0ZUJpbmRpbmcgZXh0ZW5kcyBSZWFjdGl2ZS5CaW5kaW5nIHtcclxuXHJcbiAgICBkb21FbGVtZW50cyA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXR0cnM6IHsgdHJhbnNmb3JtPywgZGlzcG9zZT8sIGR1cmF0aW9uPyB9LCBjaGlsZEJpbmRpbmdzOiBhbnlbXSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZEJpbmRpbmdzID0gY2hpbGRCaW5kaW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbGVuZ3RoKCkge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZEJpbmRpbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxlbmd0aCArPSB0aGlzLmNoaWxkQmluZGluZ3NbaV0ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShjb250ZXh0LCBkcml2ZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUyKGNvbnRleHQsIGRyaXZlcik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkQmluZGluZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZEJpbmRpbmdzW2ldLnVwZGF0ZTIoY29udGV4dCwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGluc2VydChiaW5kaW5nLCBkb20sIGlkeCkge1xyXG4gICAgICAgIHRoaXMuZHJpdmVyLmluc2VydCh0aGlzLCBkb20sIGlkeCk7XHJcbiAgICAgICAgdGhpcy5kb21FbGVtZW50cy5wdXNoKGRvbSk7XHJcblxyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtKGRvbSwgdGhpcy5kZWZhdWx0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKDAsIDAsIDApIHNjYWxlKDApXCIsXHJcbiAgICAgICAgd2lkdGg6IFwiMFwiLFxyXG4gICAgICAgIGhlaWdodDogXCIwXCJcclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2Zvcm0oZG9tLCBkZWZhdWx0cykge1xyXG4gICAgICAgIGxldCB2YWx1ZXMgPSB0aGlzLnZhbHVlcztcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXModmFsdWVzKS5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgayBpbiB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVzW2tdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBkZWZhdWx0c1trXSB8fCB0aGlzLmRlZmF1bHRzW2tdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBmcmFtZXMgPSAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFtzdGFydCwgdmFsdWVdKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ZnJhbWVzID0gZnJhbWVzLm1hcCh4ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZnJhbWUgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICBmcmFtZVtrXSA9IHg7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZyYW1lO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyc1trXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1trXS5jYW5jZWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5wbGF5ZXJzW2tdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0aW1pbmcgPSB7IGR1cmF0aW9uOiB0aGlzLmF0dHJzLmR1cmF0aW9uIHx8IDIwMCwgaXRlcmF0aW9uczogMSwgZWFzaW5nOiAnZWFzZS1vdXQnIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyID0gZG9tLmFuaW1hdGUoa2V5ZnJhbWVzLCB0aW1pbmcpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLm9uZmluaXNoID0gKChrLCB2YWx1ZSkgPT4gZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tLnN0eWxlW2tdID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXSA6IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSkoaywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2tdID0gcGxheWVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGxheWVycyA9IHt9O1xyXG4gICAgcHJpdmF0ZSB2YWx1ZXM6IHsgdHJhbnNmb3JtPzsgaGVpZ2h0PyB9ID0ge307XHJcbiAgICByZW5kZXIoY29udGV4dCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0ge307XHJcbiAgICAgICAgbGV0IGF0dHJzID0gdGhpcy5hdHRycztcclxuICAgICAgICBmb3IgKHZhciBrIGluIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShrKSAmJiBrICE9PSBcImRpc3Bvc2VcIikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSB0aGlzLmV2YWx1YXRlT2JqZWN0KGF0dHJzW2tdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzW2tdID0gdjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRvbUVsZW1lbnRzLmxlbmd0aCAmJiBpIDwgMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBkb20gPSB0aGlzLmRvbUVsZW1lbnRzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybShkb20sIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvbSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIHZhciBiaW5kaW5ncyA9IHRoaXMuY2hpbGRCaW5kaW5ncztcclxuICAgICAgICB0aGlzLmNoaWxkQmluZGluZ3MgPSBbXTtcclxuICAgICAgICB2YXIgZGlzcG9zZSA9IHRoaXMuYXR0cnMuZGlzcG9zZTtcclxuICAgICAgICBpZiAoIWRpc3Bvc2UpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZSA9IDA7IGUgPCBiaW5kaW5ncy5sZW5ndGg7IGUrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGI6IGFueSA9IGJpbmRpbmdzW2VdO1xyXG4gICAgICAgICAgICAgICAgYi5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgY291bnRlciA9IHRoaXMuZG9tRWxlbWVudHMubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgb25maW5pc2ggPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyLS07XHJcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGUgPSAwOyBlIDwgYmluZGluZ3MubGVuZ3RoOyBlKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGI6IGFueSA9IGJpbmRpbmdzW2VdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZG9tRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBkb20gPSB0aGlzLmRvbUVsZW1lbnRzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0aW1pbmcgPSB7IGR1cmF0aW9uOiB0aGlzLmF0dHJzLmR1cmF0aW9uIHx8IDIwMCwgaXRlcmF0aW9uczogMSB9O1xyXG4gICAgICAgICAgICAgICAgdmFyIGFuaW1hdGlvbiA9IGRvbS5hbmltYXRlKGRpc3Bvc2UsIHRpbWluZyk7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb24ub25maW5pc2ggPSBvbmZpbmlzaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=