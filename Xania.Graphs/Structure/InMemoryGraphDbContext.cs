﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.Remoting.Messaging;
using System.Runtime.Remoting.Proxies;
using System.Security.Permissions;
using System.Threading.Tasks;
using Xania.Graphs.Linq;
using Xania.Reflection;

namespace Xania.Graphs.Structure
{
    public class InMemoryGraphDbContext : IGraphDataContext
    {
        private readonly Graph _graph;

        public InMemoryGraphDbContext(params object[] models)
            : this(Graph.FromObject(models))
        {
        }

        public InMemoryGraphDbContext(Graph graph)
        {
            _graph = graph;
        }

        public Task<IEnumerable<object>> ExecuteAsync(GraphTraversal traversal, Type elementType)
        {
            Console.WriteLine(traversal);

            var q = new VertexQuery(_graph, Expression.Constant(_graph.Vertices)).Execute(
                traversal,
                new (string name, IGraphQuery result)[0]
            );

            return Task.FromResult((IEnumerable<object>) q.Execute(elementType));
        }
    }

    public class GraphSON
    {
        public Dictionary<string, object> Properties { get; set; }
        public IQueryable<Edge> Relations { get; set; }
        public string Id { get; set; }
    }

    internal class VertexQuery : IGraphQuery
    {
        private readonly Graph _graph;
        public Expression Expression { get; }

        public VertexQuery(Graph graph, Expression expr)
        {
            _graph = graph;
            Expression = expr;
        }

        public object Execute(Type elementType)
        {
            Expression<Func<Vertex, GraphSON>> propertiesExpr =
                v => new GraphSON
                {
                    Id = v.Id,
                    Properties = v.Properties.ToDictionary(p => p.Name, p => p.Value, StringComparer.InvariantCultureIgnoreCase),
                    Relations = _graph.Edges.Where(edge => edge.OutV == v.Id)
                };

            var selectMethod = QueryableHelper.Select_TSource_2(typeof(Vertex), typeof(GraphSON));

            var f = Expression.Lambda(Expression.Call(selectMethod, Expression, propertiesExpr)).Compile();
            var result = (IEnumerable<GraphSON>)f.DynamicInvoke();

            var list = new List<object>();

            foreach (var entry in result)
            {
                var valueFactories =
                    entry.Properties
                        .ToDictionary<KeyValuePair<string, object>, string, Func<Type, object>>(
                            e => e.Key,
                            e => t => e.Value.Convert(t),
                            StringComparer.InvariantCultureIgnoreCase
                        );
                valueFactories.Add("id", t => entry.Id.Convert(t));
                foreach(var edge in entry.Relations)
                    valueFactories.Add(edge.Label, t =>
                    {
                        if (t.IsEnumerable())
                        {
                            var itemType = t.GetItemType();
                            return new[] {Proxy(itemType, edge.InV)};
                        }
                        return Proxy(t, edge.InV);
                    });

                var entity = elementType.CreateInstance(valueFactories);
                list.Add(entity);
            }

            return list;

            //var f = Expression.Lambda<Func<IQueryable<Vertex>>>(Expression).Compile();
            //return f().Select(v => v.ToClrType(elementType, _graph));
        }

        private static object Proxy(Type modelType, object targetId)
        {
            var relModelProperties = TypeDescriptor.GetProperties(modelType)
                .OfType<PropertyDescriptor>()
                .ToDictionary(e => e.Name, StringComparer.InvariantCultureIgnoreCase);
            var relIdProperty = relModelProperties.ContainsKey("Id") ? relModelProperties["Id"] : null;

            var id = relIdProperty == null ? null : targetId.Convert(relIdProperty?.PropertyType);

            return new ShallowProxy(modelType, id).GetTransparentProxy();
        }

        public static Expression GetVertextExpression(Type elementType)
        {
            var vertexParam = Expression.Parameter(typeof(Vertex));

            return Expression.New(elementType);
        }

