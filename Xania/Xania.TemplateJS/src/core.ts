﻿interface IDomTemplate {
    bind(model, idx): Binding;
    modelAccessor;
    children();
}

class TextTemplate implements IDomTemplate {
    modelAccessor;

    constructor(private tpl) {
    }

    execute(context) {
        return typeof this.tpl == "function"
            ? this.tpl(context)
            : this.tpl;
    }

    bind(model) {
        return new ContentBinding(this, model);
    }

    toString() {
        return this.tpl.toString();
    }

    children() {
        return [];
    }
}

class TagTemplate implements IDomTemplate {
    private attributes = new Map<string, any>();
    private events = new Map<string, any>();
    // ReSharper disable once InconsistentNaming
    private _children: IDomTemplate[] = [];
    public modelAccessor: Function;// = Xania.identity;

    constructor(public name: string) {
    }

    public children() {
        return this._children;
    }

    public attr(name: string, value: string | Function) {
        return this.addAttribute(name, value);
    }

    public addAttribute(name: string, value: string | Function) {

        var tpl = typeof (value) === "function"
            ? value
            : () => value;

        this.attributes.set(name, tpl);

        return this;
    }

    public addEvent(name, callback) {
        this.events.set(name, callback);
    }

    public addChild(child: TagTemplate) {
        this._children.push(child);
        return this;
    }

    public bind(model) {
        return new TagBinding(this, model);
    }

    public select(modelAccessor) {
        this.modelAccessor = modelAccessor;
        return this;
    }

    public executeAttributes(context) {
        var result = {
            "class": []
        };

        this.attributes.forEach((tpl, name) => {
            var value = tpl(context);
            if (name.startsWith("class.")) {
                if (!!value) {
                    var className = name.substr(6);
                    result["class"].push(className);
                }
            } else if (name === "class") {
                var cls = value.split(" ");
                result["class"].push.apply(result["class"], cls);
            } else {
                result[name] = value;
            }
        });

        return result;
    }

    public executeEvents(context) {
        var result: any = {};

        if (this.name.toUpperCase() === "INPUT") {
            var name = this.attributes.get("name")(context);
            result.update = new Function("value", `with (this) { ${name} = value; }`).bind(context);
        }

        this.events.forEach((callback, eventName) => {
            result[eventName] = callback.bind(this, context);
        });

        return result;
    }

}

class SelectManyExpression {
    constructor(public varName: string, private viewModel: string,
        public collectionExpr, private loader: any) {

        if (collectionExpr === undefined || collectionExpr === null) {
            throw new Error("null argument exception");
        }
    }

    execute(context) {
        var collectionFunc = new Function("m", `with(m) { return ${this.collectionExpr}; }`),
            varName = this.varName;
        if (Array.isArray(context))
            throw new Error("context is Array");

        var col = collectionFunc(context);

        return Xania.promise(col).then(data => {
            var arr = Array.isArray(data) ? data : [data];

            var results = [];
            for (var i = 0; i < arr.length; i++) {
                const result = {};
                result[varName] = arr[i];

                results.push(result);
            }

            return results;
        });
    }

    static parse(expr, loader = t => <any>window[t]) {
        const m = expr.match(/^(\w+)(\s*:\s*(\w+))?\s+of\s+((\w+)\s*:\s*)?(.*)$/i);
        if (!!m) {
            // ReSharper disable once UnusedLocals
            const [, varName, , itemType, , directive, collectionExpr] = m;
            var viewModel = loader(itemType);
            return new SelectManyExpression(
                varName,
                viewModel,
                collectionExpr,
                loader);
        }
        return null;
    }

    private static ensureIsArray(obj) {
        return Array.isArray(obj) ? obj : [obj];
    }

    items: any[] = [];
}

class Value {
    private obj;
    constructor(obj) {
        this.obj = obj;
    }

    valueOf() {
        return this.obj;
    }
}

interface IObserver {
    state(name: string, value?: any);
    setRead(obj: any, prop: string);
    setChange(obj: any, prop: any);
}

class Xania {

    private static lut;

    static identity(x) {
        return x;
    }

    static composable(data) {
        return data !== null && data !== undefined && typeof (data.then) === "function";
    }

    static promise(data) {
        if (data !== null && data !== undefined && typeof (data.then) === "function") {
            return data;
        }

        return {
            then(resolve, ...args: any[]) {
                const result = resolve.apply(this, args.concat([data]));
                if (result === undefined)
                    return this;
                return Xania.promise(result);
            }
        };
    }

