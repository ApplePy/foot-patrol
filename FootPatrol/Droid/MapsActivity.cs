
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
    [Activity(Label = "MapsActivity")]
    public class MapsActivity : Android.Support.V4.App.Fragment 
    {
        public static MapsActivity newInstance()
        {
            MapsActivity maps = new MapsActivity();
            return maps;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            View views = inflater.Inflate(Resource.Layout.MapsLayout, container, false);
            return views;
        }
    }
}
