using Android.Widget;
using Android.OS;
using Android.Views;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Runtime.Serialization;
using System.Diagnostics.Contracts;
using Android.App;

namespace FootPatrol.Droid
{
    
    public class PickUpActivity : Activity
    {
        [JsonProperty]
        public string name, from_location, to_location, additional_info;

        private int pickupID;

        public static PickUpActivity newInstance()
        {
            PickUpActivity pickUp = new PickUpActivity();
            return pickUp;
        }

        protected override void OnCreate(Bundle savedInstanceState)
        {
            
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.PickupLayout);
            Button requestButton = (Button)FindViewById(Resource.Id.button1);
            Button cancelButton = (Button)FindViewById(Resource.Id.button2);
            EditText userName = (EditText)FindViewById(Resource.Id.nameText);
            EditText fromLocation = (EditText)FindViewById(Resource.Id.locationText);
            EditText toLocation = (EditText)FindViewById(Resource.Id.destinationText);
            EditText addInfo = (EditText)FindViewById(Resource.Id.additionalInformationText);

            cancelButton.Enabled = false;

            requestButton.Click += async (sender, e) =>
            {
                //requestButton.Enabled = false;
                //cancelButton.Enabled = true;

                PickUpActivity pickup = new PickUpActivity();
                pickup.name = userName.Text;
                pickup.from_location = fromLocation.Text;
                pickup.to_location = toLocation.Text;
                pickup.additional_info = addInfo.Text;

                string json = JsonConvert.SerializeObject(pickup);
                Console.Out.WriteLine(json);

                HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");
                HttpClient client = new HttpClient();
                Uri customURI = new Uri("http://staging.capstone.incode.ca/api/v1/requests");
                HttpResponseMessage response = await client.PostAsync(customURI, content);
                try
                {
                    response.EnsureSuccessStatusCode();
                }

                catch (Exception error)
                {
                    System.Diagnostics.Debug.WriteLine("The exception is: " + error);
                }

                int status = (int)response.StatusCode;
                string statusLine;

                if (status == 200 || status == 201)
                {
                    System.Diagnostics.Debug.WriteLine("The status returned is correct!");
                    statusLine = await response.Content.ReadAsStringAsync();
                    PickUpActivity p = JsonConvert.DeserializeObject<PickUpActivity>(statusLine);
                    //System.Diagnostics.Debug.WriteLine(pickupID);
                    //System.Diagnostics.Debug.WriteLine(statusLine);
                }

                else
                {
                    System.Diagnostics.Debug.WriteLine("The status returned is: " + status);
                    statusLine = await response.Content.ReadAsStringAsync();
                    //System.Diagnostics.Debug.WriteLine(statusLine);
                }

            };

            /*cancelButton.Click += async (sender, e) =>
            {
                cancelButton.Enabled = false;
                requestButton.Enabled = true;
            }; */
        }

    }
}
