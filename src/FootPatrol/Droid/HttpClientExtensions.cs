using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace FootPatrol.Droid
{
    public static class HttpClientExtensions
    {
        public static async Task<HttpResponseMessage> PatchAsync(this HttpClient client, Uri requestUri, HttpContent iContent)
        {
            var method = new HttpMethod("PATCH");
            var req = new HttpRequestMessage(method, requestUri)
            {
                Content = iContent
            };

            HttpResponseMessage response = new HttpResponseMessage();

            try
            {
                response = await client.SendAsync(req);
            }

            catch (TaskCanceledException e)
            {
                System.Diagnostics.Debug.WriteLine("ERROR: " + e.ToString());
            }

            return response;
        }
    }
}
