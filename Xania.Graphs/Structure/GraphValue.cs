﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Xml;
using Xania.Graphs.Linq;
using Xania.Reflection;

namespace Xania.Graphs.Structure
{
    /// <summary>
    /// Discriminated Union
    /// </summary>
    public abstract class GraphValue : IExecuteResult
    {
        public static GraphPrimitive<int> Int(int value)
        {
            return new GraphPrimitive<int>(value);
        }

        public abstract object ToClType();

        public abstract IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings);

        public virtual object ToClrType(Type elementType, Graph graph)
        {
            return ToClType().Convert(elementType);
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }
    }

    public class ListResult : IExecuteResult
    {
        public IEnumerable<IExecuteResult> Items { get; }
        private readonly Graph _graph;

        public ListResult(IEnumerable<IExecuteResult> items, Graph graph)
        {
            Items = items;
            _graph = graph;
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            if (step is V || step is Has || step is Where)
            {
                var items = Items.Where(itemResult =>
                    Equals(itemResult.Execute(step, mappings).ToClrType(typeof(bool), _graph), true)
                );
                return new ListResult(items, _graph);
            }


            if (step is Values values)
            {
                var items = Items.Select(itemResult => itemResult.Execute(step, mappings));
                return new ListResult(items, _graph);
            }

            if (step is Out @out)
            {
                var r = Items.SelectMany(from =>
                {
                    var result = from.Execute(step, mappings);
                    if (result is VerticesResult verticesResult)
                        return verticesResult.Vertices;
                    if (result is GraphList list)
                        return list.Items;
                    if (result == null)
                        return Enumerable.Empty<IExecuteResult>();

                    throw new NotSupportedException();
                });
                return new ListResult(r, _graph);
            }

            if (step is Project project)
            {
                var properties = Items.Select(vertex => new ObjectResult(
                    project.Dict.ToDictionary(kvp => kvp.Key, kvp => vertex.Execute(kvp.Value, mappings))
                ));

                return new ListResult(properties, _graph);
            }

            throw new NotImplementedException($"Execute {step.GetType()}");
        }

        public object ToClrType(Type elementType, Graph graph)
        {
            // var result = list.Items.Select(e => e.ToClrType(elementType, _graph));

            return Items.Select(e => e.ToClrType(elementType, graph));
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }
    }

    public class VertexResult : IExecuteResult
    {
        private readonly Vertex _vertex;
        private readonly Graph _graph;

        public VertexResult(Vertex vertex, Graph graph)
        {
            _vertex = vertex;
            _graph = graph;
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            return Execute(_vertex, step, _graph, mappings);
        }

        public static IExecuteResult Execute(Vertex vertex, IStep step, Graph graph, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            if (step is Values values)
            {
                if (values.Name.Equals("id", StringComparison.InvariantCultureIgnoreCase))
                {
                    return new ConsResult(vertex.Id);
                }

                var par = Expression.Parameter(typeof(Vertex));
                var lambda = Expression.Lambda<Func<Vertex, GraphValue>>(GetExpression(par, step, graph), par).Compile();
                return lambda(vertex);
            }

            if (step is Out @out)
            {
                var r = graph.Out(vertex, @out.EdgeLabel);
                return new VerticesResult(r, graph);
            }

            if (step is V v)
            {
                var equals = vertex.Label.Equals(v.Label, StringComparison.InvariantCultureIgnoreCase);
                return new ConsResult(equals);
            }

            if (step is Has)
            {
                var par = Expression.Parameter(typeof(Vertex));
                var lambda = Expression.Lambda<Func<Vertex, bool>>(GetExpression(par, step, graph), par).Compile();
                return new ConsResult(lambda(vertex));
            }

            if (step is Where where)
            {
                var parameter = Expression.Parameter(typeof(Vertex));
                var predicateExpr = GetExpression(parameter, where.Predicate, graph);

                var lambda = Expression.Lambda<Func<Vertex, bool>>(predicateExpr, parameter).Compile();
                return new ConsResult(lambda(vertex));
            }

            if (step is Project project)
            {
                var projection = project.Dict.ToDictionary(kvp => kvp.Key, kvp => vertex.Execute(kvp.Value, mappings));
                return new ObjectResult(projection);
            }

            throw new NotImplementedException($"VertexResult.Execute {step}");
        }

        internal static Expression GetExpression(Expression source, IStep step, Graph graph)
        {
            if (step is Has has)
            {
                if (has.Property.Equals("id", StringComparison.InvariantCultureIgnoreCase))
                {
                    var idExpr = Expression.Property(source, nameof(Vertex.Id));
                    return GetExpression(idExpr, has.CompareStep, graph);
                }
                else
                {
                    var propertiesExpr = Expression.Property(source, "Properties");

                    var propertyParam = Expression.Parameter(typeof(Property));

                    var propertyNameExpr =
                        Expression.Property(propertyParam, typeof(Property), nameof(Property.Name));
                    var equalName = Expression.Equal(propertyNameExpr, Expression.Constant(has.Property));

                    var propertyValueExpr =
                        Expression.Property(propertyParam, typeof(Property), nameof(Property.Value));
                    var valueExpr =
                        Expression.Call(propertyValueExpr, nameof(GraphValue.ToClType), new Type[0]);


                    var valueCompareExpr = GetExpression(valueExpr, has.CompareStep, graph);

                    var propertyLambda = Expression.Lambda(Expression.And(equalName, valueCompareExpr), propertyParam);

                    var anyMethod = VerticesResult.Any_TSource_1<Property>();
                    return Expression.Call(null, anyMethod, propertiesExpr, propertyLambda);
                }
            }

            if (step is Eq eq)
            {
                Func<Object, Object, bool> equals = Equals;
                return Expression.Call(null, equals.Method, source, GetExpression(null, eq.Value, graph));
                // return Expression.Equal(source, GetExpression(null, eq.Steps.Single()));
            }

            if (step is Const cons)
                return Expression.Constant(cons.Value);

            if (step is Context)
                return source;

            if (step is Out O)
            {
                Expression<Func<Vertex, IEnumerable<Vertex>>> q = from => graph.Out(from, O.EdgeLabel);
                return new ReplaceVisitor(q.Parameters[0], source).VisitAndConvert(q.Body);
            }

            if (step is Values values)
            {
                if (values.Name.Equals("id", StringComparison.InvariantCultureIgnoreCase))
                    return Expression.Property(source, nameof(Vertex.Id));

                Expression<Func<Vertex, object>> q = from =>
                    from.Properties
                        .Where(e => e.Name.Equals(values.Name, StringComparison.InvariantCultureIgnoreCase))
                        .Select(e => e.Value).SingleOrDefault();

                return new ReplaceVisitor(q.Parameters[0], source).VisitAndConvert(q.Body);
            }

            throw new NotImplementedException($"GetExpression {step.GetType()}");
        }

        private static Expression GetExpression(Expression source, GraphTraversal traversal, Graph graph)
        {
            return traversal.Steps.Aggregate(source, (src, st) =>
            {
                if (src.Type == typeof(Vertex))
                    return GetExpression(src, st, graph);

                var vertexParam = Expression.Parameter(typeof(Vertex));
                var stepExpr = GetExpression(vertexParam, st, graph);

                if (stepExpr.Type == typeof(IEnumerable<Vertex>))
                {
                    var selectorLambda = Expression.Lambda<Func<Vertex, IEnumerable<Vertex>>>(stepExpr, vertexParam);
                    var selectManyMethod = VerticesResult.SelectMany_TSource_2<Vertex, Vertex>();
                    return Expression.Call(null, selectManyMethod, src, selectorLambda);
                }

                if (stepExpr.Type == typeof(string))
                {
                    var selectorLambda = Expression.Lambda(stepExpr, vertexParam);
                    var selectMethod = VerticesResult.Select_TSource_2<Vertex, string>();
                    return Expression.Call(null, selectMethod, src, selectorLambda);
                }

                if (stepExpr.Type == typeof(bool))
                {
                    var selectorLambda = Expression.Lambda(stepExpr, vertexParam);
                    var anyMethod = VerticesResult.Any_TSource_1<Vertex>();
                    return Expression.Call(null, anyMethod, src, selectorLambda);
                }

                throw new NotImplementedException();
            });
        }

        public object ToClrType(Type elementType, Graph graph)
        {
            var cache = new Dictionary<Vertex, object>();
            var dict = _graph.ToObject(_vertex, elementType, cache);
            return dict;
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }
    }

    public class ConsResult : IExecuteResult
    {
        public object Value { get; }

        public ConsResult(object value)
        {
            Value = value;
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            throw new NotImplementedException();
        }

        public object ToClrType(Type elementType, Graph graph)
        {
            return Value.Convert(elementType);
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }
    }

    public class ValueResult : IExecuteResult
    {
        private readonly GraphValue _value;

        public ValueResult(GraphValue value, Graph graph)
        {
            _value = value;
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            throw new NotImplementedException();
        }

        public object ToClrType(Type elementType, Graph graph)
        {
            return _value.ToClType().Convert(elementType);
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }
    }

    public class VerticesResult : IExecuteResult
    {
        public IEnumerable<Vertex> Vertices { get; }
        private readonly Graph _graph;

        public VerticesResult(IEnumerable<Vertex> vertices, Graph graph)
        {
            Vertices = vertices;
            _graph = graph;
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            if (step is V V)
            {
                var r = Vertices.Where(vertex =>
                    vertex.Label.Equals(V.Label, StringComparison.InvariantCultureIgnoreCase));
                return new VerticesResult(r, _graph);
            }

            if (step is Values values)
            {
                var x = Vertices.Select(vtx => VertexResult.Execute(vtx, step, _graph, mappings));

                return new ListResult(x, _graph);
            }

            if (step is Out O)
            {
                var r = Vertices.SelectMany(from => _graph.Out(from, O.EdgeLabel));
                return new VerticesResult(r, _graph);
            }

            if (step is Has has)
            {
                var par = Expression.Parameter(typeof(Vertex));
                var lambda = Expression.Lambda<Func<Vertex, bool>>(GetExpression(par, has), par).Compile();
                var r = Vertices.Where(lambda);
                return new VerticesResult(r, _graph);
            }

            //if (step is Project project)
            //{
            //    var parameter = Expression.Parameter(typeof(Vertex));

            //    var properties = Vertices.Select(
            //        vertex =>
            //        {
            //            var xr = new VertexResult(vertex, _graph);
            //            return project.Dict.ToDictionary(kvp => kvp.Key, kvp => xr.Execute(kvp.Value, ctx));
            //        });

            //    return new ObjectsResult(properties);
            //}

            if (step is Where where)
            {
                var parameter = Expression.Parameter(typeof(Vertex));
                var predicateExpr = GetExpression(parameter, where.Predicate);

                var lambda = Expression.Lambda<Func<Vertex, bool>>(predicateExpr, parameter).Compile();
                return new VerticesResult(Vertices.Where(lambda), _graph);
            }

            throw new NotImplementedException($"Execute {step.GetType()}");
        }

        private Expression GetExpression(Expression source, GraphTraversal traversal)
        {
            return traversal.Steps.Aggregate(source, (src, st) =>
            {
                if (src.Type == typeof(Vertex))
                    return GetExpression(src, st);

                var vertexParam = Expression.Parameter(typeof(Vertex));
                var stepExpr = GetExpression(vertexParam, st);

                if (stepExpr.Type == typeof(IEnumerable<Vertex>))
                {
                    var selectorLambda = Expression.Lambda<Func<Vertex, IEnumerable<Vertex>>>(stepExpr, vertexParam);
                    var selectManyMethod = SelectMany_TSource_2<Vertex, Vertex>();
                    return Expression.Call(null, selectManyMethod, src, selectorLambda);
                }

                if (stepExpr.Type == typeof(string))
                {
                    var selectorLambda = Expression.Lambda(stepExpr, vertexParam);
                    var selectMethod = Select_TSource_2<Vertex, string>();
                    return Expression.Call(null, selectMethod, src, selectorLambda);
                }

                if (stepExpr.Type == typeof(bool))
                {
                    var selectorLambda = Expression.Lambda(stepExpr, vertexParam);
                    var anyMethod = Any_TSource_1<Vertex>();
                    return Expression.Call(null, anyMethod, src, selectorLambda);
                }

                throw new NotImplementedException();
            });
        }

        private Expression GetExpression(Expression source, IStep step)
        {
            if (step is Has has)
            {
                if (has.Property.Equals("id", StringComparison.InvariantCultureIgnoreCase))
                {
                    var idExpr = Expression.Property(source, nameof(Vertex.Id));
                    return GetExpression(idExpr, has.CompareStep);
                }
                else
                {
                    var propertiesExpr = Expression.Property(source, "Properties");

                    var propertyParam = Expression.Parameter(typeof(Property));

                    var propertyNameExpr =
                        Expression.Property(propertyParam, typeof(Property), nameof(Property.Name));
                    var equalName = Expression.Equal(propertyNameExpr, Expression.Constant(has.Property));

                    var propertyValueExpr =
                        Expression.Property(propertyParam, typeof(Property), nameof(Property.Value));
                    var valueExpr =
                        Expression.Call(propertyValueExpr, nameof(GraphValue.ToClType), new Type[0]);


                    var valueCompareExpr = GetExpression(valueExpr, has.CompareStep);

                    var propertyLambda = Expression.Lambda(Expression.And(equalName, valueCompareExpr), propertyParam);

                    var anyMethod = Any_TSource_1<Property>();
                    return Expression.Call(null, anyMethod, propertiesExpr, propertyLambda);
                }
            }

            if (step is Eq eq)
            {
                Func<Object, Object, bool> equals = Equals;
                return Expression.Call(null, equals.Method, source, GetExpression(null, eq.Value));
                // return Expression.Equal(source, GetExpression(null, eq.Steps.Single()));
            }

            if (step is Const cons)
                return Expression.Constant(cons.Value);

            if (step is Context)
                return source;

            if (step is Out O)
            {
                Expression<Func<Vertex, IEnumerable<Vertex>>> q = from => _graph.Out(from, O.EdgeLabel);
                return new ReplaceVisitor(q.Parameters[0], source).VisitAndConvert(q.Body);
            }

            if (step is Values values)
            {
                if (values.Name.Equals("id", StringComparison.InvariantCultureIgnoreCase))
                    return Expression.Property(source, nameof(Vertex.Id));

                Expression<Func<Vertex, Object>> q = from =>
                    from.Properties
                        .Where(e => e.Name.Equals(values.Name, StringComparison.InvariantCultureIgnoreCase))
                        .Select(e => e.Value).SingleOrDefault();

                return new ReplaceVisitor(q.Parameters[0], source).VisitAndConvert(q.Body);
            }

            throw new NotImplementedException($"GetExpression {step.GetType()}");
        }

        public object ToClrType(Type modelType, Graph graph)
        {
            var cache = new Dictionary<Vertex, object>();
            if (modelType.IsEnumerable())
            {
                var elementType = modelType.GetItemType();
                var items = Vertices.Select(v => _graph.ToObject(v, elementType, cache)).ToArray();
                return modelType.CreateCollection(items);
            }
            else
            {
                return Vertices.Select(v => _graph.ToObject(v, modelType, cache)).SingleOrDefault();
            }
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }

        private static MethodInfo s_SelectMany_TSource_2;
        public static MethodInfo SelectMany_TSource_2<TSource, TResult>() =>
            (s_SelectMany_TSource_2 ??
             (s_SelectMany_TSource_2 = new Func<IEnumerable<TSource>, Func<TSource, IEnumerable<TResult>>, IEnumerable<TResult>>(Enumerable.SelectMany).GetMethodInfo().GetGenericMethodDefinition()))
            .MakeGenericMethod(typeof(TSource), typeof(TResult));

        private static MethodInfo s_Select_TSource_2;
        public static MethodInfo Select_TSource_2<TSource, TResult>() =>
            (s_Select_TSource_2 ??
             (s_Select_TSource_2 = new Func<IEnumerable<TSource>, Func<TSource, TResult>, IEnumerable<TResult>>(Enumerable.Select).GetMethodInfo().GetGenericMethodDefinition()))
            .MakeGenericMethod(typeof(TSource), typeof(TResult));

        private static MethodInfo s_Any_TSource_1;
        public static MethodInfo Any_TSource_1<TSource>() =>
            (s_Any_TSource_1 ??
             (s_Any_TSource_1 = new Func<IEnumerable<TSource>, Func<TSource, bool>, bool>(Enumerable.Any)
                 .GetMethodInfo().GetGenericMethodDefinition()))
            .MakeGenericMethod(typeof(TSource));

    }

    internal class ObjectResult : IExecuteResult
    {
        public Dictionary<string, IExecuteResult> Properties { get; }

        public ObjectResult(Dictionary<string, IExecuteResult> properties)
        {
            Properties = properties;
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            throw new NotImplementedException();
        }

        public object ToClrType(Type elementType, Graph graph)
        {
            return elementType.CreateInstance(GetFactories(Properties, graph));
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }

        public IDictionary<string, Func<Type, object>> GetFactories(IDictionary<string, IExecuteResult> properties, Graph graph)
        {
            return
                properties
                    .ToDictionary<KeyValuePair<string, IExecuteResult>, string, Func<Type, object>>(
                        e => e.Key,
                        e => t => Convert2(t, e.Value.ToClrType(t, graph)),
                        StringComparer.InvariantCultureIgnoreCase
                    );
        }

        private object Convert2(Type type, object obj)
        {
            if (!type.IsEnumerable())
                if (obj is IEnumerable<object> enumerable)
                    return enumerable.SingleOrDefault();

            return obj;
        }
    }

    internal class ValuesResult : IExecuteResult
    {
        public IEnumerable<object> Values { get; }

        public ValuesResult(IEnumerable<object> values)
        {
            Values = values.ToArray();
        }

        public IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            if (step is Out o)
            {
                var r = Values.OfType<IDictionary<string, object>>().Where(e => e.ContainsKey(o.EdgeLabel))
                    .Select(e => e[o.EdgeLabel]);
                return new ValuesResult(r);
            }

            throw new NotImplementedException("Execute ");
        }

        public object ToClrType(Type elementType, Graph graph)
        {
            return Values.Select(v => v.Convert(elementType));
        }

        public Expression ToExpression()
        {
            throw new NotImplementedException();
        }
    }

    class ReplaceVisitor : ExpressionVisitor
    {
        private readonly Expression _source;
        private readonly Expression _target;

        public ReplaceVisitor(Expression source, Expression target)
        {
            if (source.Type != target.Type)
                throw new InvalidOperationException();

            _source = source;
            _target = target;
        }

        public static Expression VisitAndConvert(Expression body, Expression needle, Expression value)
        {
            return new ReplaceVisitor(needle, value).VisitAndConvert(body);
        }

        internal Expression VisitAndConvert(Expression root)
        {
            return Visit(root);
        }

        public override Expression Visit(Expression node)
        {
            if (node == _source)
                return _target;

            return base.Visit(node);
        }
    }

    public static class ExecuteResultExtensions
    {
        public static IExecuteResult Execute(this IExecuteResult input, GraphTraversal traversal, IEnumerable<(string name, IExecuteResult result)> mappings)
        {
            var (result, _) = traversal.Steps.Aggregate((input:input, mappings:mappings), (__, step) =>
            {
                var (r, m) = __;
                if (step is Alias a)
                    return (r, m.Prepend((a.Value, r)));

                if (step is Context)
                    return __;

                if (step is Select select)
                {
                    return (m.Select(select.Label), m);
                }

                return (r.Execute(step, m), m);
            });

            return result;
        }

        public static TResult Select<TResult>(this IEnumerable<(string name, TResult result)> mappings, string name)
        {
            return mappings.Where(e => e.name.Equals(name, StringComparison.InvariantCultureIgnoreCase))
                .Select(e => e.result).First();
        }
    }

    public interface IExecuteResult
    {
        IExecuteResult Execute(IStep step, IEnumerable<(string name, IExecuteResult result)> mappings);
        object ToClrType(Type elementType, Graph graph);
        Expression ToExpression();
    }
}