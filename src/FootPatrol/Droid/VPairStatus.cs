
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
    [Activity(Label = "VPairStatus")]
    public class VPairStatus
    {
        [JsonProperty(PropertyName = "active")]
        public bool active { set; get; }
    }
}
