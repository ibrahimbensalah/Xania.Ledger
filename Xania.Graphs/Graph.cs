﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using Xania.Reflection;

namespace Xania.Graphs
{
    public class Graph
    {
        public Collection<Vertex> Vertices { get; } = new Collection<Vertex>();
        public Collection<Relation> Relations { get; } = new Collection<Relation>();

        public static Graph FromObject(Object model)
        {
            return ConvertObject(model, model.GetType(), new Dictionary<object, ConvertResult>()).Graph;
        }

        private static ConvertResult ConvertObject(object value, Type valueType, IDictionary<object, ConvertResult> cache)
        {
            if (cache.TryGetValue(value, out var result))
                return result;

            if (valueType.IsPrimitive())
            {
                return ConvertResult.Primitve(new Tuple<string, object>(Guid.NewGuid().ToString(), value));
            }
            if (value is IEnumerable enumerable)
            {
                var elementType = GetElementType(valueType);
                if (elementType == null)
                    throw new InvalidOperationException($"Could not derive element type from '{valueType}'");

                if (elementType.IsPrimitive())
                {
                    var values = enumerable.OfType<object>()
                        .Select(e => new Tuple<string, object>(Guid.NewGuid().ToString(), e));
                    return ConvertResult.Primitve(values.ToArray());
                }
                return ConvertResult.List(enumerable.OfType<object>().Select(e => ConvertObject(e, e.GetType(), cache)));
            }

            var vertex = new Vertex(valueType.Name);
            var graph = new Graph();
            foreach (var prop in TypeDescriptor.GetProperties(value).OfType<PropertyDescriptor>())
            {
                var propValue = prop.GetValue(value);
                if (string.Equals(prop.Name, "id", StringComparison.InvariantCultureIgnoreCase))
                    vertex.Id = propValue?.ToString() ?? Guid.NewGuid().ToString();
                else if (propValue != null)
                {
                    var pair = ConvertObject(propValue, propValue.GetType(), cache);
                    pair.Merge(graph, vertex, prop.Name);
                }
            }
            graph.Vertices.Add(vertex);
            return ConvertResult.Object(vertex, graph);
        }

        private static Type GetElementType(Type enumerableType)
        {
            foreach (var i in enumerableType.GetInterfaces())
            {
                if (i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>))
                    return i.GenericTypeArguments[0];
            }
            return null;
        }

        public IEnumerable<TModel> ToObjects<TModel>() where TModel : new()
        {
            return ToObjects(typeof(TModel)).OfType<TModel>();
        }

        public IEnumerable ToObjects(Type modelType)
        {
            var cache = new Dictionary<Vertex, object>();

            //if (modelType.IsAnonymousType())
            //{
            //    foreach (var v in Anonymous)
            //        yield return ToObject(v, modelType, cache);
            //}
            //else

            var label = modelType.IsAnonymousType() ? null : modelType.Name.ToCamelCase();
            foreach (var vertex in Vertices.Where(e => string.Equals(e.Label, label)))
                yield return ToObject(vertex, modelType, cache);
        }

        //private object ToObject(JToken token, Type modelType, IDictionary<Vertex, object> cache)
        //{
        //    return token.ToObject(modelType);
        //}

        public Object ToObject(Vertex vertex, Type modelType, IDictionary<Vertex, object> cache)
        {
            if (cache.TryGetValue(vertex, out var model))
                return model;
            cache.Add(vertex, model = Activator.CreateInstance(modelType));

            var modelProperties = TypeDescriptor.GetProperties(model).OfType<PropertyDescriptor>()
                .ToDictionary(e => e.Name, StringComparer.InvariantCultureIgnoreCase);
            var idProperty = modelProperties.ContainsKey("Id") ? modelProperties["Id"] : null;
            idProperty?.SetValue(model, vertex.Id.Convert(idProperty.PropertyType));

            foreach (var p in vertex.Properties)
            {
                var values = p.Values.Select(e => e.Item2);
                if (!modelProperties.ContainsKey(p.Name))
                    continue;

                var modelProperty = modelProperties[p.Name];
                modelProperty.SetValue(model, values.Convert(modelProperty.PropertyType));
            }

            foreach (var rel in Relations.Where(e => string.Equals(e.SourceId, vertex.Id)))
            {
                var target = Vertices.SingleOrDefault(e => e.Id.Equals(rel.TargetId));
                var modelProperty = modelProperties[rel.Name];
                if (typeof(IEnumerable).IsAssignableFrom(modelProperty.PropertyType))
                {
                    var elementType = GetElementType(modelProperty.PropertyType);
                    if (target != null)
                        Add(modelProperty.GetValue(model), ToObject(target, elementType, cache), elementType);
                    //var item = target == null
                    //    ? Proxy(elementType, rel.TargetId)
                    //    : ToObject(target, elementType, cache);
                    //Add(modelProperty.GetValue(model), item, elementType);
                }
                else
                {
                    if (target != null)
                        modelProperty.SetValue(model, ToObject(target, modelProperty.PropertyType, cache));
                    //    Add(modelProperty.GetValue(model), ToObject(target, modelProperty.PropertyType, cache), elementType);
                    //var item = target == null
                    //    ? Proxy(modelProperty.PropertyType, rel.TargetId)
                    //    : ToObject(target, modelProperty.PropertyType, cache);
                    //modelProperty.SetValue(model, item);
                }
            }
            return model;
        }

