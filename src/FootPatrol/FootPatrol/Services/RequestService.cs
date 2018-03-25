using System;
using System.Diagnostics;
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

        public static async Task<int> SendFootPatrolRequest(string name, string fromLocation, string toLocation, string additionalInfo)
        {

            FPRequest fpRequest = new FPRequest();
            fpRequest.name = name;
            fpRequest.from_location = fromLocation;
            fpRequest.to_location = toLocation;
            fpRequest.additional_info = additionalInfo;

            string json = JsonConvert.SerializeObject(fpRequest);
            StringContent httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await Client.Instance.PostAsync("requests", httpContent);
                response.EnsureSuccessStatusCode();

                string responseJSON = await response.Content.ReadAsStringAsync();
                FPRequest fpResponse = JsonConvert.DeserializeObject<FPRequest>(responseJSON);

                int id = fpResponse.id;

                return id;

            } 
            catch (Exception e)
            {
                Debug.WriteLine("{0} Exception caught.", e);
                throw e;
            }

        }

        public static async Task DeleteFootPatrolRequest(int id)
        {

            try
            {
                HttpResponseMessage response = await Client.Instance.DeleteAsync("requests/" + id.ToString());
                response.EnsureSuccessStatusCode();

            } 
            catch (Exception e)
            {
                Debug.WriteLine("{0} Exception caught.", e);
                throw e;
            }

        }

    }

}