﻿import { Core } from './core'
import { Reactive as Re } from './reactive'
import { Template } from './template'

export module Dom {

    var document = window.document;

    interface IDomBinding {
        length;
        update(context);
        dispose();
    }

    interface IDomVisitor extends Template.IVisitor<IDomBinding> {
    }

    export interface IView {
        bind(store, driver);
    }

    interface IAction {
        execute();
    }

    interface IDispatcher {
        dispatch(action: Re.IAction);
    }

    export class DomVisitor {
        static text(expr, driver: Re.IDriver): TextBinding {
            return new TextBinding(expr, driver);
        }
        static tag(tagName: string, ns: string, attrs, driver: Re.IDriver): TagBinding {
            var tag = new TagBinding(driver, tagName, ns), length = attrs.length;
            for (var i = 0; i < length; i++) {
                var { name, tpl } = attrs[i];
                if (typeof tpl !== "undefined")
                    tag.attr(name, tpl);
            }

            return tag;
        }
    }

    export class DomDriver {
        private target;
        private domElements = [];
        private events: { eventName: string, eventBinding: any, dom: any }[] = [];

        constructor(target) {
            if (typeof target === "string")
                this.target = document.querySelector(target);
            else
                this.target = target;
        }


        findEventBinding(target, eventName) {
            var events = this.events;
            while (target) {
                var e = events.length;
                while (e--) {
                    var ev = events[e];
                    if (ev.dom === target && ev.eventName === eventName) {
                        return ev.eventBinding;
                    }
                }
                target = target.parentNode;
            }
            return null;
        }

        on(eventName, dom, eventBinding) {
            var events = this.events,
                i = events.length,
                eventBound = false;

            while (i--) {
                var ev = events[i];
                if (ev.eventName === eventName) {
                    if (ev.dom === dom)
                        return ev;
                    else {
                        eventBound = true;
                        break;
                    }
                }
            }

            if (!eventBound) {
                this.target.addEventListener(eventName,
                    event => {
                        var eventBinding = this.findEventBinding(event.target, eventName);
                        if (eventBinding) {
                            eventBinding.fire(event);
                            event.preventDefault();
                        }
                    });
            }

            var entry = {
                eventName,
                dom,
                eventBinding,
                dispose() {
                    var idx = events.indexOf(this);
                    if (idx >= 0) {
                        events.splice(idx, 1);
                        return true;
                    }
                    return false;
                }
            };
            this.events.push(entry);
            return entry;
        }

        insert(_, dom, idx: number) {
            var domElements = this.domElements;
            var target = this.target;

            var curIdx = domElements.indexOf(dom);
            if (idx !== curIdx) {
                var childNodes = target.childNodes;
                if (idx < childNodes.length) {
                    var current = childNodes[idx];
                    if (current !== dom) {
                        target.insertBefore(dom, current);
                    }
                } else {
                    target.appendChild(dom);
                }
                var length = childNodes.length;
                domElements.length = length;
                for (let i = 0; i < length; i++) {
                    domElements[i] = childNodes[i];
                }
                return true;
            }
            return false;
        }

        dispose() {
            var domElements = this.domElements,
                i = domElements.length;
            while (i--) {
                domElements[i].remove();
            }
        }
    }

    interface IDOMDriver {
        insert(sender: IDomBinding, dom, idx);
    }

    export class TextBinding extends Re.Binding implements IDomBinding {
        public textNode;
        public length = 1;
        // public oldValue;

        constructor(private expr, driver: Re.IDriver) {
            super(driver);
        }

        dispose() {
            this.textNode.remove();
        }

        render(context, driver: IDOMDriver) {
            var { expr } = this;
            var typeOfExpr = typeof expr;
            const newValue = typeOfExpr === "string" || typeOfExpr === "undefined" ? expr : this.evaluateText(expr);
            // if (newValue !== this.oldValue)
            {
                // this.oldValue = newValue;
                var textNode = this.textNode;
                if (textNode) {
                    textNode.nodeValue = newValue;
                } else {
                    textNode = this.textNode = (<any>document).createTextNode(newValue);
                    driver.insert(this, textNode, 0);
                }
            }
        }
    }

    export class TagBinding extends Re.Binding implements IDomBinding {
        public tagNode;
        public length = 1;
        private domDriver: DomDriver;

