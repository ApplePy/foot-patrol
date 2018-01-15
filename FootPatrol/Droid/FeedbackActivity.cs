
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "FeedbackActivity")]
    public class FeedbackActivity : Android.Support.V4.App.Fragment 
    {
        public static FeedbackActivity newInstance()
        {
            FeedbackActivity feedback = new FeedbackActivity();
            return feedback;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            View views = inflater.Inflate(Resource.Layout.FeedbackLayout, container, false);
            return views;
        }
    }
}
