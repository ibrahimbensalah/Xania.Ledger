﻿using System;
using Xania.Graphs.Elements;
using Xania.ObjectMapper;

namespace Xania.Graphs.Linq
{
    internal class GraphMappingResolver : IMappingResolver
    {
        private readonly Graph _graph;

        public GraphMappingResolver(Graph graph)
        {
            _graph = graph;
        }

        public IOption<IMappable> Resolve(object obj)
        {
            if (obj is Vertex vertex)
                return new MappableVertex(_graph, vertex).Some();
            if (obj is GraphPrimitive prim) 
                return new DefaultMappable(prim.Value).Some();
            if (obj is GraphObject value)
                return new MappableObject(value).Some();
            if (obj is GraphList list)
                return new DefaultMappable(list.Items).Some();

            if (obj is GraphValue)
                throw new NotImplementedException($"Resolve {obj.GetType()}");

            return Option<IMappable>.None();
        }
    }
}