    static map(fn: Function, data: any) {
        if (typeof data.then === "function") {
            return data.then(arr => {
                Xania.map(fn, arr);
            });
        } else if (typeof data.map === "function") {
            data.map(fn);
        } else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                fn.call(this, data[i], i, data);
            }
        } else {
            fn.call(this, data, 0, [data]);
        }
        // ReSharper disable once NotAllPathsReturnValue
    }

    static collect(fn: Function, data: any) {
        if (Array.isArray(data)) {
            var result = [];
            for (let i = 0; i < data.length; i++) {
                var items = fn.call(this, data[i]);
                Array.prototype.push.apply(result, items);
            }
            return result;
        } else {
            return [fn.call(this, data)];
        }
    }

    static count(data) {
        if (data === null || typeof data === "undefined")
            return 0;
        return !!data.length ? data.length : 1;
    }

    //static uuid() {
    //    if (!Xania.lut) {
    //        Xania.lut = [];
    //        for (var i = 0; i < 256; i++) {
    //            Xania.lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    //        }
    //    }
    //    const lut = Xania.lut;

    //    var d0 = Math.random() * 0xffffffff | 0;
    //    var d1 = Math.random() * 0xffffffff | 0;
    //    var d2 = Math.random() * 0xffffffff | 0;
    //    var d3 = Math.random() * 0xffffffff | 0;
    //    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
    //        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
    //        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
    //        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    //}

    static compose(...fns: any[]): Function {
        return function (result) {
            for (var i = fns.length - 1; i > -1; i--) {
                // ReSharper disable once SuspiciousThisUsage
                result = fns[i].call(this, result);
            }
            return result;
        };
    }

    static partialApp(fn, ...partialArgs: any[]) {
        return function (...additionalArgs: any[]) {
            var args = [].concat(partialArgs, additionalArgs);

            // ReSharper disable once SuspiciousThisUsage
            return fn.apply(this, args);
        }
    }

    static observe(target, observer: IObserver) {
        // ReSharper disable once InconsistentNaming
        if (!target || target.isSpy)
            return target;

        if (target.isSpy)
            throw new Error("observe observable is not allowed");

        if (typeof target === "object") {
            if (Array.isArray(target))
                return Xania.observeArray(target, observer);
            else
                return Xania.observeObject(target, observer);
        } else {
            return target;
        }
    }

    static observeArray(arr, observer: IObserver) {
        // ReSharper disable once InconsistentNaming
        var ProxyConst = window["Proxy"];
        return new ProxyConst(arr, {
            get(target, property) {
                switch (property) {
                    case "isSpy":
                        return true;
                    case "empty":
                        observer.setRead(arr, "length");
                        return arr.length === 0;
                    case "valueOf":
                        return arr.valueOf.bind(arr);
                    case "indexOf":
                        return arr.indexOf.bind(arr);
                    default:
                        return Xania.observeProperty(arr, property, observer);
                }
            },
            set(target, property, value, receiver) {
                const unwrapped = Xania.unwrap(value);
                if (arr[property] !== unwrapped) {
                    var length = arr.length;

                    arr[property] = unwrapped;
                    observer.setChange(arr, property);

                    if (arr.length !== length)
                        observer.setChange(arr, "length");
                }

                return true;
            }
        });
    }

    static unwrap(obj, cache: Set<any> = null) {
        if (obj === undefined || obj === null || typeof (obj) !== "object")
            return obj;

        if (!!cache && cache.has(obj))
            return obj;

        if (!!obj.isSpy) {
            return Xania.unwrap(obj.valueOf(), cache);
        }

        if (!cache)
            cache = new Set();
        cache.add(obj);

        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                obj[prop] = Xania.unwrap(obj[prop], cache);
            }
        }

        return obj;
    }

    static observeObject(target, observer: IObserver) {
        // ReSharper disable once InconsistentNaming
        function Spy() { }
        if (target.constructor !== Object) {
            function __() { // ReSharper disable once SuspiciousThisUsage 
                this.constructor = Spy;
            };
            __.prototype = target.constructor.prototype;
            Spy.prototype = new __();
        }
        Spy.prototype.valueOf = () => target;
        Spy.prototype.state = observer.state.bind(observer);

        Object.defineProperty(Spy.prototype, "isSpy", { get() { return true; }, enumerable: false });

        const props = Object.getOwnPropertyNames(target);
        for (let i = 0; i < props.length; i++) {
            var prop = props[i];
            Object.defineProperty(Spy.prototype,
                prop,
                {
                    get: Xania.partialApp((obj, name: string) => {
                        observer.setRead(obj, name);
                        // ReSharper disable once SuspiciousThisUsage
                        return Xania.observeProperty(obj, name, observer);
                    }, target, prop),
                    set: Xania.partialApp((obj, name: string, value: any) => {
                        var unwrapped = Xania.unwrap(value);
                        if (obj[name] !== unwrapped) {
                            obj[name] = unwrapped;
                            observer.setChange(obj, name);
                        }
                    }, target, prop),
                    enumerable: true,
                    configurable: true
                });
        }
        return new Spy;
    }

    static observeProperty(object, propertyName, observer: IObserver) {
        var propertyValue = object[propertyName];
        if (typeof propertyValue === "function") {
            return function () {
                var proxy = Xania.observe(object, observer);
                var retval = propertyValue.apply(proxy, arguments);

                return Xania.observe(retval, observer);
            };
        } else {
            observer.setRead(object, propertyName);
            if (propertyValue === null || typeof propertyValue === "undefined") {
                return null;
            }
            else {
                return Xania.observe(propertyValue, observer);
            }
        }
    }

    static construct(viewModel, data) {
        //return Xania.assign(new viewModel, data);

        function Proxy() {
        }
        function __() {
            // ReSharper disable once SuspiciousThisUsage
            this.constructor = Proxy;
        };
        __.prototype = data.constructor.prototype;
        Proxy.prototype = new __();

        for (let fn in viewModel.prototype) {
            if (viewModel.prototype.hasOwnProperty(fn)) {
                console.log(fn);
                Proxy.prototype[fn] = viewModel.prototype[fn];
            }
        }

        for (let prop in data) {
            if (data.hasOwnProperty(prop)) {
                Object.defineProperty(Proxy.prototype,
                    prop,
                    {
                        get: Xania.partialApp((obj, name) => this[name], data, prop),
                        enumerable: false,
                        configurable: false
                    });
            }
        }
        Proxy.prototype.valueOf = () => Xania.construct(viewModel, data.valueOf());

        return new Proxy();
    }

    static shallow(obj) {
        return Xania.assign({}, obj);
    }

    // static assign = (<any>Object).assign;
    static assign(target, ...args) {
        for (var i = 0; i < args.length; i++) {
            const object = args[i];
            for (let prop in object) {
                if (object.hasOwnProperty(prop)) {
                    target[prop] = object[prop];
                }
            }
        }
        return target;
    }

    static join(separator: string, value) {
        if (Array.isArray(value)) {
            return value.length > 0 ? value.sort().join(separator) : null;
        }
        return value;
    }
}

