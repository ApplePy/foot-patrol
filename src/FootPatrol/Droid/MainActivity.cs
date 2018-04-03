using Android.App;
using Android.Gms.Common;
using Android.OS;
using Android.Support.V4.App;

namespace FootPatrol.Droid
{
    [Activity(Label = "Safe Walk", MainLauncher = true, Icon = "@drawable/WesternFootPatrol")]
    public class MainActivity : FragmentActivity
    {
        const int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;
        /// <summary>
        /// When the view is created, create a fragment transaction to transition to the login screen.
        /// </summary>
        /// <param name="savedInstanceState">Saved instance state</param>
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.Main); //set the content view to the main layout

            var code = GoogleApiAvailability.GooglePlayServicesVersionCode;
            System.Diagnostics.Debug.WriteLine("The current version of google play services is: " + code.ToString());

            switchFragment();
        }

		public override void OnBackPressed()
		{
            if (SupportFragmentManager.BackStackEntryCount == 0)
            {
                this.Finish();
            }

            else if(SupportFragmentManager.BackStackEntryCount == 1)
            {
                AlertDialog.Builder builder = new AlertDialog.Builder(this);
                builder.SetMessage("Are you sure you want to logout?")
                       .SetPositiveButton("Yes", (sender, e) =>
                       {
                           SupportFragmentManager.PopBackStack();
                           switchFragment();
                           if (VolunteerActivity.isPaired)
                               VolunteerActivity.isPaired = false;
                       }).SetNegativeButton("No", (sender, e) =>
                       {
                        //Do nothing
                       });

                Dialog dialog = builder.Create();
                dialog.Show();
            }

            else
            {
                SupportFragmentManager.PopBackStack();
            }
		}

        private void switchFragment()
        {
            Android.Support.V4.App.Fragment newFrag = new LoginActivity(); //create a new instance of VolunteerActivity and save it
            Android.Support.V4.App.FragmentTransaction fragmentTransaction = SupportFragmentManager.BeginTransaction(); //begin the fragment transaction
            fragmentTransaction.Replace(Resource.Id.frameLayout1, newFrag, "LoginActivity"); //replace the old fragment with the new on
            fragmentTransaction.Commit(); //commit the transaction
        }
	}
}