        public IStepQuery Next(Type sourceType, IStep step)
        {
            if (step is V vertex)
            {
                return new FilterStep<Vertex>(_graph,
                    x => x.Label.Equals(vertex.Label, StringComparison.InvariantCultureIgnoreCase));
            }

            if (step is Has has)
            {
                return new FilterStep<Vertex>(_graph, GetPropertyPredicate(has.Property, has.CompareStep));
            }

            if (step is Where where)
            {
                return new FilterStep<Vertex>(_graph,
                    GetVertexPredicate(@where.Predicate, new(string name, Expression result)[0]));
            }

            if (step is Out @out)
            {
                return new SelectManyStep(_graph, GetOutExpression(@out));
            }

            if (step is Project project)
            {
                var param = Expression.Parameter(typeof(Vertex));
                var listInit = GetProjectionExpression(param, project);
                return new SelectStep(_graph, Expression.Lambda(listInit, param));
            }

            if (step is Values values)
            {
                Expression<Action<Vertex>> query =
                    // .Select(p => p.Value).FirstOrDefault()
                    v => v.Properties.Where(p => p.Name.Equals(values.Name))
                        .Select(p => p.Value.Convert(step.Type));

                var param = Expression.Parameter(typeof(Object));
                var selectExpr = Expression.Call(
                    EnumerableHelper.Select_TSource_2(typeof(Object), step.Type),
                    query.Body,
                    Expression.Lambda(Expression.Convert(param, step.Type), param)
                );

                var firstMethod = EnumerableHelper.FirstOrDefault(step.Type);
                return new SelectStep(_graph,
                    Expression.Lambda(Expression.Call(firstMethod, selectExpr), query.Parameters));
            }

            throw new NotImplementedException($"VertextQuery.Execute {step.GetType()}");
        }

        private Expression GetProjectionExpression(Expression param, Project project)
        {
            var addMethod = typeof(Dictionary<string, object>).GetMethod("Add");

            var bindings = project.Dict.Select(
                kvp =>
                {
                    var expr = GetExpression(param, kvp.Value, new(string name, Expression result)[0]);

                    return Expression.ElementInit(
                        addMethod,
                        Expression.Constant(kvp.Key),
                        Expression.Convert(expr, typeof(object))
                    );
                });

            return Expression.ListInit(
                Expression.New(typeof(Dictionary<string, object>)),
                bindings
            );
        }

        private Expression<Func<Vertex, bool>> GetVertexPredicate(GraphTraversal traversal,
            IEnumerable<(string name, Expression result)> mappings)
        {
            ParameterExpression param = Expression.Parameter(typeof(Vertex));
            var body = GetExpression(param, traversal, mappings);

            if (body.Type.IsEnumerable())
            {
                var itemType = body.Type.GetItemType();
                var anyMethod = QueryableHelper.Any_TSource_1(itemType);
                var any = Expression.Call(anyMethod, body);

                return Expression.Lambda<Func<Vertex, bool>>(any, param);
            }

            return Expression.Lambda<Func<Vertex, bool>>(body, param);
        }

        private Expression GetExpression(Expression param, GraphTraversal traversal,
            IEnumerable<(string name, Expression result)> mappings)
        {
            var body = traversal.Steps.Aggregate((input: param, mappings: mappings), (__, step) =>
            {
                if (step is Context)
                    return __;

                var (x, m) = __;

                if (step is Out o)
                {
                    if (x.Type != typeof(Vertex))
                        throw new NotSupportedException();

                    var q = GetOutExpression(o);

                    return (ReplaceVisitor.VisitAndConvert(q.Body, q.Parameters[0], x), m);
                }

                if (step is Values values)
                {
                    Expression<Func<Vertex, object>> mx = v => ValuesQuery.GetMember(v, values.Name, values.Type);
                    if (x.Type == typeof(Vertex))
                    {
                        return (ReplaceVisitor.VisitAndConvert(mx.Body, mx.Parameters[0], x), m);
                    }
                    else
                    {
                        var selectMethod = QueryableHelper.Select_TSource_2<Vertex, object>();
                        return (Expression.Call(selectMethod, x, mx), m);
                    }
                }

                if (step is Has has)
                {
                    Expression<Func<Vertex, bool>> p = GetPropertyPredicate(has.Property, has.CompareStep);
                    var whereMethod = QueryableHelper.Where_TSource_1<Vertex>();
                    return (Expression.Call(whereMethod, x, p), m);
                }

                if (step is Select select)
                {
                    return (m.Select(select.Label), m);
                }

                if (step is Project project)
                {
                    return (GetProjectionExpression(x, project), m);
                }

                throw new NotImplementedException(step.GetType().ToString());
            });

            return body.input;
        }