class Router {

    private currentAction = null;

    action(name: string) {
        if (name === null || typeof name === "undefined")
            return this.currentAction;

        return this.currentAction = name;
    }
}

class Binding {
    private data;
    public parent: TagBinding;
    public destroyed = false;

    constructor(public context) {
    }

    addChild(child, idx) {
        throw new Error("Abstract method Binding.update");
    }

    destroy() { throw new Error("Not implemented"); }

    render(context) { throw new Error("Not implemented"); }
}

interface ISubsriber {
    notify();
}

class Observer {
    private subscriptions = new Map<any, any>();
    private dirty = new Set<ISubsriber>();
    private state = {};

    add(object: any, property: string, subsriber: ISubsriber) {
        if (this.subscriptions.has(object)) {
            const deps = this.subscriptions.get(object);

            if (deps.hasOwnProperty(property)) {
                if (!deps[property].has(subsriber)) {
                    deps[property].add(subsriber);
                    return true;
                }
            } else {
                deps[property] = new Set<ISubsriber>().add(subsriber);
                return true;
            }
        } else {
            const deps = {};
            deps[property] = new Set<ISubsriber>().add(subsriber);
            this.subscriptions.set(object, deps);
            return true;
        }

        return false;
    }

    get(object: any, property: string) {
        if (!this.subscriptions.has(object))
            return null;

        const deps = this.subscriptions.get(object);

        if (deps.hasOwnProperty(property))
            return deps[property];

        return null;
    }

    unsubscribe(subscription) {
        while (subscription.dependencies.length > 0) {
            var dep = subscription.dependencies.pop();

            const deps = this.subscriptions.get(dep.obj);

            deps[dep.property].delete(subscription);
        }
        subscription.children.forEach(child => {
            this.unsubscribe(child);
        });
        subscription.children.clear();
        this.dirty.delete(subscription);
    }

