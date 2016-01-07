using MongoDB.Bson;
using MongoDB.Driver;
using ServiceTemplate.Extensions;
using ServiceTemplate.Models;
using ServiceTemplate.Token;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Runtime.Caching;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

/*
 *
 *  DİKKAT !!!
 * ----------------------------------
 * 
 * Bu dosyanın yönetimi sadece BARIŞ'ta. Üzerinde değişiklik yapma !
 * 
 * ----------------------------------
 * 
 */

namespace ServiceTemplate.Actions
{
    /// <summary>
    /// Kullanıcının login/logout session operasyonunu yönetir.
    /// 
    /// Şimdilik içinde DeviceID (Mobile) desteği yok. Sonradan rahatlıkla eklenebilir.
    /// Daha sonradan bu sistem içine "istek sayacı" eklenebilir. Bu sayede token çalınmalarının da önüne geçilebilir.
    /// </summary>
    public static class SessionManagement
    {
        // BURADAKİ YAPI TAMAMEN TEK BİLGİSAYAR ÜZERİNDE KULLANILMAK ÜZERE DİZAYN EDİLMİŞTİR.
        // EĞER YATAY GENİŞLEME SAĞLANACAK İSE MEMEORYCACHE DOĞRU ÇÖZÜM DEĞİL.
        // ONUN YERİNE DB SORGULARI İLE İLERLEMEK ÇOK DAHA DOĞRU BİR ÇÖZÜM.

        // Login olan kullanıcıları tekrar tekrar DB üzerinden sorgulamayalım diye
        private static MemoryCache _userCache = new MemoryCache("userCache");

        /// <summary>
        /// Kullanıcının login olup yeni bir token üretmesini sağlar.
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        public static async Task<LoginOutput> Login(LoginInput info)
        {
            // Get users collection
            var users = App.UsersTable;

            // Query user
            var filter = Builders<BsonDocument>.Filter.Eq("usr", info.usr);
            var user = await users.Find(filter).FirstOrDefaultAsync();

            // Kullanıcı bulunamadı
            if (user == null)
                return LoginOutput.UserNotFound();
            
            // Şifreyi al
            var password = user["pwd"].AsString;

            // Şifresi hatalı: beyan edilen ile aynı değil
            if (password != info.pwd)
                return LoginOutput.InvalidPassword();

            // App hatalı
            if (!user["apps"].AsBsonDocument.Contains(info.appName))
                return LoginOutput.InvalidApp();

            // App var ve okuduk
            var app = user["apps"][info.appName].AsBsonDocument;

            // Remove expires tokens: Expire etmiş olanlar temizlendi.
            // Elimizde temiz token listesi var.
            var tokens = removeExpiredTokens(app);

            var allowRecycle = app["allowRecycle"].AsBoolean;
            var totalCapacity = app["totalToken"].AsInt32;

            // Token yaratmak için yeterli kapasite yok.
            if (!allowRecycle && totalCapacity == tokens.Count)
                return LoginOutput.TooManyUsersLoggedIn();

            // Token yarat
            var username = user["usr"].AsString;
            var roles = user["roles"].AsString.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            var claims = getClaims(user["claims"].AsBsonDocument);
            var dbName = claims.GetValueFromClaim(CONSTS.CLAIMS.DATABASE);

            // Demek ki sisteme veritabanı kaydedilmemiş.
            if (dbName == null)
                dbName = ConfigurationManager.AppSettings["database.name"];

            // Kullanıcıyı yarat
            var token = UserToken.GenerateNew(username, roles, claims, TimeSpan.FromMinutes(info.slidingExpiration), info.appName, dbName);

            // Kapasite dolu ise eskilerden birisini sileceksin.
            if (tokens.Count == totalCapacity)
            {
                removeOldestToken(tokens);
            }

            // Yeni token eklensin
            tokens.Add(new BsonDocument()
            {
                { "token", token.Token },
                { "createdAt", DateTime.Now },
                { "slideExpireInMinutes", (int)token.SlidingExpiration.TotalMinutes }
            });

            int loginCount = 1;

            if (user.Contains("loginCount"))
            {
                loginCount = user["loginCount"].AsInt32 + 1;
            }

            user["loginCount"] = new BsonInt32(loginCount);
            user["lastLoginAt"] = new BsonDateTime(DateTime.Now);

            await users.ReplaceOneAsync(filter, user);

            // add to cache
            _userCache.Add(new CacheItem(token.Token, token), new CacheItemPolicy()
                {
                    SlidingExpiration = token.SlidingExpiration,
                    RemovedCallback = CacheEntryRemovedCallback
                });

            return LoginOutput.OK(token);
        }

