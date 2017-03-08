﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Xania.DataAccess
{
    public class TransientObjectStore<TModel> : IObjectStore<TModel>
        where TModel : new()
    {
        private static readonly List<TModel> Items;

        static TransientObjectStore()
        {
            Items = new List<TModel>();
        }

        public IEnumerator<TModel> GetEnumerator()
        {
            return Items.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public TModel Create()
        {
            return new TModel();
        }

        public Task<TModel> AddAsync(TModel model)
        {
            Items.Add(model);
            return Task.FromResult(model);
        }

        public Task DeleteAsync(TModel model)
        {
            Items.Remove(model);
            return Task.CompletedTask;
        }

        public Task SaveAsync(Expression<Func<TModel, bool>> condition, TModel newItem)
        {
            var existingItem = Items.SingleOrDefault(condition.Compile());
            if (existingItem != null)
            {
                Items.Remove(existingItem);
            }
            Items.Add(newItem);
            return Task.CompletedTask;
        }
    }
}