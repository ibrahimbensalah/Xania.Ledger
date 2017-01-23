"use strict";
var Template;
(function (Template) {
    var TextTemplate = (function () {
        function TextTemplate(parts) {
            this.parts = parts;
        }
        TextTemplate.prototype.accept = function (visitor, options) {
            return visitor.text(this.parts, options);
        };
        return TextTemplate;
    }());
    Template.TextTemplate = TextTemplate;
    var ContentTemplate = (function () {
        function ContentTemplate(ast) {
            this.ast = ast;
            this.children = [];
        }
        ContentTemplate.prototype.child = function (child) {
            this.children.push(child);
            return this;
        };
        ContentTemplate.prototype.accept = function (visitor, options) {
            return visitor.content(this.ast, this.children, options);
        };
        return ContentTemplate;
    }());
    Template.ContentTemplate = ContentTemplate;
    var TagTemplate = (function () {
        function TagTemplate(name, ns) {
            this.name = name;
            this.ns = ns;
            this.attributes = [];
            this.events = new Map();
            this._children = [];
        }
        TagTemplate.prototype.children = function () {
            return this._children;
        };
        TagTemplate.prototype.attr = function (name, expr) {
            return this.addAttribute(name, expr);
        };
        TagTemplate.prototype.addAttribute = function (name, expr) {
            var attr = this.getAttribute(name);
            if (!attr)
                this.attributes.push({ name: name.toLowerCase(), tpl: expr });
            return this;
        };
        TagTemplate.prototype.getAttribute = function (name) {
            var key = name.toLowerCase();
            for (var i = 0; i < this.attributes.length; i++) {
                var attr = this.attributes[i];
                if (attr.name === key)
                    return attr;
            }
            return undefined;
        };
        TagTemplate.prototype.addEvent = function (name, callback) {
            this.events.set(name, callback);
        };
        TagTemplate.prototype.addChild = function (child) {
            this._children.push(child);
            return this;
        };
        TagTemplate.prototype.select = function (modelAccessor) {
            this.modelAccessor = modelAccessor;
            return this;
        };
        TagTemplate.prototype.accept = function (visitor, options) {
            var tag = visitor.tag(this.name, this.ns, this.attributes, options);
            this._children.forEach(function (x) { return x.accept(tag); });
            return tag;
        };
        return TagTemplate;
    }());
    Template.TagTemplate = TagTemplate;
})(Template = exports.Template || (exports.Template = {}));
exports.t = Template;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLElBQWMsUUFBUSxDQW1JckI7QUFuSUQsV0FBYyxRQUFRO0lBWWxCO1FBQ0ksc0JBQW9CLEtBQXNCO1lBQXRCLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBQzFDLENBQUM7UUFFRCw2QkFBTSxHQUFOLFVBQVUsT0FBb0IsRUFBRSxPQUFZO1lBQ3hDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0FBQyxBQVBELElBT0M7SUFQWSxxQkFBWSxlQU94QixDQUFBO0lBRUQ7UUFJSSx5QkFBb0IsR0FBRztZQUFILFFBQUcsR0FBSCxHQUFHLENBQUE7WUFGZixhQUFRLEdBQVksRUFBRSxDQUFDO1FBRUosQ0FBQztRQUU1QiwrQkFBSyxHQUFMLFVBQU0sS0FBWTtZQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELGdDQUFNLEdBQU4sVUFBVSxPQUFvQixFQUFFLE9BQVk7WUFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdELENBQUM7UUF5Qkwsc0JBQUM7SUFBRCxDQUFDLEFBdENELElBc0NDO0lBdENZLHdCQUFlLGtCQXNDM0IsQ0FBQTtJQUVEO1FBT0kscUJBQW1CLElBQVksRUFBVSxFQUFVO1lBQWhDLFNBQUksR0FBSixJQUFJLENBQVE7WUFBVSxPQUFFLEdBQUYsRUFBRSxDQUFRO1lBTjNDLGVBQVUsR0FBNEIsRUFBRSxDQUFDO1lBQ3pDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1lBRWhDLGNBQVMsR0FBWSxFQUFFLENBQUM7UUFJaEMsQ0FBQztRQUVNLDhCQUFRLEdBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO1FBRU0sMEJBQUksR0FBWCxVQUFZLElBQVksRUFBRSxJQUFTO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU0sa0NBQVksR0FBbkIsVUFBb0IsSUFBWSxFQUFFLElBQVM7WUFDdkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDTixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU0sa0NBQVksR0FBbkIsVUFBb0IsSUFBWTtZQUM1QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQztvQkFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNwQixDQUFDO1lBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO1FBRU0sOEJBQVEsR0FBZixVQUFnQixJQUFJLEVBQUUsUUFBUTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVNLDhCQUFRLEdBQWYsVUFBZ0IsS0FBWTtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTSw0QkFBTSxHQUFiLFVBQWMsYUFBYTtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCw0QkFBTSxHQUFOLFVBQVUsT0FBb0IsRUFBRSxPQUFZO1lBQ3hDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFnQixDQUFDO1lBQ25GLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBYixDQUFhLENBQUMsQ0FBQztZQUUzQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBSWYsQ0FBQztRQVlMLGtCQUFDO0lBQUQsQ0FBQyxBQXJFRCxJQXFFQztJQXJFWSxvQkFBVyxjQXFFdkIsQ0FBQTtBQUNMLENBQUMsRUFuSWEsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFtSXJCO0FBR2UscUJBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb3JlIH0gZnJvbSBcIi4vY29yZVwiXHJcblxyXG5leHBvcnQgbW9kdWxlIFRlbXBsYXRlIHtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElWaXNpdG9yPFQ+IHtcclxuICAgICAgICB0ZXh0KGV4cHIsIG9wdGlvbnM6IGFueSk6IFQ7XHJcbiAgICAgICAgY29udGVudChleHByLCBjaGlsZHJlbjogSU5vZGVbXSwgb3B0aW9ucz86IGFueSk6IFQ7XHJcbiAgICAgICAgdGFnKG5hbWUsIG5zLCBhdHRycywgb3B0aW9ucz86IGFueSk6IElWaXNpdG9yPFQ+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSU5vZGUge1xyXG4gICAgICAgIGFjY2VwdDxUPih2aXNpdG9yOiBJVmlzaXRvcjxUPiwgb3B0aW9ucz86IGFueSk6IFQ7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFRleHRUZW1wbGF0ZSBpbXBsZW1lbnRzIElOb2RlIHtcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcnRzIDogYW55W10gfCBzdHJpbmcpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjY2VwdDxUPih2aXNpdG9yOiBJVmlzaXRvcjxUPiwgb3B0aW9uczogYW55KTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnRleHQodGhpcy5wYXJ0cywgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb250ZW50VGVtcGxhdGUgaW1wbGVtZW50cyBJTm9kZSB7XHJcbiAgICAgICAgLy8gUmVTaGFycGVyIGRpc2FibGUgb25jZSBJbmNvbnNpc3RlbnROYW1pbmdcclxuICAgICAgICBwcml2YXRlIGNoaWxkcmVuOiBJTm9kZVtdID0gW107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXN0KSB7IH1cclxuXHJcbiAgICAgICAgY2hpbGQoY2hpbGQ6IElOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWNjZXB0PFQ+KHZpc2l0b3I6IElWaXNpdG9yPFQ+LCBvcHRpb25zOiBhbnkpOiBUIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IuY29udGVudCh0aGlzLmFzdCwgdGhpcy5jaGlsZHJlbiwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2JpbmQoY29udGV4dCkge1xyXG4gICAgICAgIC8vICAgIGNvbnN0IG5ld0JpbmRpbmcgPSBuZXcgRG9tLkNvbnRlbnRCaW5kaW5nKCk7XHJcbiAgICAgICAgLy8gICAgdGhpcy5jaGlsZHJlbigpXHJcbiAgICAgICAgLy8gICAgICAgIC8vIFJlU2hhcnBlciBkaXNhYmxlIG9uY2UgVHNSZXNvbHZlZEZyb21JbmFjY2Vzc2libGVNb2R1bGVcclxuICAgICAgICAvLyAgICAgICAgLnJlZHVjZShDb250ZW50VGVtcGxhdGUucmVkdWNlQ2hpbGQsXHJcbiAgICAgICAgLy8gICAgICAgIHsgY29udGV4dCwgb2Zmc2V0OiAwLCBwYXJlbnRCaW5kaW5nOiBuZXdCaW5kaW5nIH0pO1xyXG5cclxuICAgICAgICAvLyAgICBuZXdCaW5kaW5nLnVwZGF0ZShjb250ZXh0KTtcclxuXHJcbiAgICAgICAgLy8gICAgcmV0dXJuIG5ld0JpbmRpbmc7XHJcbiAgICAgICAgLy99XHJcblxyXG4gICAgICAgIC8vc3RhdGljIHJlZHVjZUNoaWxkKHByZXYsIGN1cjogSU5vZGUpIHtcclxuICAgICAgICAvLyAgICB2YXIgeyBwYXJlbnRCaW5kaW5nLCBjb250ZXh0LCBvZmZzZXQgfSA9IHByZXY7XHJcblxyXG4gICAgICAgIC8vICAgIHByZXYub2Zmc2V0ID0gQ29yZS5yZWFkeShvZmZzZXQsXHJcbiAgICAgICAgLy8gICAgICAgIHAgPT4ge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgdmFyIHN0YXRlID0gRG9tLmV4ZWN1dGVUZW1wbGF0ZShjb250ZXh0LCBjdXIsIHBhcmVudEJpbmRpbmcuZG9tLCBwKTtcclxuICAgICAgICAvLyAgICAgICAgICAgIHJldHVybiBDb3JlLnJlYWR5KHN0YXRlLCB4ID0+IHsgcmV0dXJuIHAgKyB4LmJpbmRpbmdzLmxlbmd0aCB9KTtcclxuICAgICAgICAvLyAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vICAgIHJldHVybiBwcmV2O1xyXG4gICAgICAgIC8vfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUYWdUZW1wbGF0ZSBpbXBsZW1lbnRzIElOb2RlIHtcclxuICAgICAgICBwcml2YXRlIGF0dHJpYnV0ZXM6IHsgbmFtZTogc3RyaW5nOyB0cGwgfVtdID0gW107XHJcbiAgICAgICAgcHJpdmF0ZSBldmVudHMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xyXG4gICAgICAgIC8vIFJlU2hhcnBlciBkaXNhYmxlIG9uY2UgSW5jb25zaXN0ZW50TmFtaW5nXHJcbiAgICAgICAgcHJpdmF0ZSBfY2hpbGRyZW46IElOb2RlW10gPSBbXTtcclxuICAgICAgICBwdWJsaWMgbW9kZWxBY2Nlc3NvcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHJpdmF0ZSBuczogc3RyaW5nKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY2hpbGRyZW4oKTogSU5vZGVbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhdHRyKG5hbWU6IHN0cmluZywgZXhwcjogYW55KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZEF0dHJpYnV0ZShuYW1lLCBleHByKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGFkZEF0dHJpYnV0ZShuYW1lOiBzdHJpbmcsIGV4cHI6IGFueSkge1xyXG4gICAgICAgICAgICB2YXIgYXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIWF0dHIpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXMucHVzaCh7IG5hbWU6IG5hbWUudG9Mb3dlckNhc2UoKSwgdHBsOiBleHByIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IHRoaXMuYXR0cmlidXRlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChhdHRyLm5hbWUgPT09IGtleSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXR0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFkZEV2ZW50KG5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzLnNldChuYW1lLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYWRkQ2hpbGQoY2hpbGQ6IElOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZWxlY3QobW9kZWxBY2Nlc3Nvcikge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsQWNjZXNzb3IgPSBtb2RlbEFjY2Vzc29yO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjY2VwdDxUPih2aXNpdG9yOiBJVmlzaXRvcjxUPiwgb3B0aW9uczogYW55KSB7XHJcbiAgICAgICAgICAgIHZhciB0YWcgPSB2aXNpdG9yLnRhZyh0aGlzLm5hbWUsIHRoaXMubnMsIHRoaXMuYXR0cmlidXRlcywgb3B0aW9ucykgYXMgSVZpc2l0b3I8VD47XHJcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goeCA9PiB4LmFjY2VwdCh0YWcpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0YWc7XHJcbiAgICAgICAgICAgIC8vIHZhciBjb250ZW50ID0gdmlzaXRvci5jb250ZW50KG51bGwsIGNoaWxkcmVuKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHJldHVybiB2aXNpdG9yLnRhZyh0aGlzLm5hbWUsIHRoaXMubnMsIHRoaXMuYXR0cmlidXRlcywgdGhpcy5ldmVudHMsIGNvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9iaW5kKGNvbnRleHQpIHtcclxuICAgICAgICAvLyAgICBjb25zdCBuZXdCaW5kaW5nID0gbmV3IERvbS5UYWdCaW5kaW5nKHRoaXMubmFtZSwgdGhpcy5ucywgdGhpcy5hdHRyaWJ1dGVzLCB0aGlzLmV2ZW50cyk7XHJcbiAgICAgICAgLy8gICAgdGhpcy5jaGlsZHJlbigpXHJcbiAgICAgICAgLy8gICAgICAgIC5yZWR1Y2UoQ29udGVudFRlbXBsYXRlLnJlZHVjZUNoaWxkLFxyXG4gICAgICAgIC8vICAgICAgICB7IGNvbnRleHQsIG9mZnNldDogMCwgcGFyZW50QmluZGluZzogbmV3QmluZGluZywgbW9kZWxBY2Nlc3NvcjogdGhpcy5tb2RlbEFjY2Vzc29yIH0pO1xyXG5cclxuICAgICAgICAvLyAgICBuZXdCaW5kaW5nLnVwZGF0ZShjb250ZXh0KTtcclxuXHJcbiAgICAgICAgLy8gICAgcmV0dXJuIG5ld0JpbmRpbmc7XHJcbiAgICAgICAgLy99XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7XHJcbiAgICBUZW1wbGF0ZSBhcyB0XHJcbn0iXX0=