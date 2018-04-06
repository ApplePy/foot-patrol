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
    public class RequestStatus
    {
        [JsonProperty(PropertyName = "archived")]
        public bool archived { get; set; }

        [JsonProperty(PropertyName = "status")]
        public string status { get; set; }

        [JsonProperty(PropertyName = "pairing")]
        public int pairing { get; set; }
    }
}
