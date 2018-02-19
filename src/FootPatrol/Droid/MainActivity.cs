using Android.App;
using Android.Content;
using Android.OS;
using Android.Support.V4.App;
using Android.Views;

namespace FootPatrol.Droid
{
    [Activity(Label = "Safe Walk", MainLauncher = true, Icon = "@drawable/WesternFootPatrol")]
    public class MainActivity : FragmentActivity
    {
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.Main);
            Android.Support.V4.App.Fragment newFrag = new LoginActivity();
            Android.Support.V4.App.FragmentTransaction fragmentTransaction = SupportFragmentManager.BeginTransaction();
            fragmentTransaction.Replace(Resource.Id.frameLayout1, newFrag, "LoginActivity");
            fragmentTransaction.AddToBackStack(null);
            fragmentTransaction.Commit();
        }
    }
}


