﻿import { Core } from "./core"

export module Template {

    export interface IVisitor<T> {
        text(expr, options: any): T;
        content(expr, children: INode[], options?: any): T;
        tag(name, ns, attrs, options?: any): IVisitor<T>;
    }

    export interface INode {
        accept<T>(visitor: IVisitor<T>, options?: any): T;
    }

    export class TextTemplate implements INode {
        constructor(private parts : any[] | string) {
        }

        accept<T>(visitor: IVisitor<T>, options: any): T {
            return visitor.text(this.parts, options);
        }
    }

    export class ContentTemplate implements INode {
        // ReSharper disable once InconsistentNaming
        private children: INode[] = [];

        constructor(private ast) { }

        child(child: INode) {
            this.children.push(child);
            return this;
        }

        accept<T>(visitor: IVisitor<T>, options: any): T {
            return visitor.content(this.ast, this.children, options);
        }

        //bind(context) {
        //    const newBinding = new Dom.ContentBinding();
        //    this.children()
        //        // ReSharper disable once TsResolvedFromInaccessibleModule
        //        .reduce(ContentTemplate.reduceChild,
        //        { context, offset: 0, parentBinding: newBinding });

        //    newBinding.update(context);

        //    return newBinding;
        //}

        //static reduceChild(prev, cur: INode) {
        //    var { parentBinding, context, offset } = prev;

        //    prev.offset = Core.ready(offset,
        //        p => {
        //            var state = Dom.executeTemplate(context, cur, parentBinding.dom, p);
        //            return Core.ready(state, x => { return p + x.bindings.length });
        //        });

        //    return prev;
        //}
    }

    export class TagTemplate implements INode {
        private attributes: { name: string; tpl }[] = [];
        private events = new Map<string, any>();
        // ReSharper disable once InconsistentNaming
        private _children: INode[] = [];
        public modelAccessor;

        constructor(public name: string, private ns: string) {
        }

        public children(): INode[] {
            return this._children;
        }

        public attr(name: string, expr: any) {
            return this.addAttribute(name, expr);
        }
        
        public addAttribute(name: string, expr: any) {
            var attr = this.getAttribute(name);
            if (!attr)
                this.attributes.push({ name: name.toLowerCase(), tpl: expr });
            return this;
        }

        public getAttribute(name: string) {
            var key = name.toLowerCase();
            for (var i = 0; i < this.attributes.length; i++) {
                var attr = this.attributes[i];
                if (attr.name === key)
                    return attr;
            }
            return undefined;
        }

        public addEvent(name, callback) {
            this.events.set(name, callback);
        }

        public addChild(child: INode) {
            this._children.push(child);
            return this;
        }

        public select(modelAccessor) {
            this.modelAccessor = modelAccessor;
            return this;
        }

        accept<T>(visitor: IVisitor<T>, options: any) {
            var tag = visitor.tag(this.name, this.ns, this.attributes, options) as IVisitor<T>;
            this._children.forEach(x => x.accept(tag));

            return tag;
            // var content = visitor.content(null, children);

            // return visitor.tag(this.name, this.ns, this.attributes, this.events, content);
        }

        //bind(context) {
        //    const newBinding = new Dom.TagBinding(this.name, this.ns, this.attributes, this.events);
        //    this.children()
        //        .reduce(ContentTemplate.reduceChild,
        //        { context, offset: 0, parentBinding: newBinding, modelAccessor: this.modelAccessor });

        //    newBinding.update(context);

        //    return newBinding;
        //}
    }
}

export {
    Template as t
}