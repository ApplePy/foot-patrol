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

        public static async Task<int> SendFootPatrolRequest(string name, string currentLocation, string destination)
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
                FPRequest fpResponse = JsonConvert.DeserializeObject<FPRequest>(responseJSON);

                int id = (int) fpRequest.id;

                return id;

            } catch (Exception e)
            {
                //throw new e;
            }

        }

        public static async Task CancelFootPatrolRequest(int id)
        {

            try
            {
                HttpResponseMessage response = await Client.client.DeleteAsync($"api/v1/footpatrol/{id}");
                response.EnsureSuccessStatusCode();

            } catch (Exception e)
            {
                //throw new e;
                //Console.WriteLine("{0} Exception caught.", e);
            }

        }

    }

    public class FPRequest {
        public int? id;
        public string name;
        public string from_location;
        public string to_location;
        public string additional_info;
        public bool? archived;
        public string timestamp;
    }

}