
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
            get { return 1; }
        } 

        public override Android.Support.V4.App.Fragment GetItem(int position)
        {
            return (Android.Support.V4.App.Fragment) PickUpActivity.newInstance();
        }

    }
}
