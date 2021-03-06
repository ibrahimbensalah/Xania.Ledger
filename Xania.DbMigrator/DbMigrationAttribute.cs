﻿using System;

namespace Xania.DbMigrator
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class DbMigrationAttribute : Attribute
    {
        public string Id { get; }

        public DbMigrationAttribute(string id)
        {
            Id = id;
        }
    }
}
