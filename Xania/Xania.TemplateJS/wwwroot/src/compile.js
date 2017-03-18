"use strict";
var peg = require("./query.peg");
function empty(list) {
    return list.length === 0;
}
function not(value) {
    return !value;
}
function or(x, y) {
    return x || y ? true : false;
}
function count(list) {
    return list.length;
}
var WHERE = 1;
var QUERY = 2;
var IDENT = 3;
var MEMBER = 4;
var APP = 5;
var SELECT = 6;
var CONST = 7;
var RANGE = 8;
var BINARY = 9;
var AWAIT = 10;
var PIPE = 11;
var COMPOSE = 12;
var LAMBDA = 13;
var Expression = (function () {
    function Expression(ast, stack) {
        this.ast = ast;
        this.stack = stack;
    }
    Expression.prototype.execute = function (binding, contexts) {
        var stack = this.stack;
        var context = Array.isArray(contexts) ? new Scope(binding, contexts) : contexts;
        var idx = stack.length;
        while (idx--) {
            var ast = stack[idx];
            switch (ast.type) {
                case IDENT:
                    ast.value = binding.member(context, ast.name);
                    break;
                case QUERY:
                    ast.value = binding.query(ast.param, ast.source.value);
                    break;
                case CONST:
                    break;
                case MEMBER:
                    var target = ast.target.value;
                    var name = ast.member.value || ast.member;
                    ast.value = binding.member(target, name);
                    break;
                case AWAIT:
                    ast.value = binding.await(ast.expr.value);
                    break;
                case RANGE:
                    var first = ast.from.value;
                    var last = ast.to.value;
                    if (first === void 0 || last === void 0)
                        return void 0;
                    ast.value = new Range(first, last);
                    break;
                case BINARY:
                    var source;
                    switch (ast.op) {
                        case "->":
                            source = ast.left.value;
                            if (source === void 0 || !source.valueOf())
                                return void 0;
                            ast.value = ast.right.compiled.execute(binding, context);
                            break;
                        case "where":
                        case WHERE:
                            source = ast.left.value;
                            var length_1 = source.length;
                            var result = [];
                            for (var i = 0; i < length_1; i++) {
                                var item = binding.member(source, i);
                                var scope = new Scope(binding, [item, context]);
                                var b = ast.right.compiled.execute(binding, scope);
                                if (b)
                                    result.push(item);
                            }
                            ast.value = result;
                            break;
                        default:
                            var left = ast.left.value;
                            var right = ast.right.value;
                            ast.value = binding.app(ast.op, [right, left]);
                            break;
                    }
                    break;
                case APP:
                    var args = void 0;
                    var length_2 = ast.args.length;
                    for (var i_1 = 0; i_1 < length_2; i_1++) {
                        var arg = ast.args[i_1].value;
                        if (arg === void 0)
                            return arg;
                        if (!args)
                            args = [arg];
                        else
                            args.push(arg);
                    }
                    var fun = ast.fun.value;
                    if (fun === void 0) {
                        console.error("could not resolve expression, " + JSON.stringify(ast.fun));
                        return void 0;
                    }
                    else
                        ast.value = binding.app(fun.valueOf(), args);
                    break;
                default:
                    throw Error("unsupported ast type " + ast.type);
            }
            if (ast.value === void 0)
                return void 0;
        }
        return this.ast.value;
    };
    Expression.compile = function (ast) {
        var queue = [];
        Expression.compileAst(ast, queue);
        return new Expression(ast, queue);
    };
    Expression.compileAst = function (ast, stack) {
        var compile = Expression.compileAst;
        if (typeof ast === "object") {
            switch (ast.type) {
                case IDENT:
                    switch (ast.name) {
                        case "null":
                            ast.type = CONST;
                            ast.value = null;
                            break;
                        case "true":
                            ast.type = CONST;
                            ast.value = true;
                            break;
                        case "false":
                            ast.type = CONST;
                            ast.value = false;
                            break;
                        case "no":
                        case "empty":
                            ast.type = CONST;
                            ast.value = empty;
                            break;
                        case "count":
                            ast.type = CONST;
                            ast.value = count;
                            break;
                        case "not":
                            ast.type = CONST;
                            ast.value = not;
                            break;
                        case "or":
                            ast.type = CONST;
                            ast.value = or;
                            break;
                        default:
                            stack.push(ast);
                            break;
                    }
                    break;
                case QUERY:
                    stack.push(ast);
                    compile(ast.source, stack);
                    break;
                case MEMBER:
                    stack.push(ast);
                    compile(ast.member, stack);
                    compile(ast.target, stack);
                    break;
                case AWAIT:
                    stack.push(ast);
                    compile(ast.expr, stack);
                    break;
                case RANGE:
                    stack.push(ast);
                    compile(ast.from, stack);
                    compile(ast.to, stack);
                    break;
                case CONST:
                    stack.push(ast);
                    break;
                case BINARY:
                    stack.push(ast);
                    switch (ast.op) {
                        case "->":
                        case "where":
                        case WHERE:
                            ast.right.compiled = Expression.compile(ast.right);
                            compile(ast.left, stack);
                            break;
                        default:
                            compile(ast.right, stack);
                            compile(ast.left, stack);
                            break;
                    }
                    break;
                case APP:
                    stack.push(ast);
                    compile(ast.fun, stack);
                    var length = ast.args.length;
                    for (var i = 0; i < length; i++) {
                        compile(ast.args[i], stack);
                    }
                    break;
                case LAMBDA:
                    debugger;
                    break;
                default:
                    throw Error("unsupported ast type " + ast.type);
            }
        }
    };
    return Expression;
}());
var Range = (function () {
    function Range(first, last) {
        this.first = first;
        this.last = last;
    }
    Range.prototype.map = function (fn) {
        var result = [], last = this.last;
        for (var i = this.first; i <= last; i++) {
            result.push(fn(i));
        }
        return result;
    };
    return Range;
}());
function compile(expr) {
    return Expression.compile(peg.parse(expr));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compile;
function parse(expr) {
    return peg.parse(expr);
}
exports.parse = parse;
var Scope = (function () {
    function Scope(visitor, contexts) {
        this.visitor = visitor;
        this.contexts = contexts;
    }
    Scope.prototype.get = function (name) {
        var visitor = this.visitor;
        var contexts = this.contexts;
        for (var i = 0; i < this.contexts.length; i++) {
            var value = visitor.member(contexts[i], name);
            if (value !== void 0)
                return value;
        }
        return void 0;
    };
    return Scope;
}());
exports.Scope = Scope;
exports.TOKENS = { WHERE: WHERE, QUERY: QUERY, IDENT: IDENT, MEMBER: MEMBER, APP: APP, SELECT: SELECT, CONST: CONST, RANGE: RANGE, BINARY: BINARY, AWAIT: AWAIT, PIPE: PIPE, COMPOSE: COMPOSE };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWFBLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVqQyxlQUFlLElBQUk7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVELGFBQWEsS0FBSztJQUNkLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNsQixDQUFDO0FBRUQsWUFBWSxDQUFDLEVBQUUsQ0FBQztJQUNaLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7QUFDakMsQ0FBQztBQUVELGVBQWUsSUFBSTtJQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3ZCLENBQUM7QUFHRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDZixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDWixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDZixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBR2hCO0lBQ0ksb0JBQW1CLEdBQUcsRUFBVSxLQUFZO1FBQXpCLFFBQUcsR0FBSCxHQUFHLENBQUE7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFPO0lB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QUNqRSxDQUFDO0lBRUQsbUJBQUcsR0FBSCxVQUFJLElBQVk7UUFDWixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzNCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQztnQkFDakIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFDTCxZQUFDO0FBQUQsQ0FBQyxBQWZELElBZUM7QUFmWSxzQkFBSztBQWlCUCxRQUFBLE1BQU0sR0FBRyxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLElBQUksTUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIElBc3RWaXNpdG9yIHtcclxuICAgIHdoZXJlKHNvdXJjZSwgcHJlZGljYXRlKTtcclxuICAgIHNlbGVjdChzb3VyY2UsIHNlbGVjdG9yKTtcclxuICAgIHF1ZXJ5KHBhcmFtLCBzb3VyY2UpO1xyXG4gICAgbWVtYmVyKHRhcmdldCwgbmFtZSk7XHJcbiAgICBhcHAoZnVuLCBhcmdzOiBhbnlbXSk7XHJcbiAgICBleHRlbmQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTtcclxuICAgIGF3YWl0KG9ic2VydmFibGUpO1xyXG4gICAgY29uc3QodmFsdWUpO1xyXG59XHJcblxyXG5kZWNsYXJlIGZ1bmN0aW9uIHJlcXVpcmUobW9kdWxlOiBzdHJpbmcpO1xyXG5cclxudmFyIHBlZyA9IHJlcXVpcmUoXCIuL3F1ZXJ5LnBlZ1wiKTtcclxuXHJcbmZ1bmN0aW9uIGVtcHR5KGxpc3QpIHtcclxuICAgIHJldHVybiBsaXN0Lmxlbmd0aCA9PT0gMDtcclxufVxyXG5cclxuZnVuY3Rpb24gbm90KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gIXZhbHVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvcih4LCB5KSB7XHJcbiAgICByZXR1cm4geCB8fCB5ID8gdHJ1ZSA6IGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb3VudChsaXN0KSB7XHJcbiAgICByZXR1cm4gbGlzdC5sZW5ndGg7XHJcbn1cclxuXHJcbi8vIFJlU2hhcnBlciBkaXNhYmxlIEluY29uc2lzdGVudE5hbWluZ1xyXG52YXIgV0hFUkUgPSAxO1xyXG52YXIgUVVFUlkgPSAyO1xyXG52YXIgSURFTlQgPSAzO1xyXG52YXIgTUVNQkVSID0gNDtcclxudmFyIEFQUCA9IDU7XHJcbnZhciBTRUxFQ1QgPSA2O1xyXG52YXIgQ09OU1QgPSA3O1xyXG52YXIgUkFOR0UgPSA4O1xyXG52YXIgQklOQVJZID0gOTtcclxudmFyIEFXQUlUID0gMTA7XHJcbnZhciBQSVBFID0gMTE7XHJcbnZhciBDT01QT1NFID0gMTI7XHJcbnZhciBMQU1CREEgPSAxMztcclxuLy8gUmVTaGFycGVyIHJlc3RvcmUgSW5jb25zaXN0ZW50TmFtaW5nXHJcblxyXG5jbGFzcyBFeHByZXNzaW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBhc3QsIHByaXZhdGUgc3RhY2s6IGFueVtdKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZXhlY3V0ZShiaW5kaW5nOiBJQXN0VmlzaXRvciwgY29udGV4dHM6IGFueSkge1xyXG4gICAgICAgIHZhciB7IHN0YWNrIH0gPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgY29udGV4dCA9IEFycmF5LmlzQXJyYXkoY29udGV4dHMpID8gbmV3IFNjb3BlKGJpbmRpbmcsIGNvbnRleHRzKSA6IGNvbnRleHRzO1xyXG5cclxuICAgICAgICBsZXQgaWR4ID0gc3RhY2subGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpZHgtLSkge1xyXG4gICAgICAgICAgICB2YXIgYXN0ID0gc3RhY2tbaWR4XTtcclxuICAgICAgICAgICAgc3dpdGNoIChhc3QudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBJREVOVDpcclxuICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSBiaW5kaW5nLm1lbWJlcihjb250ZXh0LCBhc3QubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFFVRVJZOlxyXG4gICAgICAgICAgICAgICAgICAgIGFzdC52YWx1ZSA9IGJpbmRpbmcucXVlcnkoYXN0LnBhcmFtLCBhc3Quc291cmNlLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgQ09OU1Q6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1FTUJFUjpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYXN0LnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGFzdC5tZW1iZXIudmFsdWUgfHwgYXN0Lm1lbWJlcjtcclxuICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSBiaW5kaW5nLm1lbWJlcih0YXJnZXQsIG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBBV0FJVDpcclxuICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSBiaW5kaW5nLmF3YWl0KGFzdC5leHByLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgUkFOR0U6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpcnN0ID0gYXN0LmZyb20udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3QgPSBhc3QudG8udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0ID09PSB2b2lkIDAgfHwgbGFzdCA9PT0gdm9pZCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzdC52YWx1ZSA9IG5ldyBSYW5nZShmaXJzdCwgbGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEJJTkFSWTpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoYXN0Lm9wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCItPlwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlID0gYXN0LmxlZnQudmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdm9pZCAwIHx8ICFzb3VyY2UudmFsdWVPZigpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnZhbHVlID0gYXN0LnJpZ2h0LmNvbXBpbGVkLmV4ZWN1dGUoYmluZGluZywgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndoZXJlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgV0hFUkU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBhc3QubGVmdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gYmluZGluZy5tZW1iZXIoc291cmNlLCBpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NvcGUgPSBuZXcgU2NvcGUoYmluZGluZywgW2l0ZW0sIGNvbnRleHRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IGFzdC5yaWdodC5jb21waWxlZC5leGVjdXRlKGJpbmRpbmcsIHNjb3BlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsZWZ0ID0gYXN0LmxlZnQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmlnaHQgPSBhc3QucmlnaHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSBiaW5kaW5nLmFwcChhc3Qub3AsIFtyaWdodCwgbGVmdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBBUFA6XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFyZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxlbmd0aCA9IGFzdC5hcmdzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmcgPSBhc3QuYXJnc1tpXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZyA9PT0gdm9pZCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmdzKSBhcmdzID0gW2FyZ107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgYXJncy5wdXNoKGFyZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmdW4gPSBhc3QuZnVuLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmdW4gPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiY291bGQgbm90IHJlc29sdmUgZXhwcmVzc2lvbiwgXCIgKyBKU09OLnN0cmluZ2lmeShhc3QuZnVuKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzdC52YWx1ZSA9IGJpbmRpbmcuYXBwKGZ1bi52YWx1ZU9mKCksIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcInVuc3VwcG9ydGVkIGFzdCB0eXBlIFwiICsgYXN0LnR5cGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYXN0LnZhbHVlID09PSB2b2lkIDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXN0LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjb21waWxlKGFzdCkge1xyXG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xyXG4gICAgICAgIEV4cHJlc3Npb24uY29tcGlsZUFzdChhc3QsIHF1ZXVlKTtcclxuICAgICAgICByZXR1cm4gbmV3IEV4cHJlc3Npb24oYXN0LCBxdWV1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNvbXBpbGVBc3QoYXN0LCBzdGFjazogYW55W10pIHtcclxuICAgICAgICBjb25zdCBjb21waWxlID0gRXhwcmVzc2lvbi5jb21waWxlQXN0O1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXN0ID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoYXN0LnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgSURFTlQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChhc3QubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibnVsbFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnR5cGUgPSBDT05TVDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRydWVcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC50eXBlID0gQ09OU1Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmYWxzZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnR5cGUgPSBDT05TVDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJub1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZW1wdHlcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC50eXBlID0gQ09OU1Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSBlbXB0eTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY291bnRcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC50eXBlID0gQ09OU1Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudmFsdWUgPSBjb3VudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibm90XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudHlwZSA9IENPTlNUO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnZhbHVlID0gbm90O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvclwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnR5cGUgPSBDT05TVDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC52YWx1ZSA9IG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFFVRVJZOlxyXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goYXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBjb21waWxlKGFzdC5zb3VyY2UsIHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTUVNQkVSOlxyXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goYXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBjb21waWxlKGFzdC5tZW1iZXIsIHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBjb21waWxlKGFzdC50YXJnZXQsIHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgQVdBSVQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChhc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGUoYXN0LmV4cHIsIHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdmlzaXRvci5hd2FpdChhY2NlcHQoYXN0LmV4cHIsIHZpc2l0b3IsIGNvbnRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgUkFOR0U6XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sucHVzaChhc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGUoYXN0LmZyb20sIHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICBjb21waWxlKGFzdC50bywgc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBDT05TVDpcclxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEJJTkFSWTpcclxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChhc3Qub3ApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIi0+XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3aGVyZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFdIRVJFOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnJpZ2h0LmNvbXBpbGVkID0gRXhwcmVzc2lvbi5jb21waWxlKGFzdC5yaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlKGFzdC5sZWZ0LCBzdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGUoYXN0LnJpZ2h0LCBzdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlKGFzdC5sZWZ0LCBzdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEFQUDpcclxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZShhc3QuZnVuLCBzdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGFzdC5hcmdzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGUoYXN0LmFyZ3NbaV0sIHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExBTUJEQTpcclxuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJ1bnN1cHBvcnRlZCBhc3QgdHlwZSBcIiArIGFzdC50eXBlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUmFuZ2Uge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBmaXJzdCwgcHJpdmF0ZSBsYXN0KSB7XHJcbiAgICB9XHJcblxyXG4gICAgbWFwKGZuKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCBsYXN0ID0gdGhpcy5sYXN0O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmZpcnN0OyBpIDw9IGxhc3Q7IGkrKykge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChmbihpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbXBpbGUoZXhwcikge1xyXG4gICAgcmV0dXJuIEV4cHJlc3Npb24uY29tcGlsZShwZWcucGFyc2UoZXhwcikpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoZXhwcikge1xyXG4gICAgcmV0dXJuIHBlZy5wYXJzZShleHByKTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNjb3BlIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdmlzaXRvcjogSUFzdFZpc2l0b3IsIHByaXZhdGUgY29udGV4dHM6IGFueVtdKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHZhciB2aXNpdG9yID0gdGhpcy52aXNpdG9yO1xyXG4gICAgICAgIHZhciBjb250ZXh0cyA9IHRoaXMuY29udGV4dHM7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZpc2l0b3IubWVtYmVyKGNvbnRleHRzW2ldLCBuYW1lKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB2b2lkIDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIFRPS0VOUyA9IHsgV0hFUkUsIFFVRVJZLCBJREVOVCwgTUVNQkVSLCBBUFAsIFNFTEVDVCwgQ09OU1QsIFJBTkdFLCBCSU5BUlksIEFXQUlULCBQSVBFLCBDT01QT1NFIH1cclxuIl19