        constructor(driver: Re.IDriver, private tagName: string, private ns: string = null) {
            super(driver);

            if (ns === null)
                this.tagNode = document.createElement(tagName);
            else {
                this.tagNode = (<any>document).createElementNS(ns, tagName.toLowerCase());
            }
            this.domDriver = new DomDriver(this.tagNode);
        }

        dispose() {
            this.tagNode.remove();
        }

        children(nodes: Template.INode[]): this {
            var length = nodes.length;
            for (var i = 0; i < length; i++) {
                this.child(nodes[i]);
            }

            return this;
        }

        child(node: Template.INode): this {
            this.childBindings.push(node.bind(this));
            return this;
        }

        attrs(attrs): this {
            for (var prop in attrs) {
                if (attrs.hasOwnProperty(prop)) {
                    var attrValue = attrs[prop];
                    this.attr(prop.toLowerCase(), attrValue);
                }
            }
            return this;
        }
        attr(name, expr?): this {
            if (!expr) {
                return this.tagNode[name];
            } else if (typeof expr === "string") {
                this.tagNode.setAttribute(name, expr);
            } else if (name === "class") {
                var classBinding = new ClassBinding(this.tagNode, expr, this.driver);
                this.childBindings.push(classBinding);
            } else if (name === "value" && this.tagName === "input") {
                const valueBinding = new ValueBinding(this.tagNode, expr, this.driver);
                this.childBindings.push(valueBinding);
            } else if (name === "checked" && this.tagName === "input") {
                const checkedBinding = new CheckedBinding(this.tagNode, expr, this.driver);
                this.childBindings.push(checkedBinding);
            } else if (name === "selected" && this.tagName === "option") {
                const selectedBinding = new SelectedBinding(this.tagNode, expr, this.driver);
                this.childBindings.push(selectedBinding);
            } else {
                var match = /^on(.+)/.exec(name);
                if (match) {
                    this.childBindings.push(new EventBinding(this.tagNode, match[1], expr, this.driver));
                } else {
                    var attrBinding = new AttributeBinding(this.tagNode, name, expr, this.driver);
                    this.childBindings.push(attrBinding);
                }
            }

            return this;
        }

        event(name, expr): this {
            this.childBindings.push(new EventBinding(this.tagNode, name, expr, this.driver));
            return this;
        }

        //insertTag(binding, tagName, idx) {
        //    var offset = 0, length = this.childBindings.length;
        //    for (var i = 0; i < length; i++) {
        //        if (this.childBindings[i] === binding)
        //            break;
        //        offset += this.childBindings[i].length;
        //    }
        //    this.domDriver.insertTag(this, tagName, offset + idx);
        //}

        insert(binding, dom, idx) {
            var { childBindings } = this;
            var offset = 0, length = childBindings.length;
            for (var i = 0; i < length; i++) {
                var b = childBindings[i];
                if (b === binding)
                    break;
                offset += typeof b.length === 'number' ? b.length : 1;
            }
            return this.domDriver.insert(this, dom, offset + idx);
        }

        render(context, driver) {
            driver.insert(this, this.tagNode, 0);
        }

        trigger(name, event, context?) {
            for (let n = 0; n < this.childBindings.length; n++) {
                const eventBinding = <EventBinding>this.childBindings[n];
                if (eventBinding.name === "move") {
                    eventBinding.fire(event, context);
                }
            }
        }
    }

    export class ClassBinding extends Re.Binding {
        public dom;
        // private oldValue;

        constructor(private tagNode: HTMLElement, private expr, driver: Re.IDriver) {
            super(driver);
        }

        render() {
            var newValue = this.evaluateText(this.expr);

            // if (newValue !== this.oldValue) {
                // this.oldValue = newValue;
                this.tagNode.className = newValue;
            // }
        }
    }

    export class EventBinding extends Re.Binding {
        constructor(private tagNode: any, public name, private expr, driver: Re.IDriver) {
            super(driver);
        }

        evaluate(expr, context) {
            if (typeof expr === "function")
                return expr(event, this.context);

            return expr.execute(context, this);
        }

        fire(event, context = this.context) {

            var eventContext = context ? [context] : [];
            eventContext.push({ value: event, event, node: event.target });

            var promises;
            if (Array.isArray(this.expr))
                promises = this.expr.map(x => this.evaluate(x, eventContext));
            else
                promises = [ this.evaluate(this.expr, eventContext) ];

            if (context && context.refresh)
                Promise.all(promises).then(() => {
                    context.refresh();
                });

        }

