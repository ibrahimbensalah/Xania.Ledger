﻿/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />

import { Reactive as Re } from "../src/reactive";
import { fsharp as fs, accept, TOKENS } from "../src/fsharp";
import { Observables } from "../src/observables";

interface IPerson { firstName: string; lastName: string; adult: boolean, age: number }

var ibrahim: IPerson = {
    age: 36,
    firstName: "Ibrahim",
    lastName: "ben Salah",
    adult: true
};

describe("fsharp parser", () => {

    it(':: fun x -> x ',
        () => {
            var ast = fs("fun x -> x");
            expect(ast).toBeDefined();

            var compose = ast;
            expect(compose.type).toBe("lambda");
            expect(compose.param).toBe("x");
            expect(compose.body.name).toBe("x");
        });

    it(':: .firstName ',
        () => {
            var ast = fs(".firstName");
            expect(ast).toBeDefined();

            var compose = ast;
            expect(compose.type).toBe("lambda");
            expect(compose.param).toBe("x");
            expect(compose.body.target.name).toBe("x");
            expect(compose.body.member.name).toBe("firstName");
        });

    it(':: 1 + 2',
        () => {
            var ast = fs("1 + 2");
            expect(ast).toBeDefined();

            var expr = ast;
            expect(expr.type).toBe(TOKENS.BINARY);
        });

    it(':: fn a',
        () => {
            var ast = fs("fun a");
            expect(ast).toBeDefined();

            var expr = ast;
            expect(expr.type).toBe(TOKENS.APP);
            expect(expr.fun).toEqual({ type: TOKENS.IDENT, name: 'fun' });
            expect(expr.args).toEqual([{ type: TOKENS.IDENT, name: "a" }]);
        });

    it(':: fn ()',
        () => {
            var ast = fs("fun ()");
            expect(ast).toBeDefined();

            var expr = ast;
            expect(expr.type).toBe(TOKENS.APP);
            expect(expr.fun).toEqual({ type: TOKENS.IDENT, name: 'fun' });
            expect(expr.args.length).toBe(0);
        });

    it(':: (+) a b',
        () => {
            var ast = fs("(+) a b");
            expect(ast).toBeDefined();

            var expr = ast;
            expect(expr).toEqual({ "type": TOKENS.APP, "fun": "+", "args": [{ "type": TOKENS.IDENT, "name": "a" }, { "type": TOKENS.IDENT, "name": "b" }] });
        });

    it(':: a |> b |> c',
        () => {
            var ast = fs("a |> b |> c");
            expect(ast).toBeDefined();

            var pipe1 = ast;
            expect(pipe1.type).toBe(TOKENS.BINARY);
            expect(pipe1.op).toBe("|>");
            expect(pipe1.right).toEqual({ "type": TOKENS.IDENT, "name": "c" });

            var pipe2 = pipe1.left;
            expect(pipe2.type).toBe(TOKENS.BINARY);
            expect(pipe2.op).toBe("|>");
            expect(pipe2.right).toEqual({ "type": TOKENS.IDENT, "name": "b" });
            expect(pipe2.left).toEqual({ "type": TOKENS.IDENT, "name": "a" });
        });

    it(':: a + b |> c',
        () => {
            var ast = fs("a + b |> c");
            expect(ast).toBeDefined();

            var pipe = ast;
            expect(pipe.type).toBe(TOKENS.BINARY);
            expect(pipe.op).toBe("|>");
            expect(pipe.right).toEqual({ type: TOKENS.IDENT, name: "c" });

            var add = pipe.left;
            expect(add.right.name).toBe("b");
            expect(add.left.name).toBe("a");

            // [{"type":"pipe","fun":"|>","args":[{"type":TOKENS.IDENT,"name":"c"},{"type":"pipe","fun":"|>","args":[{"type":TOKENS.IDENT,"name":"b"},{"type":TOKENS.IDENT,"name":"a"}]}]}]
        });

    it(':: a >> b ',
        () => {
            var ast = fs("a >> b");
            expect(ast).toBeDefined();

            var compose = ast;
            expect(compose.type).toBe(TOKENS.COMPOSE, JSON.stringify(ast, null, 2));
            expect(compose.fun).toBe(">>", JSON.stringify(ast, null, 2));
            expect(compose.args[0].name).toBe("b", JSON.stringify(compose.args[0], null, 2));
            expect(compose.args[1].name).toBe("a", JSON.stringify(compose.args[1], null, 2));
        });

    it(':: a.b ',
        () => {
            var ast = fs("a.b");
            expect(ast).toBeDefined();

            var compose = ast;
            expect(compose.type).toBe(TOKENS.MEMBER, JSON.stringify(ast, null, 2));
            expect(compose.target.name).toBe("a", JSON.stringify(ast, null, 2));
            expect(compose.member).toBe("b", JSON.stringify(ast, null, 2));
        });

    it(':: [1..n] ',
        () => {
            var ast = fs("[1..n]");
            expect(ast).toBeDefined();

            var range = ast;
            expect(range.type).toBe(TOKENS.RANGE, JSON.stringify(ast, null, 2));
            expect(range.from.value).toBe(1, JSON.stringify(ast, null, 2));
            expect(range.to.name).toBe("n", JSON.stringify(ast, null, 2));
        });

    it(':: for p in people where p.adult ',
        () => {
            var ast = fs("for p in people where p.adult");
            expect(ast).toBeDefined();

            var where = ast;

            expect(where.type).toBe(TOKENS.WHERE);
            expect(where.predicate.type).toBe(TOKENS.MEMBER);
            expect(where.source.type).toBe(TOKENS.QUERY);
        });

    it(":: empty list -> 'list is empty' ",
        () => {
            var rule = fs("empty list -> 'list is empty'");
            expect(rule).toBeDefined();

            expect(rule.type).toBe(TOKENS.BINARY);
            expect(rule.op).toBe("->");
            expect(rule.right.value).toBe('list is empty');
        });


    it(':: regression test',
        () => {

            var start = new Date().getTime();

            var ast = fs("a |> b.c >> (+) 1 |> d");
            for (var i = 0; i < 1000; i++) {
                fs("a |> b >> (+) 1 |> d");
            }
            var elapsed = new Date().getTime() - start;

            if (elapsed > 2000) fail("too slow");

            expect(ast).toEqual(
                {
                    "type": TOKENS.BINARY,
                    "op": "|>",
                    "right": {
                        "type": TOKENS.IDENT,
                        "name": "d"
                    },
                    "left": {
                        "type": TOKENS.BINARY,
                        "op": "|>",
                        "right": {
                            "type": TOKENS.COMPOSE,
                            "fun": ">>",
                            "args": [
                                {
                                    "type": TOKENS.APP,
                                    "fun": "+",
                                    "args":
                                    [
                                        {
                                            "type": TOKENS.CONST,
                                            "value": 1
                                        }
                                    ]
                                },
                                {
                                    "type": TOKENS.MEMBER,
                                    "target": {
                                        "type": TOKENS.IDENT,
                                        "name": "b"
                                    },
                                    "member": "c"
                                }
                            ]
                        },
                        "left": {
                            "type": TOKENS.IDENT,
                            "name": "a"
                        }
                    }
                });
        });
});


