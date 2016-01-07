namespace ServiceTemplate
{
    public static class CONSTS
    {
        public static class TABLES
        {
            /// <summary>
            /// MASTER veritabanında kullanıcılar ile ilgili bilgileri saklayan tablonun adı
            /// </summary>
            public const string USERS = "users";

            /// <summary>
            /// Veritabanında kullanıcı tablolarının yapılarını saklayan özel tablonun adı
            /// </summary>
            public const string MAPCATALOG = "MAPCATALOG";
        }

        public static class MIMES
        {
            /// <summary>
            /// JSON Mime-type
            /// </summary>
            public const string JSON = "application/json";

            /// <summary>
            /// Bson Mime-type
            /// </summary>
            public const string BSON = "application/bson";

            /// <summary>
            /// Zip Mime-type
            /// </summary>
            public const string ZIP = "application/zip";
        }

        public static class HTTP_HEADERS
        {
            /// <summary>
            /// Uygulamanın login/kullanıcı bilgisini takip edebilmek için HTTP-HEADER içindeki anahtar
            /// </summary>
            public const string TOKEN = "x-token";

        }

        public static class CLAIMS
        {
            /// <summary>
            /// Kullanıcının hangi veritabanına bağlanacağı bilgisi
            /// </summary>
            public const string DATABASE = "x-database";
        }
    }
}
