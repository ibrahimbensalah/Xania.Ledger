﻿module Xania {
    export class Zone {
        private $target = (window["Symbol"])("target");
        private $cache = new Map();

        constructor(private runtime: { get: Function, set: Function, invoke: Function }) {
        }

        $wrap(object) {
            var type = typeof object;
            if (object === null || type === "function" || type === "undefined" || type === "boolean" || type === "number" || type === "string")
                return object;

            var proxy = this.$cache.get(object);
            if (!proxy) {
                proxy = this.$proxy(object);
                this.$cache.set(object, proxy);
            }

            return proxy;
        }
        $unwrap(value) {
            var type = typeof value;
            if (type !== "object")
                return value;

            var target = value[this.$target];
            if (!!target) {
                return target;
            }

            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    // TODO, refactor .value
                    value[i] = this.$unwrap(value[i]);
                }
            }
            return value;
        }
        has(target, name) {
            return true;
        }
        get(target, name) {
            if (name === "$handler")
                return this;
            if (name === "$target")
                return target;
            if (name === this.$target)
                return target;
            if (name === (window["Symbol"]).toPrimitive)
                return () => target.valueOf();

            var value = this.runtime.get(target, name);

            if (typeof value === "function") {
                return () => {
                    return this.runtime.invoke(target, value);
                };
            }

            return this.$wrap(value);
        }
        set(target, name, value) {
            this.runtime.set(target, name, this.$unwrap(value));
            return true;
        }
        apply(target, thisArg, args) {
            return target.apply(thisArg, args);
        }
        $proxy(object) {
            var Proxy = window['Proxy'];
            return new Proxy(object, this);
        }
        run(func, context, args = []) {
            var xs = args.map(x => this.$wrap(x));

            var result;

            if (typeof func === "function") {
                let ctx = this.$wrap(context);
                result = func.apply(ctx, xs);
            } else {
                result = func.invoke(xs);
            }

            return this.$unwrap(result);
        }
    }
}
