using System;
using System.Net.Http;
using System.Net.Http.Headers;

namespace FootPatrol
{
    public static class Client
    {

        public static HttpClient client = new HttpClient();

        static Client()
        {
            client.BaseAddress = new Uri("http://staging.capstone.incode.ca");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }
}
