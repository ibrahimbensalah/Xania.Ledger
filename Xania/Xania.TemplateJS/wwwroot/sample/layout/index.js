"use strict";
var xania_1 = require("../../src/xania");
var dom_1 = require("../../src/dom");
function view(xania) {
    return (xania.tag("div", null, "index"));
}
exports.view = view;
function bind(context, parent) {
    var vw = view(xania_1.Xania);
    return vw.bind(dom_1.Dom.DomVisitor).update(context, parent);
}
exports.bind = bind;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHlDQUFpRDtBQUVqRCxxQ0FBb0M7QUFFcEMsY0FBcUIsS0FBSztJQUN0QixNQUFNLENBQUMsQ0FBQywrQkFBZ0IsQ0FBbUIsQ0FBQztBQUNoRCxDQUFDO0FBRkQsb0JBRUM7QUFFRCxjQUFxQixPQUFPLEVBQUUsTUFBTTtJQUNoQyxJQUFJLEVBQUUsR0FBbUIsSUFBSSxDQUFDLGFBQUssQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFhLFNBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUFIRCxvQkFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhhbmlhLCBUZW1wbGF0ZSB9IGZyb20gXCIuLi8uLi9zcmMveGFuaWFcIlxyXG5pbXBvcnQgeyBSZWFjdGl2ZSBhcyBSZSB9IGZyb20gXCIuLi8uLi9zcmMvcmVhY3RpdmVcIjtcclxuaW1wb3J0IHsgRG9tIH0gZnJvbSBcIi4uLy4uL3NyYy9kb21cIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2aWV3KHhhbmlhKTogVGVtcGxhdGUuSU5vZGUge1xyXG4gICAgcmV0dXJuICg8ZGl2PmluZGV4PC9kaXY+KSBhcyBUZW1wbGF0ZS5JTm9kZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoY29udGV4dCwgcGFyZW50KSB7XHJcbiAgICB2YXIgdnc6IFRlbXBsYXRlLklOb2RlID0gdmlldyhYYW5pYSk7XHJcbiAgICByZXR1cm4gdncuYmluZDxSZS5CaW5kaW5nPihEb20uRG9tVmlzaXRvcikudXBkYXRlKGNvbnRleHQsIHBhcmVudCk7XHJcbn1cclxuIl19