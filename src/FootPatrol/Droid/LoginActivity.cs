﻿using Android.App;
using Android.OS;
using Android.Views;
using Android.Graphics;
using Android.Widget;

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
            signIn.SetTypeface(bentonSans, TypefaceStyle.Normal);
            continueAsUser.SetTypeface(bentonSans, TypefaceStyle.Normal);
            userName.SetTypeface(bentonSans, TypefaceStyle.Normal);
            password.SetTypeface(bentonSans, TypefaceStyle.Normal);

            //sign In button click listener
            signIn.Click += (sender, e) =>
            {
                spinner.Visibility = ViewStates.Visible; //make the spinner visible
                Android.Support.V4.App.Fragment newFrag = new VolunteerActivity(); //create a new instance of VolunteerActivity and save it
                Android.Support.V4.App.FragmentTransaction fragmentTransaction = ChildFragmentManager.BeginTransaction(); //begin the fragment transaction
                fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation); //add animation to slide new fragment to the left
                fragmentTransaction.Replace(Resource.Id.frameLayout2, newFrag, "VolunteerActivity"); //replace the old fragment with the new one
                fragmentTransaction.AddToBackStack(null); //add the transaction to the back stack
                fragmentTransaction.Commit(); //commit the transaction
            };

            return views;
        }
    }
}
