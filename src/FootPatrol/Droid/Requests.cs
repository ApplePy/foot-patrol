
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

namespace FootPatrol.Droid
{
    [Activity(Label = "Requests")]
    public class Requests : Activity
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