class TestBinding extends Re.Binding {
    public value;

    constructor(private ast) {
        super();
    }

    render(context) {
        this.context = context;
        return this.value = accept(this.ast, this, context).valueOf();
    }

    app(fun, args: any[]) {
        if (fun === "assign") {
            var value = args[0].valueOf();
            args[1].set(value);
            return value;
        }

        return super.app(fun, args);
    }
}

describe("runtime", () => {

    it("expression dependencies",
        () => {
            var store = new Re.Store({ p: ibrahim });
            var binding = new TestBinding(fs("p.firstName"));
            binding.render(store);

            expect(binding.value).toBe("Ibrahim");
            // expect(binding.dependencies.length).toBe(2);

            // expect(store.dirty.length).toBe(0);

            store.get("p").get("firstName").set("Mr Ibraihm");
            expect(binding.value).toBe("Mr Ibraihm");

            // expect(binding.dependencies.length).toBe(2);
        });

    it("consistent variable identity",
        () => {
            var store = new Re.Store({ p: ibrahim });

            var binding = new TestBinding(fs("p"));

            expect(binding.render(store)).toBe(binding.render(store));
        });

    it("consistent member identity", () => {
        var store = new Re.Store({ xania: { owner: ibrahim } });
        var binding = new TestBinding(fs("xania.owner"));
        expect(binding.render(store)).toBe(binding.render(store));
    });

    it("consistent query identity", () => {
        var store = new Re.Store({ xania: { employees: [ibrahim] } });
        var binding = new TestBinding(fs("for e in xania.employees"));
        expect(binding.render(store)[0]).toBe(binding.render(store)[0], "not identical");
    });

    it("assign expression",
        () => {
            var store = new Re.Store({ x: 1, y: 2, sum: 0 });
            var binding = new TestBinding(fs("sum <- x + y"));
            binding.render(store);
            expect(store.get("sum").valueOf()).toBe(3);
        });

    it('await observable',
        () => {
            var observable = new Observables.Observable(123);
            var store = new Re.Store({ observable });
            var binding = new TestBinding(fs("await observable"));

            binding.render(store);
            expect(binding.value).toBe(123);

            observable.onNext(456);
            expect(binding.value).toBe(456);
        });

});