        //private object Proxy(Type modelType, string targetId)
        //{
        //    var relModelProperties = TypeDescriptor.GetProperties(modelType)
        //        .OfType<PropertyDescriptor>()
        //        .ToDictionary(e => e.Name, StringComparer.InvariantCultureIgnoreCase);
        //    var relIdProperty = relModelProperties.ContainsKey("Id") ? relModelProperties["Id"] : null;
        //    return Proxy(modelType, Convert(targetId, relIdProperty?.PropertyType));
        //}

        //private object Proxy(Type proxyType, object id)
        //{
        //    if (typeof(MarshalByRefObject).IsAssignableFrom(proxyType) || proxyType.IsInterface)
        //        return new ShallowProxy(proxyType, id).GetTransparentProxy();
        //    return null;
        //}

        private void Add(object collection, object toObject, Type elementType)
        {
            var collectionType = TypeDescriptor.GetReflectionType(collection);
            var addMethod = collectionType.GetMethod("Add", new [] { elementType });
            if (addMethod == null)
                throw new Exception("Add method is not found");
            addMethod.Invoke(collection, new[] {toObject});
        }

        ///// <summary>
        ///// TODO 
        ///// </summary>
        ///// <param name="vertex"></param>
        ///// <returns></returns>
        //public JObject ToJson(Vertex vertex)
        //{
        //    if (vertex == null)
        //        return null;

        //    var o = new JObject {{"Id", vertex.Id}};
        //    foreach (var p in vertex.Properties)
        //    {
        //        var value = p.Values.Select(e => e.Item2).ToArray();
        //        o.Add(p.Name, JToken.FromObject(value));
        //    }
        //    foreach (var rel in Relations.Where(e => e.SourceId.Equals(vertex.Id)))
        //    {
        //        var target = ToJson(Vertices.SingleOrDefault(e => e.Id.Equals(rel.TargetId)));
        //        o.Add(rel.Name, target);
        //    }
        //    return o;
        //}
    }

    internal class PrimitiveResult : ConvertResult
    {
        public override void Merge(Graph graph, Vertex vertex, string propName)
        {
            vertex.Properties.Add(new Property(propName, this.Values));
        }

        public Tuple<string, object>[] Values { get; set; }
    }

    internal class ObjectResult : ConvertResult
    {
        public Vertex Vertex { get; set; }

        public override void Merge(Graph graph, Vertex vertex, string propName)
        {
            graph.Relations.Add(new Relation(vertex.Id, propName, Vertex.Id));
            foreach (var rel in Graph.Relations)
                graph.Relations.Add(rel);
            foreach (var childVertex in Graph.Vertices)
                graph.Vertices.Add(childVertex);
        }
    }

    internal abstract class ConvertResult
    {
        public Graph Graph { get; set; }
        public static ConvertResult None { get; set; } = new NoResult();

        public static ObjectResult Object(Vertex vertex, Graph graph)
        {
            return new ObjectResult
            {
                Graph = graph,
                Vertex = vertex
            };
        }

        public abstract void Merge(Graph graph, Vertex vertex, string propName);

        public static PrimitiveResult Primitve(params Tuple<string, object>[] values)
        {
            return new PrimitiveResult
            {
                Values = values
            };
        }

        public static ListResult List(IEnumerable<ConvertResult> list)
        {
            return new ListResult
            {
                Values = list
            };
        }
    }

    internal class ListResult : ConvertResult
    {
        public IEnumerable<ConvertResult> Values { get; set; }

        public override void Merge(Graph graph, Vertex vertex, string propName)
        {
            foreach (var item in Values)
            {
                item.Merge(graph, vertex, propName);
            }
        }
    }

    internal class NoResult : ConvertResult
    {
        public override void Merge(Graph graph, Vertex vertex, string propName)
        {
        }
    }

    public class TypeResolver : ITypeResolver
    {
        private readonly Type _modelType;

        public TypeResolver(Type modelType)
        {
            _modelType = modelType;
        }

        public object Resolve(string vertexLabel)
        {
            throw new NotImplementedException();
        }
    }

    internal interface ITypeResolver
    {
        object Resolve(string vertexLabel);
    }
}