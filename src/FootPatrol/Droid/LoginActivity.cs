using Android.App;
using Android.OS;
using Android.Views;
using Android.Graphics;
using Android.Widget;

namespace FootPatrol.Droid
{
    public class LoginActivity : Android.Support.V4.App.Fragment
    {
        TextView continueAsUser;
        Button signIn;
        EditText userName, password;
        ProgressBar spinner;

        private Typeface bentonSans;

        public static LoginActivity newInstance()
        {
            LoginActivity la = new LoginActivity();
            return la;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            View views = inflater.Inflate(Resource.Layout.LoginScreen, container, false);
            continueAsUser = (TextView)views.FindViewById(Resource.Id.textView1);
            signIn = (Button)views.FindViewById(Resource.Id.loginBtn);
            userName = (EditText)views.FindViewById(Resource.Id.usernameField);
            password = (EditText)views.FindViewById(Resource.Id.passwordField);
            spinner = (ProgressBar)views.FindViewById(Resource.Id.progressBar1);

            spinner.Visibility = ViewStates.Gone;

            bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");
            signIn.SetTypeface(bentonSans, TypefaceStyle.Normal);
            continueAsUser.SetTypeface(bentonSans, TypefaceStyle.Normal);
            userName.SetTypeface(bentonSans, TypefaceStyle.Normal);
            password.SetTypeface(bentonSans, TypefaceStyle.Normal);

            signIn.Click += (sender, e) =>
            {
                spinner.Visibility = ViewStates.Visible;
                Android.Support.V4.App.Fragment newFrag = new VolunteerActivity();
                Android.Support.V4.App.FragmentTransaction fragmentTransaction = ChildFragmentManager.BeginTransaction();
                fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation);
                fragmentTransaction.Replace(Resource.Id.frameLayout2, newFrag, "VolunteerActivity");
                fragmentTransaction.AddToBackStack(null);
                fragmentTransaction.Commit();
            };

            return views;
        }
    }
}
