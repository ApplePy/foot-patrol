using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace FootPatrol
{
    public static class RequestService
    {

        public static async Task SendFootPatrolRequest(string name, string currentLocation, string destination)
        {

            FPRequest fpRequest = new FPRequest();
            fpRequest.name = name;
            fpRequest.from_location = currentLocation;
            fpRequest.to_location = destination;

            string json = JsonConvert.SerializeObject(fpRequest);
            StringContent httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await Client.client.PostAsync("api/v1/requests", httpContent);
                response.EnsureSuccessStatusCode();

                var responseJSON = await response.Content.ReadAsStringAsync();
                FPResponse fpResponse = JsonConvert.DeserializeObject<FPResponse>(responseJSON);

                //Check here for the request ID.  Use this id to cancel the request.

            } catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
            }

        }

        public static async Task CancelFootPatrolRequest(string name, string currentLocation, string destination)
        {

            string json = string.Format("{'name': {0}, 'currentLocation': {1}, 'destination': {2}}", name, currentLocation, destination);
            StringContent httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.DeleteAsync("api/footpatrol");
                response.EnsureSuccessStatusCode();
            } catch (Exception e)
            {
                //Console.WriteLine("{0} Exception caught.", e);
            }

        }

    }

    public class FPRequest {
        public string name;
        public string from_location;
        public string to_location;
        public string additional_info;
    }

    public class FPResponse {
        public int id;
        public string name;
        public string from_location;
        public string to_location;
        public string additional_info;
        public bool archived;
        public string timestamp;
    }
}