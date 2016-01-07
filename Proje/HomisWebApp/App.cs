using MongoDB.Bson;
using MongoDB.Driver;
using ServiceTemplate.Token;
using System;
using System.Configuration;
using System.Globalization;
using System.Web;

namespace ServiceTemplate
{
    /// <summary>
    /// Uygulamaya özel genel değişkenler burada saklanır.
    /// Buraya yeni birşey eklenecek ise özellikle THREAD-SAFE olmasına dikkat etmek gerekli !!!
    /// </summary>
    public static class App
    {
        private static readonly CultureInfo _culture;

        private static readonly MongoClient _mongoClient;

        /// <summary>
        /// Global MongoClient
        /// </summary>
        public static MongoClient MongoClient
        {
            get { return App._mongoClient; }
        } 

        private static IMongoDatabase _gmDatabase;
        private static IMongoCollection<BsonDocument> _gmUsers;
        private static IMongoCollection<BsonDocument> _restaurants;


        static App()
        {
            // TODO: Burada DefaultCulture TÜRKÇE olarak ayarlanıyor. Belki bu ayarlanabilir olmalı.
            _culture = new CultureInfo("tr-TR");

            // Default Mongo Connection
            _mongoClient = new MongoClient(ConfigurationManager.AppSettings["database.url"]);

            // GM Database
            _gmDatabase = _mongoClient.GetDatabase(ConfigurationManager.AppSettings["database.name"]);

            // GM Users
            _gmUsers = _gmDatabase.GetCollection<BsonDocument>(CONSTS.TABLES.USERS);
        }

        /// <summary>
        /// Bu uygulama için tanımlanmı CultureInfo değeridir.
        /// </summary>
        public static CultureInfo AppCultureInfo { get { return _culture; } }

        /// <summary>
        /// Geomarket veritabanı
        /// </summary>
        public static IMongoDatabase MainDatabase { get { return _gmDatabase; } }

        /// <summary>
        /// Uygulamanın kullanıcılar tablosu
        /// </summary>
        public static IMongoCollection<BsonDocument> UsersTable { get { return _gmUsers; } }

        /// <summary>
        /// Aktif kullanıcının veritabanını verir.
        /// </summary>
        public static IMongoDatabase GetCurrentUsersDatabase
        {
            get
            {
                // Aktif kullanıcıyı al
                var user = HttpContext.Current.User as UserPrincipal;

                if (user == null)
                    throw new InvalidOperationException("There is no user found in the current context");

                // Kullanıcının veritabanından MAPCATALOG
                return user.DB;
            }
        }
    }
}
