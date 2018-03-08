using Android.App;
using Android.OS;
using Android.Views;
using Android.Graphics;
using Android.Widget;
using System.Windows;

namespace FootPatrol.Droid
{
    public class LoginActivity : Android.Support.V4.App.Fragment
    {
        //UI components to be displayed on the screen
        TextView continueAsUser;
        Button signIn;
        EditText userName, password;
        ProgressBar spinner;

        private Typeface bentonSans; //font to be used

        /// <summary>
        /// Creates a new instance of LoginActivity
        /// </summary>
        /// <returns>The instance.</returns>
        public static LoginActivity newInstance()
        {
            LoginActivity la = new LoginActivity();
            return la;
        }

        /// <summary>
        /// Creates the LoginActivity view.
        /// </summary>
        /// <returns>The created view</returns>
        /// <param name="inflater">Inflater</param>
        /// <param name="container">Container</param>
        /// <param name="savedInstanceState">Saved instance state</param>
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            View views = inflater.Inflate(Resource.Layout.LoginScreen, container, false);
            //initialize each UI component
            continueAsUser = (TextView)views.FindViewById(Resource.Id.textView1);
            signIn = (Button)views.FindViewById(Resource.Id.loginBtn);
            userName = (EditText)views.FindViewById(Resource.Id.usernameField);
            password = (EditText)views.FindViewById(Resource.Id.passwordField);
            spinner = (ProgressBar)views.FindViewById(Resource.Id.progressBar1);

            spinner.Visibility = ViewStates.Gone; //set the loading spinner to gone

            //set the fonts of each UI element
            bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");
            setFont(bentonSans, signIn);
            setFont(bentonSans, continueAsUser);
            setFont(bentonSans, userName);
            setFont(bentonSans, password);

            //sign In button click listener
            signIn.Click += (sender, e) =>
            {
                if (string.IsNullOrWhiteSpace(userName.Text) || string.IsNullOrWhiteSpace(password.Text))
                {
                    AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
                    builder.SetMessage("The username or password field cannot be left empty!")
                           .SetNeutralButton("OK", (sender2, args) =>
                    {
                        //Do nothing
                    });

                    Dialog dialog = builder.Create();
                    dialog.Show();
                }

                else
                {
                    spinner.Visibility = ViewStates.Visible; //make the spinner visible
                    Android.Support.V4.App.Fragment newFrag = new VolunteerActivity(); //create a new instance of VolunteerActivity and save it
                    Android.Support.V4.App.FragmentTransaction fragmentTransaction = this.Activity.SupportFragmentManager.BeginTransaction(); //begin the fragment transaction
                    fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation); //add animation to slide new fragment to the left
                    fragmentTransaction.Replace(Resource.Id.frameLayout2, newFrag, "VolunteerActivity"); //replace the old fragment with the new on
                    fragmentTransaction.AddToBackStack("LoginActivity");
                    fragmentTransaction.Commit(); //commit the transaction
                }
            };

            return views;
        }

        private void setFont(Typeface font, TextView text)
        {
            text.SetTypeface(font, TypefaceStyle.Normal);
        }

    }
}