    subscribe(context, update, ...additionalArgs) {
        var observer = this,
            // ReSharper disable once JoinDeclarationAndInitializerJs
            observable: Object | void,
            // ReSharper disable once JoinDeclarationAndInitializerJs
            updateArgs: (Object | void)[];

        var subscription = {
            parent: undefined,
            children: new Set<any>(),
            state: undefined,
            dependencies: [],
            notify() {
                observer.unsubscribe(this);
                return Xania.promise(this.state)
                    .then(s => this.state = update.apply(observer, updateArgs.concat([s])));
            },
            then(resolve) {
                return Xania.promise(this.state).then(resolve);
            },
            subscribe(...args) {
                return observer.subscribe.apply(observer, args);
            },
            attach(parent) {
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
            state(name, value) {
                this.setRead(observer.state, name);
                if (value === undefined) {
                    return observer.state[name];
                } else {
                    return observer.state[name] === value;
                }
            },
            setRead(obj, property) {
                if (observer.add(obj, property, subscription)) {
                    subscription.dependencies.push({ obj, property });
                }
            },
            setChange(obj, property: string) {
                throw new Error("invalid change");
            }
        });
        updateArgs = [observable, subscription].concat(additionalArgs);
        subscription.notify();

        return subscription;
    }

    track(context) {
        var observer = this;
        return Xania.observe(context,
            {
                state(name, value) {
                    if (value !== undefined) {
                        this.setChange(observer.state, name);
                        observer.state[name] = value;
                    }
                },
                setRead() {
                    // ignore
                },
                setChange(obj, property: string) {
                    const subscribers = observer.get(obj, property);
                    if (!!subscribers) {
                        subscribers.forEach(s => {
                            observer.dirty.add(s);
                        });
                    }
                }
            });
    }

    update() {
        console.debug("dirty size", this.dirty.size);
        this.dirty.forEach(subscriber => {
            subscriber.notify();
        });
        this.dirty.clear();
    }

    get size() {
        var total = 0;
        this.subscriptions.forEach(deps => {
            for (let p in deps) {
                if (deps.hasOwnProperty(p)) {
                    total += deps[p].size;
                }
            }
        });

        return total;
    }
}

class ContentBinding extends Binding {
    private dom;

    constructor(private tpl: TextTemplate, context) {
        super(context);

        this.dom = document.createTextNode("");
    }

    update(context) {
        this.dom.textContent = this.tpl.execute(context);
    }

    destroy() {
        if (!!this.dom) {
            this.dom.remove();
        }
        this.destroyed = true;
    }

    render(context) {
        this.dom.textContent = this.tpl.execute(context);
    }
}

class TagBinding extends Binding {

    public children: Binding[] = [];
    protected dom: HTMLElement;

    constructor(private tpl: TagTemplate, context) {
        super(context);

        this.dom = document.createElement(tpl.name);
        this.dom.attributes["__binding"] = this;
    }

    render(context) {
        const tpl = this.tpl;
        const dom = this.dom;

        const attributes = tpl.executeAttributes(context);
        for (let attrName in attributes) {
            if (attributes.hasOwnProperty(attrName)) {
                const newValue = Xania.join(" ", attributes[attrName]);
                const oldValue = dom[attrName];
                if (oldValue === newValue)
                    continue;

                dom[attrName] = newValue;
                if (typeof newValue === "undefined" || newValue === null) {
                    dom.removeAttribute(attrName);
                } else if (attrName === "value") {
                    dom["value"] = newValue;
                } else {
                    let domAttr = dom.attributes[attrName];
                    if (!!domAttr) {
                        domAttr.nodeValue = newValue;
                        domAttr.value = newValue;
                    } else {
                        domAttr = document.createAttribute(attrName);
                        domAttr.value = newValue;
                        dom.setAttributeNode(domAttr);
                    }
                }
            }
        }

        return dom;
    }

    destroy() {
        if (!!this.dom) {
            this.dom.remove();
        }
        this.destroyed = true;
    }
}

class Binder {
    private observer = new Observer();

    constructor(public compile: Function = null) {
        if (!this.compile) {
            var compiler = new Ast.Compiler();
            this.compile = compiler.template.bind(compiler);
        }
    }

    public import(itemType) {
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
    }

