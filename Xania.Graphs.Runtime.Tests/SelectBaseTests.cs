﻿using System;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.Remoting.Proxies;
using FluentAssertions;
using Newtonsoft.Json;
using NUnit.Framework;
using Xania.Graphs.Linq;
using Xania.Graphs.Elements;
using Xania.Invoice.Domain;

namespace Xania.Graphs.Runtime.Tests
{
    public abstract class SelectBaseTests
    {
        protected abstract IQueryable<Person> People { get; } // Data.Set<Person>();

        /// <summary>
        /// This example showing by the test is the single reason I decided to create my own Graph implementation
        /// HQ is a complex type which means we need to model the Person type as a Document met nested properties
        /// which is not supported by CosmosDb and I am not sure if this is commonly supported in other graph databases
        /// </summary>
        [Test]
        public void TraverseComplexTypeTest()
        {
            var lines = (
                from p in People
                where p.Id == 1
                from l in p.HQ.Lines
                select l
            ).ToArray();

            var line = lines.Should().ContainSingle().Subject;

            line.Value.Should().Be("Punter 315");
            line.Type.Should().Be(AddressType.Street);
        }

        [Test]
        public void NoFilter()
        {
            var friends =
                (from p in People
                 where p.Id == 1
                 from f in p.Friends
                 select f.Id).ToArray();
            // var friends = People.Where(e => e.Id == 1).SelectMany(e => e.Friends).Select(e => e.Id).ToArray();
            var person2 = People.Where(e => e.Id == 2).ToArray().Single();

            friends.Should().Contain(person2.Id);

            //var person3 = People.Where(e => e.Id == 3).ToArray().Single();
            //person3.Friends.Should().Contain(person2);
        }

        [Test]
        public void FilterById()
        {
            var persons =
                from p in People
                where p.Id == 1
                select p;
            var person = persons.ToArray().Should().ContainSingle().Subject;

            AssertIbrahim(person);
        }

        [Test]
        public void FilterByFirstName()
        {
            var array =
                from p in People
                where p.FirstName == "Ibrahim"
                select p;
            var person = array.ToArray().Should().ContainSingle().Subject;

            AssertIbrahim(person);
        }

        private static void AssertIbrahim(Person person)
        {
            person.Id.Should().Be(1);
            person.FirstName.Should().Be("Ibrahim");
            person.Friend.Should().NotBeNull();
            person.Enemy.Should().NotBeNull();
            person.Friends.Should().HaveCount(1);
        }

        [Test]
        public void FilterByFriend()
        {
            var persons =
                (from p in People
                where p.Friend.Id == 2
                select p).ToArray();

            var person = persons.Should().ContainSingle().Subject;
            Console.WriteLine(JsonConvert.SerializeObject(person));
            AssertIbrahim(person);

            //var g = TestData.GetPeople();

            //var q =
            //    from outV in g.Vertices
            //    where outV.Label.Equals("person", StringComparison.InvariantCultureIgnoreCase)
            //    join outE in g.Edges on outV.Id equals outE.OutV
            //    where outE.Label.Equals("friend", StringComparison.CurrentCultureIgnoreCase)
            //    join inV in g.Vertices on outE.InV equals inV.Id
            //    where inV.Label.Equals("person", StringComparison.InvariantCultureIgnoreCase)
            //    select inV;

            //var expression = q.Expression;

            //Console.WriteLine(JsonConvert.SerializeObject(q, Formatting.Indented));

        }

        [Test]
        public void SelectFriends()
        {
            var persons =
                from p in People
                where p.Id == 1
                from f in p.Friends
                select f;
            var ibrahimsFriend = persons.ToArray().Should().ContainSingle().Subject;
            ibrahimsFriend.Id.Should().Be(2);
        }

        [Test]
        public void SelectFriendOfFriends()
        {
            var persons =
                from p in People
                from f in p.Friends
                select f.Friend;
            Console.WriteLine(JsonConvert.SerializeObject(persons, Formatting.Indented));
        }

        [Test]
        public void SelectFriendOfFriendsOfFriends()
        {
            var friendOfDistantFriends =
                from p in People
                where p.Id == 3
                from f in p.Friends
                select f;

            var proxyJsonConverter = new ProxyJsonConverter();
            Console.WriteLine(JsonConvert.SerializeObject(friendOfDistantFriends, Formatting.Indented, proxyJsonConverter));
        }

        [Test]
        public void AnonymousType()
        {
            var anonType = new { a = 1, b = 2 }.GetType();
            anonType.CustomAttributes.Select(e => e.AttributeType).Should().Contain(typeof(CompilerGeneratedAttribute));
        }

        [Test]
        public void SelectEveryBody()
        {
            var everybody =
                from p in People
                select p;
            Console.WriteLine(JsonConvert.SerializeObject(everybody, Formatting.Indented));
        }

        [Test]
        public void SelectCustomColumns()
        {
            var view = (
                from p in People
                where p.Id == 1
                select new
                {
                    p.FirstName,
                    FriendId = p.Friend.Id
                }
            ).ToArray();

            var ibrahim = view.Should().ContainSingle().Subject;
            // ibrahim.FirstName.Should().Be("Ibrahim");
            ibrahim.FriendId.Should().Be(2);

            Console.WriteLine(JsonConvert.SerializeObject(view, Formatting.Indented));
        }

        [Test]
        public void SelectCustomResultContainingOneVertex()
        {
            var view = (
                from p in People
                where p.Id == 1
                select new
                {
                    p.Friend,
                    FriendId = p.Friend.Id
                }).ToArray();

            Console.WriteLine(JsonConvert.SerializeObject(view, Formatting.Indented));
            var ibrahim = view.Should().ContainSingle().Subject;
            ibrahim.FriendId.Should().Be(2);
            // ibrahim.Friend.Id.Should().Be(2);

        }

        [Test]
        public void SelectCustomResultContainingManyVertices()
        {
            var view = (
                from p in People
                where p.Id == 1
                select new
                {
                    p.Friends
                }).ToArray();

            var ibrahim = view.Should().ContainSingle().Subject;
            ibrahim.Friends.Should().ContainSingle().Which.Id.Should().Be(2);

            Console.WriteLine(JsonConvert.SerializeObject(view, Formatting.Indented));
        }

        [Test]
        public void SelectCustomResultWithNested()
        {
            var view = (
                from p in People
                where p.Id == 1
                select new
                {
                    Composite = new
                    {
                        Person = p
                    }
                }
            ).ToArray();

            var ibrahim = view.Should().ContainSingle().Subject.Composite.Person;
            AssertIbrahim(ibrahim);

            Console.WriteLine(JsonConvert.SerializeObject(view, Formatting.Indented));
        }

    }

    public class ProxyJsonConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteValue(value.ToString());
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof(RealProxy).IsAssignableFrom(objectType);
        }
    }
}
