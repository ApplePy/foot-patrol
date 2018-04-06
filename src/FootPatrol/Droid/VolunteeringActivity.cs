using Android.OS;
using Android.Views;

namespace FootPatrol.Droid
{
    public class VolunteeringActivity : Android.Support.V4.App.Fragment
    {
        public static View view;
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            view = inflater.Inflate(Resource.Layout.Volunteer, container, false);

            return view;
        }
    }
}