    parseAttr(tagElement: TagTemplate, attr: Attr) {
        const name = attr.name;
        if (name === "click" || name.startsWith("keyup.")) {
            const fn = this.compile(attr.value);
            tagElement.addEvent(name, fn);
        } else if (name === "data-select" || name === "data-from") {
            const fn = this.compile(attr.value);
            tagElement.select(fn);
        } else if (name === "checked") {
            const fn = this.compile(attr.value);
            tagElement.attr(name, Xania.compose(ctx => !!ctx ? "checked" : null, fn));
        } else {
            const tpl = this.compile(attr.value);
            tagElement.attr(name, tpl || attr.value);
        }
    }


    execute(rootContext, rootTpl, rootTarget) {

        var visit = (parent, context, tpl, target, offset: number) => {
            return this.observer.subscribe(context, (observable, subscription, state = { length: 0 }) => {
                var visitArray = arr => {
                    var prevLength = state.length;

                    for (let e = prevLength - 1; e >= 0; e--) {
                        const idx = offset + e;
                        target.removeChild(target.childNodes[idx]);
                    }

                    var docfrag = document.createDocumentFragment();

                    for (let idx = 0; idx < arr.length; idx++) {

                        const result = !!arr[idx] ? Xania.assign({}, context, arr[idx]) : context;
                        var binding = tpl.bind(result);

                        this.observer.subscribe(result, binding.render.bind(binding)).attach(subscription);

                        const visitChild = Xania.partialApp((data, parent, prev, cur) => {
                            return Xania.promise(prev)
                                .then(p => {
                                    return visit(subscription, data, cur, parent, p).then(x => p + x.length);
                                });
                        },
                            result,
                            binding.dom);

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
                        .then(model => {
                            model = Xania.unwrap(model);
                            return visitArray(Array.isArray(model) ? model : [model]);
                        });
                } else {
                    return visitArray([null]);
                }
            });
        };
        visit(null, rootContext, rootTpl, rootTarget, 0);
    }

    bind(content, model, target) {
        target = target || document.body;
        for (var i = content.childNodes.length - 1; i >= 0; i--) {
            var tpl = this.parseDom(content.childNodes[i]);
            this.bindTemplate(tpl, model, target);
        }

        var eventHandler = (target, name) => {
            var binding = target.attributes["__binding"];
            if (!!binding) {
                var handler = binding.tpl.events.get(name);
                if (!!handler) {
                    const observable = this.observer.track(binding.context);
                    handler(observable);
                    this.observer.update();
                }
            }
        };

        target.addEventListener("click", evt => eventHandler(evt.target, evt.type));

        const onchange = evt => {
            var binding = evt.target.attributes["__binding"];
            if (binding != null) {
                const nameAttr = evt.target.attributes["name"];
                if (!!nameAttr) {
                    const proxy = this.observer.track(binding.context);
                    const prop = nameAttr.value;
                    const update = new Function("context", "value",
                        `with (context) { ${prop} = value; }`);
                    update(proxy, evt.target.value);
                }
            }
        };
        target.addEventListener("keyup", evt => {
            if (evt.keyCode === 13) {
                eventHandler(evt.target, "keyup.enter");
            } else {
                onchange(evt);
            }
            this.observer.update();
        });
    }

    bindTemplate(tpl, model, target) {
        const arr = Array.isArray(model) ? model : [model];
        for (let i = 0; i < arr.length; i++) {
            this.execute(arr[i], tpl, target);
        }
    }

    parseDom(rootDom: HTMLElement): TagTemplate {
        const stack = [];
        let i: number;
        var rootTpl;
        stack.push({
            node: rootDom,
            push(e) {
                rootTpl = e;
            }
        });

        while (stack.length > 0) {
            const cur = stack.pop();
            const node: Node = cur.node;
            const push = cur.push;

            if (node.nodeType === 1) {
                const elt = <HTMLElement>node;
                const template = new TagTemplate(elt.tagName);

                for (i = 0; !!elt.attributes && i < elt.attributes.length; i++) {
                    var attribute = elt.attributes[i];
                    this.parseAttr(template, attribute);
                }

                for (i = elt.childNodes.length - 1; i >= 0; i--) {
                    stack.push({ node: elt.childNodes[i], push: template.addChild.bind(template) });
                }
                push(template);
            } else if (node.nodeType === 3) {
                const tpl = this.compile(node.textContent);
                push(new TextTemplate(tpl || node.textContent));
            }
        }

        return rootTpl;
    }
}
// ReSharper restore InconsistentNaming
