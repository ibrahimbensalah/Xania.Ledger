"use strict";
var xania_1 = require("../../src/xania");
require("./css/index.css");
var TodoApp = (function () {
    function TodoApp() {
        var _this = this;
        this.store = new TodoStore();
        this.show = "all";
        this.editingTodo = null;
        this.onAddTodo = function (event) {
            if (event.keyCode === 13) {
                var title = event.target.value;
                _this.store.todos.push(new Todo(title));
                return "";
            }
            return void 0;
        };
        this.onToggleAll = function () {
            _this.store.toggleAll();
        };
        this.onShow = function (value) {
            _this.show = value;
        };
        this.onResetEditing = function (event) {
            if (event.keyCode === 13)
                _this.editingTodo = null;
            else if (event.keyCode === 27) {
                _this.editingTodo = null;
            }
        };
    }
    TodoApp.prototype.view = function (xania) {
        var _this = this;
        return (xania.tag("section", { className: "todoapp" },
            xania.tag("header", null,
                xania.tag("input", { className: "new-todo", placeholder: "What needs to be done?", autofocus: "", onKeyUp: this.onAddTodo })),
            xania.tag("section", { className: ["main", xania_1.expr("store.todos.length = 0 -> ' hidden'")] },
                xania.tag("input", { className: "toggle-all", type: "checkbox", checked: xania_1.expr("store.todos where not completed |> empty"), onClick: this.onToggleAll }),
                xania.tag("ul", { className: "todo-list" },
                    xania.tag(xania_1.Repeat, { param: "todo", source: xania_1.expr("store.todos where (completed = (show = 'completed')) or (show = 'all')") },
                        xania.tag("li", { className: [xania_1.expr("todo.completed -> 'completed'"), xania_1.expr("todo = editingTodo -> ' editing'")] },
                            xania.tag("div", { className: "view" },
                                xania.tag("input", { className: "toggle", type: "checkbox", checked: xania_1.expr("todo.completed") }),
                                xania.tag("label", { onDblClick: xania_1.expr("editingTodo <- todo") }, xania_1.expr("todo.title")),
                                xania.tag("button", { className: "destroy", onClick: xania_1.expr("store.remove todo") })),
                            xania.tag("input", { className: "edit", value: xania_1.expr("todo.title"), autofocus: "", onBlur: this.onResetEditing, onKeyUp: this.onResetEditing }))))),
            xania.tag("footer", { className: ["footer", xania_1.expr("store.todos.length = 0 -> ' hidden'")] },
                xania.tag("span", { className: "todo-count" },
                    xania.tag("strong", null, xania_1.expr("store.todos where not completed |> count")),
                    " item(s) left"),
                xania.tag("ul", { className: "filters" },
                    xania.tag("li", null,
                        xania.tag("a", { href: "#", className: xania_1.expr("show = 'all' -> 'selected'"), onClick: this.onShow.bind(this, 'all') }, "All")),
                    xania.tag("li", null,
                        xania.tag("a", { href: "#", className: xania_1.expr("show = 'active' -> 'selected'"), onClick: this.onShow.bind(this, 'active') }, "Active")),
                    xania.tag("li", null,
                        xania.tag("a", { href: "#", className: xania_1.expr("show = 'completed' -> 'selected'"), onClick: this.onShow.bind(this, 'completed') }, "Completed"))),
                xania.tag("button", { className: ["clear-completed", xania_1.expr("all active todos -> ' hidden'")], onClick: function () { return _this.store.removeCompleted(); } }, "Clear completed"))));
    };
    return TodoApp;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TodoApp;
var TodoStore = (function () {
    function TodoStore() {
        this.todos = [];
        for (var i = 0; i < 2; i++)
            this.todos.push(new Todo("todo " + i, i % 2 === 0));
    }
    TodoStore.prototype.toggleAll = function () {
        var allCompleted = this.todos.every(function (e) { return e.completed; });
        for (var i = 0; i < this.todos.length; i++)
            this.todos[i].completed = !allCompleted;
    };
    TodoStore.prototype.removeCompleted = function () {
        this.todos = this.todos.filter(function (t) { return !t.completed; });
    };
    TodoStore.prototype.remove = function (todo) {
        var idx = this.todos.indexOf(todo);
        console.debug("remove todo ", idx);
        if (idx >= 0)
            this.todos.splice(idx, 1);
        else
            console.error("todo not found", todo);
    };
    TodoStore.prototype.orderByTitle = function () {
        this.todos = this.todos.sort(function (x, y) { return x.title.localeCompare(y.title); });
    };
    TodoStore.prototype.orderByTitleDesc = function () {
        this.todos = this.todos.sort(function (x, y) { return y.title.localeCompare(x.title); });
    };
    return TodoStore;
}());
var Todo = (function () {
    function Todo(title, completed) {
        if (completed === void 0) { completed = false; }
        this.title = title;
        this.completed = completed;
    }
    Todo.prototype.toggleCompletion = function () {
        this.completed = !this.completed;
    };
    return Todo;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUNBQThDO0FBRzlDLDJCQUF3QjtBQUV4QjtJQUFBO1FBQUEsaUJBd0VDO1FBdEVHLFVBQUssR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ3hCLFNBQUksR0FBRyxLQUFLLENBQUM7UUFDYixnQkFBVyxHQUFHLElBQUksQ0FBQztRQUVuQixjQUFTLEdBQUcsVUFBQyxLQUFLO1lBQ2QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDakMsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQTtRQUVELGdCQUFXLEdBQUc7WUFDVixLQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQTtRQUVELFdBQU0sR0FBRyxVQUFDLEtBQUs7WUFDWCxLQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUN0QixDQUFDLENBQUE7UUFFRCxtQkFBYyxHQUFHLFVBQUMsS0FBSztZQUNuQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDckIsS0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsS0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7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QUcsSUFBSSxDQUFDLENBQUM7WUFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSTtZQUNBLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELGdDQUFZLEdBQVo7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxvQ0FBZ0IsR0FBaEI7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFDTCxnQkFBQztBQUFELENBQUMsQUFwQ0QsSUFvQ0M7QUFFRDtJQUNJLGNBQW1CLEtBQWEsRUFBUyxTQUFpQjtRQUFqQiwwQkFBQSxFQUFBLGlCQUFpQjtRQUF2QyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUTtJQUMxRCxDQUFDO0lBRUQsK0JBQWdCLEdBQWhCO1FBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDckMsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlcGVhdCwgZXhwciB9IGZyb20gXCIuLi8uLi9zcmMveGFuaWFcIlxyXG5pbXBvcnQgeyBBbmltYXRlIH0gZnJvbSBcIi4uLy4uL3NyYy9hbmltXCJcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZXMgfSBmcm9tIFwiLi4vLi4vc3JjL29ic2VydmFibGVzXCJcclxuaW1wb3J0ICcuL2Nzcy9pbmRleC5jc3MnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2RvQXBwIHtcclxuXHJcbiAgICBzdG9yZSA9IG5ldyBUb2RvU3RvcmUoKTtcclxuICAgIHNob3cgPSBcImFsbFwiO1xyXG4gICAgZWRpdGluZ1RvZG8gPSBudWxsO1xyXG5cclxuICAgIG9uQWRkVG9kbyA9IChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5zdG9yZS50b2Rvcy5wdXNoKG5ldyBUb2RvKHRpdGxlKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVG9nZ2xlQWxsID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3RvcmUudG9nZ2xlQWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25TaG93ID0gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zaG93ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXNldEVkaXRpbmcgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpXHJcbiAgICAgICAgICAgIHRoaXMuZWRpdGluZ1RvZG8gPSBudWxsO1xyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDI3KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWRpdGluZ1RvZG8gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2aWV3KHhhbmlhKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidG9kb2FwcFwiID5cclxuICAgICAgICAgICAgICAgIDxoZWFkZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm5ldy10b2RvXCIgcGxhY2Vob2xkZXI9XCJXaGF0IG5lZWRzIHRvIGJlIGRvbmU/XCIgYXV0b2ZvY3VzPVwiXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlVcD17dGhpcy5vbkFkZFRvZG99IC8+XHJcbiAgICAgICAgICAgICAgICA8L2hlYWRlcj5cclxuICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT17W1wibWFpblwiLCBleHByKFwic3RvcmUudG9kb3MubGVuZ3RoID0gMCAtPiAnIGhpZGRlbidcIildfT5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwidG9nZ2xlLWFsbFwiIHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2V4cHIoXCJzdG9yZS50b2RvcyB3aGVyZSBub3QgY29tcGxldGVkIHw+IGVtcHR5XCIpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uVG9nZ2xlQWxsfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJ0b2RvLWxpc3RcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPFJlcGVhdCBwYXJhbT1cInRvZG9cIiBzb3VyY2U9e2V4cHIoXCJzdG9yZS50b2RvcyB3aGVyZSAoY29tcGxldGVkID0gKHNob3cgPSAnY29tcGxldGVkJykpIG9yIChzaG93ID0gJ2FsbCcpXCIpfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9e1tleHByKFwidG9kby5jb21wbGV0ZWQgLT4gJ2NvbXBsZXRlZCdcIiksIGV4cHIoXCJ0b2RvID0gZWRpdGluZ1RvZG8gLT4gJyBlZGl0aW5nJ1wiKV19ID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInZpZXdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cInRvZ2dsZVwiIHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2V4cHIoXCJ0b2RvLmNvbXBsZXRlZFwiKX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIG9uRGJsQ2xpY2s9e2V4cHIoXCJlZGl0aW5nVG9kbyA8LSB0b2RvXCIpfT57ZXhwcihcInRvZG8udGl0bGVcIil9PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJkZXN0cm95XCIgb25DbGljaz17ZXhwcihcInN0b3JlLnJlbW92ZSB0b2RvXCIpfT48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwiZWRpdFwiIHZhbHVlPXtleHByKFwidG9kby50aXRsZVwiKX0gYXV0b2ZvY3VzPVwiXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uUmVzZXRFZGl0aW5nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbktleVVwPXt0aGlzLm9uUmVzZXRFZGl0aW5nfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9SZXBlYXQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICAgICAgICAgIDxmb290ZXIgY2xhc3NOYW1lPXtbXCJmb290ZXJcIiwgZXhwcihcInN0b3JlLnRvZG9zLmxlbmd0aCA9IDAgLT4gJyBoaWRkZW4nXCIpXX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidG9kby1jb3VudFwiPjxzdHJvbmc+e2V4cHIoXCJzdG9yZS50b2RvcyB3aGVyZSBub3QgY29tcGxldGVkIHw+IGNvdW50XCIpfTwvc3Ryb25nPiBpdGVtKHMpIGxlZnQ8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImZpbHRlcnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9XCIjXCIgY2xhc3NOYW1lPXtleHByKFwic2hvdyA9ICdhbGwnIC0+ICdzZWxlY3RlZCdcIil9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hvdy5iaW5kKHRoaXMsICdhbGwnKX0+QWxsPC9hPjwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiIGNsYXNzTmFtZT17ZXhwcihcInNob3cgPSAnYWN0aXZlJyAtPiAnc2VsZWN0ZWQnXCIpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNob3cuYmluZCh0aGlzLCAnYWN0aXZlJyl9PkFjdGl2ZTwvYT48L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj1cIiNcIiBjbGFzc05hbWU9e2V4cHIoXCJzaG93ID0gJ2NvbXBsZXRlZCcgLT4gJ3NlbGVjdGVkJ1wiKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaG93LmJpbmQodGhpcywgJ2NvbXBsZXRlZCcpfT5Db21wbGV0ZWQ8L2E+PC9saT5cclxuICAgICAgICAgICAgICAgICAgICA8L3VsID5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17W1wiY2xlYXItY29tcGxldGVkXCIsIGV4cHIoXCJhbGwgYWN0aXZlIHRvZG9zIC0+ICcgaGlkZGVuJ1wiKV19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc3RvcmUucmVtb3ZlQ29tcGxldGVkKCl9PkNsZWFyIGNvbXBsZXRlZDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9mb290ZXI+XHJcbiAgICAgICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUb2RvU3RvcmUge1xyXG4gICAgcHVibGljIHRvZG9zOiBUb2RvW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50b2RvcyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7IGkrKylcclxuICAgICAgICAgICAgdGhpcy50b2Rvcy5wdXNoKG5ldyBUb2RvKGB0b2RvICR7aX1gLCBpICUgMiA9PT0gMCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZUFsbCgpIHtcclxuICAgICAgICB2YXIgYWxsQ29tcGxldGVkID0gdGhpcy50b2Rvcy5ldmVyeShlID0+IGUuY29tcGxldGVkKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudG9kb3MubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHRoaXMudG9kb3NbaV0uY29tcGxldGVkID0gIWFsbENvbXBsZXRlZDtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVDb21wbGV0ZWQoKSB7XHJcbiAgICAgICAgdGhpcy50b2RvcyA9IHRoaXMudG9kb3MuZmlsdGVyKHQgPT4gIXQuY29tcGxldGVkKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUodG9kbykge1xyXG4gICAgICAgIHZhciBpZHggPSB0aGlzLnRvZG9zLmluZGV4T2YodG9kbyk7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcInJlbW92ZSB0b2RvIFwiLCBpZHgpO1xyXG4gICAgICAgIGlmIChpZHggPj0gMClcclxuICAgICAgICAgICAgdGhpcy50b2Rvcy5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ0b2RvIG5vdCBmb3VuZFwiLCB0b2RvKTtcclxuICAgIH1cclxuXHJcbiAgICBvcmRlckJ5VGl0bGUoKSB7XHJcbiAgICAgICAgdGhpcy50b2RvcyA9IHRoaXMudG9kb3Muc29ydCgoeCwgeSkgPT4geC50aXRsZS5sb2NhbGVDb21wYXJlKHkudGl0bGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBvcmRlckJ5VGl0bGVEZXNjKCkge1xyXG4gICAgICAgIHRoaXMudG9kb3MgPSB0aGlzLnRvZG9zLnNvcnQoKHgsIHkpID0+IHkudGl0bGUubG9jYWxlQ29tcGFyZSh4LnRpdGxlKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRvZG8ge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIHRpdGxlOiBzdHJpbmcsIHB1YmxpYyBjb21wbGV0ZWQgPSBmYWxzZSkge1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZUNvbXBsZXRpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZWQgPSAhdGhpcy5jb21wbGV0ZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbiJdfQ==