using Android.App;
using Android.OS;
using Android.Views;
using Android.Support.V4.App;

namespace FootPatrol.Droid
{
    [Activity(Label = "CampusMapsActivity")]
    public class CampusMapsActivity : Android.Support.V4.App.Fragment
    {
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            View view;
            view = inflater.Inflate(Resource.Layout.CampusMaps, container, false);

            return view;
        }
    }
}
