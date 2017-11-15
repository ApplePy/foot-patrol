using System;
using System.Net.Http;
using System.Net.Http.Headers;

namespace FootPatrol
{
    public static class Httpclient
    {

        public static HttpClient client = new HttpClient();

        static Httpclient()
        {
            client.BaseAddress = new Uri("http://localhost:55268/");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }
}
