﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace Xania.DataAccess
{
    internal static class ModelDescriptor
    {
        public static IEnumerable<PropertyInfo> KeyProperties(this Type modelType)
        {
            var allProperties = TypeDescriptor.GetProperties(modelType).OfType<PropertyInfo>().ToArray();
            var keyProperties =
                allProperties.Where(prop => prop.GetCustomAttribute<KeyAttribute>() != null).ToArray();

            if (keyProperties.Any())
                return keyProperties;

            var idProperty = allProperties.FirstOrDefault(p => p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase));

            if (idProperty != null)
                return new[] { idProperty };

            var modelIdProperty = allProperties.FirstOrDefault(p => p.Name.Equals(modelType.Name + "Id", StringComparison.OrdinalIgnoreCase));

            if (modelIdProperty != null)
                return new[] { modelIdProperty };

            return Enumerable.Empty<PropertyInfo>();
        }

        public static IEnumerable<object> Keys<TModel>(this TModel model)
        {
            var keyProperties = typeof(TModel).KeyProperties().ToArray();

            if (!keyProperties.Any())
                throw new InvalidOperationException("Model has no key properties");

            var keys = keyProperties.OrderBy(x => x.Name).Select(p => new
            {
                p.Name,
                Value = p.GetValue(model)
            }).ToArray();

            var nullKeys = keys.Where(k => k.Value == null);
            if (nullKeys.Any())
                throw new InvalidOperationException(string.Format("Key properties with null values: {0}", keys.Select(k=>k.Name)));

            return keys.Select(k => k.Value).ToArray();
        }
    }
}