        render(context, driver) {
            driver.on(this.name, this.tagNode, this);
        }

        const(value) {
            return value;
        }

        app(fun, args: any[], context?) {
            if (fun === "assign") {
                if (typeof args[1].update !== 'function') {
                    console.error("Object is not mutable", args[1]);
                    return void 0;
                }

                var arg = args[0];
                if (arg === null)
                    args[1].update(null);
                else {
                    // ReSharper disable once QualifiedExpressionMaybeNull
                    arg = arg.valueOf();
                    args[1].update(arg.valueOf());
                }
                return arg;
            }

            if (args)
                return fun.apply(context, args.map(EventBinding.valueOf));
            else
                return fun();
        }

        private static valueOf(x) {
            return x && x.valueOf();
        }

        member(target: { get(name: string); refresh?(); }, name) {
            return target.get ? target.get(name) : target[name];
        }
    }

    class CheckedBinding extends Re.Binding {
        private oldValue;

        constructor(private tagNode: any, private expr, driver: Re.IDriver) {
            super(driver);

            tagNode.addEventListener("change", this.fire.bind(this));
        }

        fire() {
            let value = this.evaluateObject(this.expr);
            if (value && value.update) {
                value.update(this.tagNode.checked);

                if (this.context)
                    this.context.refresh();
            }
        }

        render() {
            let value = this.evaluateObject(this.expr);

            var newValue = value && value.valueOf();
            var oldValue = this.oldValue;

            var tag = this.tagNode;
            if (newValue !== void 0 && newValue !== false) {
                if (oldValue === void 0) {
                    var attr = document.createAttribute("checked");
                    attr.value = "checked";
                    tag.setAttributeNode(attr);
                } else {
                    tag["checked"] = "checked";
                    tag.setAttribute("checked", "checked");
                }
            } else {
                tag["checked"] = void 0;
                tag.removeAttribute("checked");
            }
            this.oldValue = newValue;
        }
    }

    class ValueBinding extends Re.Binding {
        private oldValue;

        constructor(private tagNode: any, private expr, driver: Re.IDriver) {
            super(driver);

            tagNode.addEventListener("change", this.fire);
        }

        private fire = () => {
            let value = this.evaluateObject(this.expr);
            if (value && value.update) {
                value.update(this.tagNode.value);
            }

            if (this.context)
                this.context.refresh();
        }

        render() {
            let value = this.evaluateText(this.expr);
            var newValue = value && value.valueOf();

            var tag = this.tagNode;
            if (newValue === void 0) {
                tag.removeAttribute("value");
                tag["value"] = Core.empty;
            } else {
                var attr = document.createAttribute("value");
                attr.value = newValue;
                tag.setAttributeNode(attr);
                tag["value"] = newValue;
            }
        }
    }

    export class AttributeBinding extends Re.Binding {
        constructor(private tagNode: any, private name, private expr, driver: Re.IDriver) {
            super(driver);
        }

        render(context, parent) {
            let value = this.evaluateText(this.expr);

            if (value && value.valueOf)
                value = value.valueOf();

            var newValue;
            if (this.name === "checked") {
                newValue = value ? "checked" : null;
            } else {
                newValue = value;
            }

            var attrName = this.name;
            var tag = this.tagNode;
            if (newValue === void 0 || newValue === null) {
                tag.removeAttribute(attrName);
            } else {
                var attr = document.createAttribute(attrName);
                attr.value = newValue;
                tag.setAttributeNode(attr);
            }
        }
    }

    export class SelectedBinding extends Re.Binding {
        constructor(private tagNode: any, private expr, driver: Re.IDriver) {
            super(driver);
        }

        render(context, parent) {
            let value = this.evaluateText(this.expr);

            if (value && value.valueOf)
                value = value.valueOf();

            this.tagNode.selected = value;
        }
    }
}

export function join(separator: string, value) {
    if (Array.isArray(value)) {
        return value.length > 0 ? value.sort().join(separator) : null;
    }
    return value;
}

// ReSharper restore InconsistentNaming

export default Dom;

let TagBinding = Dom.TagBinding;

export { TagBinding };