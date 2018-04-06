using Newtonsoft.Json;
using Android.App;

namespace FootPatrol.Droid
{
    [Activity(Label = "VPairStatus")]
    public class VPairStatus
    {
        [JsonProperty(PropertyName = "active")]
        public bool active { set; get; }
    }
}
