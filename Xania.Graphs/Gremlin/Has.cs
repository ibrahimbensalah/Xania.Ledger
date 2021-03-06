﻿using System;

namespace Xania.Graphs.Gremlin
{
    public class Has : IStep
    {
        public string Property { get; }
        public IStep CompareStep { get; }

        public Has(string property, IStep compareStep)
        {
            Property = property;
            CompareStep = compareStep;
        }

        public override string ToString()
        {
            return $"has('{Property}', {CompareStep})";
        }

        public Type Type => typeof(bool);
    }
}