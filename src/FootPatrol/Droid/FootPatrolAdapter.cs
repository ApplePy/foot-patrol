
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Support.V4.App;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "FootPatrolAdapter")]
    public class FootPatrolAdapter : FragmentPagerAdapter
    {
        public FootPatrolAdapter(Android.Support.V4.App.FragmentManager fm) : base(fm)
        {

        }

        public override int Count {
            get { return 2; }
        } 

        public override Android.Support.V4.App.Fragment GetItem(int position)
        {
            if (position == 0)
            {
                return (Android.Support.V4.App.Fragment)LoginActivity.newInstance();
            }

            else
            {
                return (Android.Support.V4.App.Fragment)VolunteerActivity.newInstance();
            }
        }

        public override Java.Lang.ICharSequence GetPageTitleFormatted(int position)
        {
            if (position == 0)
            {
                return new Java.Lang.String("Login");
            }

            else
                return new Java.Lang.String("Volunteer");
        }

    }
}
