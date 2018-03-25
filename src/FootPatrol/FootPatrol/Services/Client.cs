using System;
using System.Net.Http;
using System.Net.Http.Headers;

namespace FootPatrol
{
    // Requires Static HttpClient
    // https://aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/
    public static class Client
    {

        private static HttpClient instance = new HttpClient();
        public static HttpClient Instance
        {
            get
            {
                return instance;
            }
        }

        static Client()
        {
            instance.BaseAddress = new Uri("http://staging.capstone.incode.ca/api/v1/");
            instance.DefaultRequestHeaders.Accept.Clear();
            instance.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }
}
