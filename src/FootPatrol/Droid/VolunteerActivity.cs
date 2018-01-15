using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Maps;
using Android.Locations;
using System.Collections.Generic;
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
        public static Android.Content.Context context;

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
                //googleMap.SetMapStyle((Android.Gms.Maps.Model.MapStyleOptions)GoogleMap.MapTypeTerrain);
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

        public void OnMapReady(GoogleMap googleMap) //being called
        {
            map = googleMap;
            var handler = handle;
            if(handler != null)
            {
                handler(this, EventArgs.Empty);
            }

            LocationManager lm = (LocationManager)Application.Context.GetSystemService(Android.Content.Context.LocationService);
            Criteria criteria = new Criteria();
            Location myLocation = getLastLocation(lm, criteria);

            if (myLocation == null)
                System.Diagnostics.Debug.WriteLine("This is why it doesn't execute");

            if(myLocation != null)
            {
                map.AnimateCamera(CameraUpdateFactory.NewLatLng(new Android.Gms.Maps.Model.LatLng(myLocation.Latitude, myLocation.Longitude)));

                Android.Gms.Maps.Model.CameraPosition cp = new Android.Gms.Maps.Model.CameraPosition.Builder().
                    Target(new Android.Gms.Maps.Model.LatLng(myLocation.Latitude, myLocation.Longitude)).Zoom(13).Bearing(90).Tilt(40).Build();

                googleMap.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp));
                
            }

        }

        public Location getLastLocation(LocationManager lm, Criteria cr)
        {
            IList<string> providers = lm.GetProviders(cr, true);
            Location bestLocation = null;

            foreach(string provider in providers)
            {
                Location location = lm.GetLastKnownLocation(provider);
                if (location == null)
                    continue;

                if(bestLocation == null || location.Accuracy < bestLocation.Accuracy)
                {
                    bestLocation = location;
                }
            }

            if(bestLocation == null)
            {
                return null;
            }

            return bestLocation;

        }
    }
}
