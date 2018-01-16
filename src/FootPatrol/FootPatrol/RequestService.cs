﻿using System;
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
                HttpResponseMessage response = await Client.Instance.PostAsync("api/v1/requests", httpContent);
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
                Debug.WriteLine("api/v1/requests/" + id.ToString());
                HttpResponseMessage response = await Client.Instance.DeleteAsync("api/v1/requests/" + id.ToString());
                response.EnsureSuccessStatusCode();

            } 
            catch (Exception e)
            {
                Debug.WriteLine("{0} Exception caught.", e);
                throw e;
            }

        }

    }

    public class FPRequest {
        public int id;
        public string name;
        public string from_location;
        public string to_location;
        public string additional_info;
        public bool? archived;
        public string timestamp;
    }

}