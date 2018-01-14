
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
            get { return 3; }
        } 

        public override Android.Support.V4.App.Fragment GetItem(int position)
        {
            if (position == 0)
            {
                return (Android.Support.V4.App.Fragment)PickUpActivity.newInstance();
            }

            else if(position == 1){
                return (Android.Support.V4.App.Fragment)MapsActivity.newInstance();
            }

            else
                return (Android.Support.V4.App.Fragment)FeedbackActivity.newInstance();
        }

        public override Java.Lang.ICharSequence GetPageTitleFormatted(int position)
        {
            if (position == 0)
            {
                return new Java.Lang.String("Pickup");
            }

            else if (position == 1)
                return new Java.Lang.String("Campus Maps");

            else
                return new Java.Lang.String("Feedback");
        }

    }
}
