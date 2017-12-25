﻿namespace Xania.Graphs
{
    public static class GraphContextExtensions
    {
        public static GraphQueryable<TModel> Query<TModel>(this IGraphDataContext client)
        {
            return new GraphQueryable<TModel>(new GraphQueryProvider(client));
        }
    }
}