        /// <summary>
        /// MemoryCache içinden bir kullanıcı silindiği zaman otomatik olarak CachaManager tarafından çağırılır.
        /// Veritabanı içinden gerekli token bilgilerini siler. Gerek SlidingExpire gerek AbsoluteExpire durumlarında çağırılabilir.
        /// </summary>
        /// <param name="arguments"></param>
        private static void CacheEntryRemovedCallback(CacheEntryRemovedArguments arguments)
        {
            var item = arguments.CacheItem;

            var token = item.Key;
            var userToken = (UserToken)item.Value;

            var users = App.UsersTable;

            var filter = Builders<BsonDocument>.Filter.Eq("usr", userToken.User.Identity.Name);
            var user = users.Find(filter).FirstAsync();

            if (user.Result == null) return;

            var tokens = user.Result["apps"][userToken.FromApp]["tokens"].AsBsonArray;

            for (int i = tokens.Count - 1; i >= 0; i--)
            {
                var doc = tokens[i].AsBsonDocument;

                if (doc["token"].AsString == token)
                {
                    tokens.RemoveAt(i);

                    // Update database
                    var f = Builders<BsonDocument>.Filter.Eq("usr", userToken.User.Identity.Name);
                    users.ReplaceOneAsync(f, user.Result);

                    // işimiz bitti.
                    return;
                }
            }
        }

        /// <summary>
        /// Bu method kullanıcının her login olma isteğinde çağırılan bir method'dur.
        /// Kullanım süresi dolmuş ama bir şekilde veritabanından silinememiş token'ları temizler.
        /// </summary>
        /// <param name="app"></param>
        /// <returns></returns>
        private static BsonArray removeExpiredTokens(BsonDocument app)
        {
            var tokens = app["tokens"].AsBsonArray;
            var absoluteExpireInMinutes = app["expireInMinutes"].AsInt32;

            // Expire etmiş olan token'ları temizle!
            for (int i = tokens.Count - 1; i >= 0; i--)
            {
                var doc = tokens[i].AsBsonDocument;

                var createdAt = doc["createdAt"].ToUniversalTime();
                var willBeExpired = createdAt + TimeSpan.FromMinutes(absoluteExpireInMinutes);

                // Demek ki token expire etmiş
                if (DateTime.Now >= willBeExpired)
                {
                    tokens.RemoveAt(i);
                }
            }
            return tokens;
        }

        /// <summary>
        /// Kullanıcı kayıtlarından en eski token'ı seçer ve siler.
        /// </summary>
        /// <param name="tokens"></param>
        /// <returns></returns>
        private static int removeOldestToken(BsonArray tokens)
        {
            int oldest = -1;
            DateTime? oldOne = null;

            // Expire etmiş olan token'ları temizle!
            for (int i = tokens.Count - 1; i >= 0; i--)
            {
                var doc = tokens[i].AsBsonDocument;

                var createdAt = doc["createdAt"].ToUniversalTime();

                if (oldOne == null)
                {
                    oldOne = createdAt;
                    oldest = i;
                }

                if (createdAt < oldOne)
                {
                    oldOne = createdAt;
                    oldest = i;
                }
            }

            tokens.RemoveAt(oldest);

            return oldest;
        }

        /// <summary>
        /// Kullanıcının kayıtlarından Claim bilgilerini derler ve bir liste olarak verir.
        /// </summary>
        /// <param name="bsonDocument"></param>
        /// <returns></returns>
        private static IEnumerable<Claim> getClaims(BsonDocument bsonDocument)
        {
            var list = new List<Claim>();

            foreach (var item in bsonDocument.Elements)
            {
                list.Add(new Claim(item.Name, item.Value.AsString));
            }

            return list;
        }

        /// <summary>
        /// Kullanıcıyı logout eder. Çalışabilmesi için "x-gm-token" header içinde gelmelidir.
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        public static LogoutOutput Logout(LogoutInput info)
        {
            var t = HttpContext.Current.Request.Headers[CONSTS.HTTP_HEADERS.TOKEN];

            if (t == null)
                return new LogoutOutput();

            _userCache.Remove(t);

            return new LogoutOutput();
        }

        /// <summary>
        /// Uygulama tarafından kullanılır. MemoryCache içinden ilgili token'ın kime ait olduğunu söyler.
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        internal static UserToken getUserToken(string token)
        {
            return _userCache.Get(token) as UserToken;
        }

#if DEBUG
        internal static void AddDebugPurposeUserToken()
        {
            var token = UserToken.GenerateNew("baris", new string[] { "admin", "users" }, new Claim[] { }, TimeSpan.FromMinutes(60), "web", "test");

            _userCache.Add(new CacheItem("baris", token), new CacheItemPolicy()
            {
                SlidingExpiration = token.SlidingExpiration
            });
        }
#endif

    }
}