        private Expression<Func<Vertex, IEnumerable<Vertex>>> GetOutExpression(Out @out)
        {
            return v =>
                from edge in _graph.Edges
                where edge.OutV.Equals(v.Id, StringComparison.InvariantCultureIgnoreCase) &&
                      edge.Label.Equals(@out.EdgeLabel, StringComparison.InvariantCultureIgnoreCase)
                join vertex in _graph.Vertices on edge.InV equals vertex.Id
                select vertex;
        }

        private Expression<Func<Vertex, bool>> GetPropertyPredicate(string propertyName, IStep compareStep)
        {
            if (compareStep is Eq eq)
                if (eq.Value is Const cons)
                {
                    if (propertyName.Equals("id", StringComparison.InvariantCultureIgnoreCase))
                        return v => v.Id.Equals(cons.Value);
                    else
                        return v => v.Properties.Any(p =>
                            p.Name.Equals(propertyName, StringComparison.InvariantCultureIgnoreCase) &&
                            p.Value.Equals(cons.Value));
                }

            throw new NotImplementedException();
        }
    }

    internal class ValuesStep : IStepQuery
    {
        public IGraphQuery Query(Expression sourceExpr)
        {
            throw new NotImplementedException();
        }
    }

    internal class SelectStep : IStepQuery
    {
        private readonly Graph _graph;
        private readonly LambdaExpression _selectorExpr;

        public SelectStep(Graph graph, LambdaExpression selectorExpr)
        {
            _graph = graph;
            _selectorExpr = selectorExpr;
        }

        public IGraphQuery Query(Expression sourceExpr)
        {
            var sourceType = sourceExpr.Type.GetItemType();
            var selectMethod = QueryableHelper.Select_TSource_2(sourceType, _selectorExpr.Body.Type);
            var anoExpr = Expression.Call(selectMethod, sourceExpr, _selectorExpr);

            return new AnonymousQuery(_graph, anoExpr);
        }
    }

    internal class MemberStep : IStepQuery
    {
        private readonly Graph _graph;
        private readonly LambdaExpression _selectorExpr;

        public MemberStep(Graph graph, LambdaExpression selectorExpr)
        {
            _graph = graph;
            _selectorExpr = selectorExpr;
        }

        public IGraphQuery Query(Expression sourceExpr)
        {
            var sourceType = _selectorExpr.Parameters[0].Type;
            var resultType = _selectorExpr.Body.Type.GetItemType();
            var manyMethod = QueryableHelper.SelectMany_TSource_2(sourceType, resultType);

            var body = ToEnumerable(_selectorExpr.Body);

            var many = Expression.Call(manyMethod, sourceExpr, Expression.Lambda(body, _selectorExpr.Parameters));
            return new AnonymousQuery(_graph, many);
        }

        private Expression ToEnumerable(Expression expr)
        {
            var enumerableType = typeof(IEnumerable<>).MapFrom(expr.Type);
            if (enumerableType == expr.Type)
                return expr;

            return Expression.Convert(expr, enumerableType);
        }
    }

    internal class SelectManyStep : IStepQuery
    {
        private readonly Graph _graph;
        private readonly LambdaExpression _selectorExpr;

        public SelectManyStep(Graph graph, LambdaExpression selectorExpr)
        {
            _graph = graph;
            _selectorExpr = selectorExpr;
        }

        public IGraphQuery Query(Expression sourceExpr)
        {
            var sourceType = _selectorExpr.Parameters[0].Type;
            var resultType = _selectorExpr.Body.Type.GetItemType();
            var manyMethod = QueryableHelper.SelectMany_TSource_2(sourceType, resultType);

            var body = ToEnumerable(_selectorExpr.Body);

            var many = Expression.Call(manyMethod, sourceExpr, Expression.Lambda(body, _selectorExpr.Parameters));
            return new VertexQuery(_graph, many);
        }

