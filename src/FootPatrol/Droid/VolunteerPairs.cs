
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Newtonsoft.Json;

namespace FootPatrol.Droid
{
    public class VolunteerPairs
    {
        [JsonProperty("active")]
        public bool Active { get; set; }

        [JsonProperty("volunteers")]
        public int[] Volunteers { get; set; }
    }
}
