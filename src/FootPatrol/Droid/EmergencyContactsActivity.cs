using Android.App;
using Android.OS;
using Android.Views;

namespace FootPatrol.Droid
{
    [Activity(Label = "EmergencyContactsActivity")]
    public class EmergencyContactsActivity : Android.Support.V4.App.Fragment
    {
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            View view;
            view = inflater.Inflate(Resource.Layout.EmergencyContact, container, false);

            return view;
        }
    }
}
