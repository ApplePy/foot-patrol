using Android.App;
using Android.App; using Android.Widget; using Android.OS; using Android.Runtime; using Android.Content; using System; using Android.Support.V4.App; using Android.Support.V4.View; using Android.Support.V4.Content;  namespace FootPatrol.Droid {     [Activity(Label = "Safe Walk", MainLauncher = true, Icon = "@drawable/WesternFootPatrol")]     public class MainActivity : FragmentActivity     {         protected override void OnCreate(Bundle savedInstanceState)         {             base.OnCreate(savedInstanceState);              // Set our view from the "main" layout resource             SetContentView(Resource.Layout.Main);             ViewPager viewpager = FindViewById<ViewPager>(Resource.Id.viewPager1);         }
    }
} 
