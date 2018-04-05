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
    [Activity(Label = "UpdateVolunteer")]
    public class UpdateVolunteer
    {
        [JsonProperty(PropertyName = "latitude")]
        public string latitude { set; get; }

        [JsonProperty(PropertyName = "longitude")]
        public string longitude { set; get; }

        [JsonProperty(PropertyName = "timestamp")]
        public string timestamp { set; get; }
    }
}
