using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Maps;
using System;

namespace FootPatrol.Droid
{
    [Activity(Label = "VolunteerActivity")]
    public class VolunteerActivity : Android.Support.V4.App.Fragment
    {
        MapView mView;
        private GoogleMap googleMap;
        bool _gettingMap = false;
        public event EventHandler handle;

        public static VolunteerActivity newInstance()
        {
            VolunteerActivity va = new VolunteerActivity();
            return va;
        }

        public override Android.Views.View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            Android.Views.View view = inflater.Inflate(Resource.Layout.VolunteerScreen, container, false);

            mView = (MapView)view.FindViewById(Resource.Id.map);
            mView.OnCreate(savedInstanceState);

            mView.OnResume();
            mapSetup();

            try
            {
                MapsInitializer.Initialize(this.Activity.ApplicationContext);
            }

            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e.StackTrace);
            }

            if(googleMap != null)
            {
                System.Diagnostics.Debug.WriteLine("In here");
                googleMap.SetMapStyle((Android.Gms.Maps.Model.MapStyleOptions)GoogleMap.MapTypeTerrain);
            }
                              
            return view;
        }

        public void mapSetup()
        {
            if(googleMap != null)
            {
                return;
            }

            var callback = new googleMapReady();
            if (callback != null)
            {
                callback.handle += (sender, args) =>
                {
                    _gettingMap = false;
                };
            }

            _gettingMap = true;
            mView.GetMapAsync(callback);
        }
    }

    public class googleMapReady : Java.Lang.Object, IOnMapReadyCallback
    {
        public event EventHandler handle;
        public GoogleMap map;

        public void OnMapReady(GoogleMap googleMap)
        {
            map = googleMap;
            var handler = handle;
            if(handler != null)
            {
                handler(this, EventArgs.Empty);
            }

        }
    }
}
