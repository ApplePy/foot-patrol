using Android.App;

namespace FootPatrol.Droid
{
    [Activity(Label = "UserRequests")]
    public class UserRequests
    {
        public struct Request
        {
            public string name, toLoc, fromLoc, addInfo;
            public int id;

            public Request(string name, string toLocation, string fromLocation, string additionalInfo, int Id)
            {
                this.name = name;
                this.toLoc = toLocation;
                this.fromLoc = fromLocation;
                this.addInfo = additionalInfo;
                this.id = Id;
            }
        };
    }
}
