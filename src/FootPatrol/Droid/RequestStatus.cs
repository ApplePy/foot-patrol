
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "RequestStatus")]
    public class RequestStatus
    {
        [JsonProperty("archived")]
        public bool Archived { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }
    }
}
