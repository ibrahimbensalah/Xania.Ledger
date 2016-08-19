var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Binding = (function () {
    function Binding(context) {
        this.context = context;
        this.destroyed = false;
    }
    Binding.prototype.addChild = function (child, idx) {
        throw new Error("Abstract method Binding.update");
    };
    Binding.prototype.destroy = function () { throw new Error("Not implemented"); };
    Binding.prototype.render = function (context) { throw new Error("Not implemented"); };
    return Binding;
})();
var Observer = (function () {
    function Observer() {
        this.subscriptions = new Map();
        this.dirty = new Set();
        this.state = {};
    }
    Observer.prototype.add = function (object, property, subsriber) {
        if (this.subscriptions.has(object)) {
            var deps = this.subscriptions.get(object);
            if (deps.hasOwnProperty(property)) {
                if (!deps[property].has(subsriber)) {
                    deps[property].add(subsriber);
                    return true;
                }
            }
            else {
                deps[property] = new Set().add(subsriber);
                return true;
            }
        }
        else {
            var deps = {};
            deps[property] = new Set().add(subsriber);
            this.subscriptions.set(object, deps);
            return true;
        }
        return false;
    };
    Observer.prototype.get = function (object, property) {
        if (!this.subscriptions.has(object))
            return null;
        var deps = this.subscriptions.get(object);
        if (deps.hasOwnProperty(property))
            return deps[property];
        return null;
    };
    Observer.prototype.unsubscribe = function (subscription) {
        var _this = this;
        while (subscription.dependencies.length > 0) {
            var dep = subscription.dependencies.pop();
            var deps = this.subscriptions.get(dep.obj);
            deps[dep.property].delete(subscription);
        }
        subscription.children.forEach(function (child) {
            _this.unsubscribe(child);
        });
        subscription.children.clear();
        this.dirty.delete(subscription);
    };
    Observer.prototype.subscribe = function (context, update) {
        var additionalArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            additionalArgs[_i - 2] = arguments[_i];
        }
        var observer = this, observable, updateArgs;
        var subscription = {
            parent: undefined,
            children: new Set(),
            state: undefined,
            dependencies: [],
            notify: function () {
                var _this = this;
                observer.unsubscribe(this);
                return Xania.promise(this.state)
                    .then(function (s) { return _this.state = update.apply(observer, updateArgs.concat([s])); });
            },
            then: function (resolve) {
                return Xania.promise(this.state).then(resolve);
            },
            subscribe: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return observer.subscribe.apply(observer, args);
            },
            attach: function (parent) {
                if (this.parent === parent)
                    return;
                if (!!this.parent)
                    this.parent.children.delete(this);
                this.parent = parent;
                if (!!parent)
                    parent.children.add(this);
            }
        };
        observable = Xania.observe(context, {
            state: function (name, value) {
                this.setRead(observer.state, name);
                if (value === undefined) {
                    return observer.state[name];
                }
                else {
                    return observer.state[name] === value;
                }
            },
            setRead: function (obj, property) {
                if (observer.add(obj, property, subscription)) {
                    subscription.dependencies.push({ obj: obj, property: property });
                }
            },
            setChange: function (obj, property) {
                throw new Error("invalid change");
            }
        });
        updateArgs = [observable, subscription].concat(additionalArgs);
        subscription.notify();
        return subscription;
    };
    Observer.prototype.track = function (context) {
        var observer = this;
        return Xania.observe(context, {
            state: function (name, value) {
                if (value !== undefined) {
                    this.setChange(observer.state, name);
                    observer.state[name] = value;
                }
            },
            setRead: function () {
            },
            setChange: function (obj, property) {
                var subscribers = observer.get(obj, property);
                if (!!subscribers) {
                    subscribers.forEach(function (s) {
                        observer.dirty.add(s);
                    });
                }
            }
        });
    };
    Observer.prototype.update = function () {
        console.debug("dirty size", this.dirty.size);
        this.dirty.forEach(function (subscriber) {
            subscriber.notify();
        });
        this.dirty.clear();
    };
    Object.defineProperty(Observer.prototype, "size", {
        get: function () {
            var total = 0;
            this.subscriptions.forEach(function (deps) {
                for (var p in deps) {
                    if (deps.hasOwnProperty(p)) {
                        total += deps[p].size;
                    }
                }
            });
            return total;
        },
        enumerable: true,
        configurable: true
    });
    return Observer;
})();
var ContentBinding = (function (_super) {
    __extends(ContentBinding, _super);
    function ContentBinding(tpl, context) {
        _super.call(this, context);
        this.tpl = tpl;
        this.dom = document.createTextNode("");
    }
    ContentBinding.prototype.update = function (context) {
        this.dom.textContent = this.tpl.execute(context);
    };
    ContentBinding.prototype.destroy = function () {
        if (!!this.dom) {
            this.dom.remove();
        }
        this.destroyed = true;
    };
    ContentBinding.prototype.render = function (context) {
        this.dom.textContent = this.tpl.execute(context);
    };
    return ContentBinding;
})(Binding);
var TagBinding = (function (_super) {
    __extends(TagBinding, _super);
    function TagBinding(tpl, context) {
        _super.call(this, context);
        this.tpl = tpl;
        this.children = [];
        this.dom = document.createElement(tpl.name);
        this.dom.attributes["__binding"] = this;
    }
    TagBinding.prototype.render = function (context) {
        var tpl = this.tpl;
        var dom = this.dom;
        var attributes = tpl.executeAttributes(context);
        for (var attrName in attributes) {
            if (attributes.hasOwnProperty(attrName)) {
                var newValue = Xania.join(" ", attributes[attrName]);
                var oldValue = dom[attrName];
                if (oldValue === newValue)
                    continue;
                dom[attrName] = newValue;
                if (typeof newValue === "undefined" || newValue === null) {
                    dom.removeAttribute(attrName);
                }
                else if (attrName === "value") {
                    dom["value"] = newValue;
                }
                else {
                    var domAttr = dom.attributes[attrName];
                    if (!!domAttr) {
                        domAttr.nodeValue = newValue;
                        domAttr.value = newValue;
                    }
                    else {
                        domAttr = document.createAttribute(attrName);
                        domAttr.value = newValue;
                        dom.setAttributeNode(domAttr);
                    }
                }
            }
        }
        return dom;
    };
    TagBinding.prototype.destroy = function () {
        if (!!this.dom) {
            this.dom.remove();
        }
        this.destroyed = true;
    };
    return TagBinding;
})(Binding);
var Binder = (function () {
    function Binder(compile) {
        if (compile === void 0) { compile = TemplateEngine.compile; }
        this.compile = compile;
        this.observer = new Observer();
    }
    Binder.prototype.import = function (itemType) {
        if (typeof itemType == "undefined")
            return null;
        switch (typeof (itemType)) {
            case "string":
                return window[itemType];
            case "function":
                return itemType;
            default:
                return null;
        }
    };
    Binder.prototype.parseAttr = function (tagElement, attr) {
        var name = attr.name;
        if (name === "click" || name.startsWith("keyup.")) {
            var fn = this.compile(attr.value);
            tagElement.addEvent(name, fn);
        }
        else if (name === "data-for" || name === "data-from") {
            tagElement.for(attr.value, this.import);
        }
        else if (name === "checked") {
            var fn = this.compile(attr.value);
            tagElement.attr(name, Xania.compose(function (ctx) { return !!ctx ? "checked" : null; }, fn));
        }
        else {
            var tpl = this.compile(attr.value);
            tagElement.attr(name, tpl || attr.value);
        }
    };
    Binder.prototype.execute = function (rootContext, rootTpl, rootTarget) {
        var _this = this;
        var visit = function (parent, context, tpl, target, offset) {
            return _this.observer.subscribe(context, function (observable, subscription, state) {
                if (state === void 0) { state = { length: 0 }; }
                var visitArray = function (arr) {
                    var prevLength = state.length;
                    for (var e = prevLength - 1; e >= 0; e--) {
                        var idx = offset + e;
                        target.removeChild(target.childNodes[idx]);
                    }
                    var docfrag = document.createDocumentFragment();
                    for (var idx = 0; idx < arr.length; idx++) {
                        var result = !!arr[idx] ? Xania.assign({}, context, arr[idx]) : context;
                        var binding = tpl.bind(result);
                        _this.observer.subscribe(result, binding.render.bind(binding)).attach(subscription);
                        var visitChild = Xania.partialApp(function (data, parent, prev, cur) {
                            return Xania.promise(prev)
                                .then(function (p) {
                                return visit(subscription, data, cur, parent, p).then(function (x) { return p + x.length; });
                            });
                        }, result, binding.dom);
                        tpl.children().reduce(visitChild, 0);
                        docfrag.appendChild(binding.dom);
                    }
                    if (offset < target.childNodes.length)
                        target.insertBefore(docfrag, target.childNodes[offset]);
                    else
                        target.appendChild(docfrag);
                    return { length: arr.length };
                };
                subscription.attach(parent);
                if (!!tpl.modelAccessor) {
                    return Xania.promise(tpl.modelAccessor(observable))
                        .then(function (model) {
                        model = Xania.unwrap(model);
                        return visitArray(Array.isArray(model) ? model : [model]);
                    });
                }
                else {
                    return visitArray([null]);
                }
            });
        };
        visit(null, rootContext, rootTpl, rootTarget, 0);
    };
    Binder.prototype.bind = function (content, model, target) {
        var _this = this;
        target = target || document.body;
        for (var i = content.childNodes.length - 1; i >= 0; i--) {
            var tpl = this.parseDom(content.childNodes[i]);
            this.bindTemplate(tpl, model, target);
        }
        var eventHandler = function (target, name) {
            var binding = target.attributes["__binding"];
            if (!!binding) {
                var handler = binding.tpl.events.get(name);
                if (!!handler) {
                    var observable = _this.observer.track(binding.context);
                    handler(observable);
                    _this.observer.update();
                }
            }
        };
        target.addEventListener("click", function (evt) { return eventHandler(evt.target, evt.type); });
        var onchange = function (evt) {
            var binding = evt.target.attributes["__binding"];
            if (binding != null) {
                var nameAttr = evt.target.attributes["name"];
                if (!!nameAttr) {
                    var proxy = _this.observer.track(binding.context);
                    var prop = nameAttr.value;
                    var update = new Function("context", "value", "with (context) { " + prop + " = value; }");
                    update(proxy, evt.target.value);
                }
            }
        };
        target.addEventListener("keyup", function (evt) {
            if (evt.keyCode === 13) {
                eventHandler(evt.target, "keyup.enter");
            }
            else {
                onchange(evt);
            }
            _this.observer.update();
        });
    };
    Binder.prototype.bindTemplate = function (tpl, model, target) {
        var arr = Array.isArray(model) ? model : [model];
        for (var i = 0; i < arr.length; i++) {
            this.execute(arr[i], tpl, target);
        }
    };
    Binder.prototype.parseDom = function (rootDom) {
        var stack = [];
        var i;
        var rootTpl;
        stack.push({
            node: rootDom,
            push: function (e) {
                rootTpl = e;
            }
        });
        while (stack.length > 0) {
            var cur = stack.pop();
            var node = cur.node;
            var push = cur.push;
            if (node.nodeType === 1) {
                var elt = node;
                var template = new TagTemplate(elt.tagName);
                for (i = 0; !!elt.attributes && i < elt.attributes.length; i++) {
                    var attribute = elt.attributes[i];
                    this.parseAttr(template, attribute);
                }
                for (i = elt.childNodes.length - 1; i >= 0; i--) {
                    stack.push({ node: elt.childNodes[i], push: template.addChild.bind(template) });
                }
                push(template);
            }
            else if (node.nodeType === 3) {
                var tpl = this.compile(node.textContent);
                push(new TextTemplate(tpl || node.textContent));
            }
        }
        return rootTpl;
    };
    return Binder;
})();
var TemplateEngine = (function () {
    function TemplateEngine() {
    }
    TemplateEngine.compile = function (input) {
        if (!input || !input.trim()) {
            return null;
        }
        var template = input.replace(/\n/g, "\\\n");
        var decl = [];
        var returnExpr = template.replace(/@([\w\(\)\.,=!']+)/gim, function (a, b) {
            var paramIdx = "arg" + decl.length;
            decl.push(b);
            return "\"+" + paramIdx + "+\"";
        });
        if (returnExpr === '"+arg0+"') {
            if (!TemplateEngine.cacheFn[input]) {
                var functionBody = "with(m) {return " + decl[0] + ";}";
                TemplateEngine.cacheFn[input] = new Function("m", functionBody);
            }
            return TemplateEngine.cacheFn[input];
        }
        else if (decl.length > 0) {
            var params = decl.map(function (v, i) { return ("var arg" + i + " = " + v); }).join(";");
            if (!TemplateEngine.cacheFn[input]) {
                var functionBody = "with(m) {" + params + ";return \"" + returnExpr + "\"}";
                TemplateEngine.cacheFn[input] = new Function("m", functionBody);
            }
            return TemplateEngine.cacheFn[input];
        }
        return function () { return returnExpr; };
    };
    TemplateEngine.cacheFn = {};
    return TemplateEngine;
})();
//# sourceMappingURL=binder.js.map