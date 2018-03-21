using Newtonsoft.Json;
using Android.App;
namespace FootPatrol.Droid
{
    public class WalkRequest
    {
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "from_location")]
        public string from_location { get; set; }

        [JsonProperty(PropertyName = "to_location")]
        public string to_location { get; set; }

        [JsonProperty(PropertyName = "additional_info")]
        public string additional_info { get; set; }
    }
}