        private Expression ToEnumerable(Expression expr)
        {
            var enumerableType = typeof(IEnumerable<>).MapFrom(expr.Type);
            if (enumerableType == expr.Type)
                return expr;

            return Expression.Convert(expr, enumerableType);
        }
    }

    internal class FilterStep<TElement> : IStepQuery
    {
        private readonly Graph _graph;
        private readonly Expression<Func<TElement, bool>> _predicate;

        public FilterStep(Graph graph, Expression<Func<TElement, bool>> predicate)
        {
            _graph = graph;
            _predicate = predicate;
        }

        public IGraphQuery Query(Expression sourceExpr)
        {
            var whereMethod = QueryableHelper.Where_TSource_1<TElement>();
            return new VertexQuery(_graph, Expression.Call(whereMethod, sourceExpr, _predicate));
        }
    }

    internal class ValuesQuery
    {
        public static object GetMember(object v, string name, Type memberType)
        {
            if (v is Vertex vtx && name.Equals("id", StringComparison.InvariantCultureIgnoreCase))
            {
                return vtx.Id;
            }

            if (v is Vertex obj)
            {
                return obj.Properties.Where(p => p.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase))
                    .Select(p => p.Value).FirstOrDefault();
            }

            throw new NotImplementedException();
        }
    }

    internal class AnonymousQuery : IGraphQuery
    {
        private readonly Graph _graph;
        private readonly Expression _sourceExpr;

        public AnonymousQuery(Graph graph, Expression sourceExpr)
        {
            _graph = graph;
            _sourceExpr = sourceExpr;
        }

        public object Execute(Type elementType)
        {
            var result = Expression.Lambda(_sourceExpr).Compile();
            var list = new List<object>();
            foreach (var o in (IEnumerable<object>) result.DynamicInvoke())
            {
                list.Add(o.Convert(elementType));
            }

            return list;
        }

        public IStepQuery Next(Type sourceType, IStep step)
        {
            if (step is Out o)
            {
                var property = TypeDescriptor.GetProperties(sourceType)
                    .OfType<PropertyDescriptor>()
                    .First(p => p.Name.Equals(o.EdgeLabel, StringComparison.InvariantCultureIgnoreCase));

                var param = Expression.Parameter(sourceType);
                var propertyExpr = Expression.Property(param, property.Name);

                return new MemberStep(_graph, Expression.Lambda(propertyExpr, param));
            }

            throw new NotSupportedException($"{step.GetType()}");
        }

        public Expression Expression => _sourceExpr;
    }

    public interface IGraphQuery
    {
        object Execute(Type elementType);
        IStepQuery Next(Type sourceType, IStep step);
        Expression Expression { get; }
    }

    public interface IStepQuery
    {
        IGraphQuery Query(Expression sourceExpr);
    }

    internal class ShallowProxy : RealProxy
    {
        private readonly object _id;

        [PermissionSet(SecurityAction.LinkDemand)]
        public ShallowProxy(Type myType, object id) : base(myType)
        {
            _id = id;
        }

        [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.Infrastructure)]
        public override IMessage Invoke(IMessage myIMessage)
        {
            if (myIMessage is IMethodCallMessage)
            {
                var methodCall = (IMethodCallMessage)myIMessage;
                if (methodCall.MethodName.Equals("GetType"))
                    return new ReturnMessage(typeof(ShallowProxy), null, 0, methodCall.LogicalCallContext, methodCall);
                if (methodCall.MethodName.Equals("get_Id", StringComparison.OrdinalIgnoreCase))
                    return new ReturnMessage(_id, null, 0, methodCall.LogicalCallContext, methodCall);
                if (methodCall.MethodName.Equals("ToString"))
                    return new ReturnMessage(ToString(), null, 0, methodCall.LogicalCallContext, methodCall);
            }

            throw new InvalidOperationException("Cannot call shallow object");
        }

        public override string ToString()
        {
            return $"{{Id: {_id}}}";
        }
    }
}