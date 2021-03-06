﻿using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Xania.Graphs
{
    public static class GraphQueryableExtensions
    {
        private static MethodInfo s_Drop_TSource_1;
        public static MethodInfo Drop_TSource_1<TSource>() =>
            (s_Drop_TSource_1 ??
             (s_Drop_TSource_1 = new Func<IQueryable<TSource>, int>(Drop).GetMethodInfo().GetGenericMethodDefinition()))
            .MakeGenericMethod(typeof(TSource));

        public static int Drop<TSource>(this IQueryable<TSource> source)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));
            return source.Provider.Execute<int>(
                Expression.Call(
                    null,
                    Drop_TSource_1<TSource>(),
                    source.Expression
                    // Expression.Quote(predicate)
                ));
        }
    }
}