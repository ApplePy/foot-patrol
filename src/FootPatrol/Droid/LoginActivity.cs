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
    [Activity(Label = "LoginActivity")]
    public class LoginActivity : Android.Support.V4.App.Fragment 
    {
        public static LoginActivity newInstance()
        {
            LoginActivity la = new LoginActivity();
            return la;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            View views = inflater.Inflate(Resource.Layout.LoginScreen, container, false);
            return views;
        }
    }
}
