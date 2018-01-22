using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Common.Apis;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.Gms.Location;
using Android.Locations;
using System;
using Android.Gms.Common;
using Android.Runtime;

namespace FootPatrol.Droid
{
    [Activity(Label = "VolunteerActivity")]
    public class VolunteerActivity : Android.Support.V4.App.Fragment, GoogleApiClient.IOnConnectionFailedListener, GoogleApiClient.IConnectionCallbacks, Android.Gms.Location.ILocationListener, IOnMapReadyCallback
    {
        MapView mView;
        private GoogleMap map;
        bool _gettingMap = false;
        public static View view;
        public static VolunteerActivity va;
        public static GoogleApiClient client;
        public static Location myLocation;
        public LocationManager manager;
        public IFusedLocationProviderApi location;
        public LocationRequest locationRequest;
        MarkerOptions myMarker;

        public static VolunteerActivity newInstance()
        {
            va = new VolunteerActivity();
            return va;
        }

        public override Android.Views.View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            view = inflater.Inflate(Resource.Layout.VolunteerScreen, container, false);

            mView = (MapView)view.FindViewById(Resource.Id.map);
            mView.OnCreate(savedInstanceState);

            myMarker = new MarkerOptions();

            locationRequest = LocationRequest.Create();
            locationRequest.SetPriority(LocationRequest.PriorityHighAccuracy);
            locationRequest.SetInterval(10000);
            locationRequest.SetFastestInterval(1000);

            client = new GoogleApiClient.Builder(Application.Context.ApplicationContext).AddConnectionCallbacks(this).AddOnConnectionFailedListener(this).AddApi(LocationServices.API).Build(); //create new client
            location = LocationServices.FusedLocationApi;

            mView.OnStart();

            try
            {
                MapsInitializer.Initialize(this.Activity.ApplicationContext);
            }

            catch (Java.Lang.Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e.StackTrace);
            }

            return view;
        }

        public override void OnStart()
        {
            base.OnStart();
            client.Connect(); //connect the client
        }

        public void mapSetup()
        {
            mView.GetMapAsync(this);
        }

        public void OnConnectionFailed(ConnectionResult result)
        {
            System.Diagnostics.Debug.WriteLine("Connection Failed!");
        }

        public void OnConnected(Bundle connectionHint)
        {
            myLocation = location.GetLastLocation(client);
            location.RequestLocationUpdates(client, locationRequest, this);
            System.Diagnostics.Debug.WriteLine("Connection Accepted!");
            System.Diagnostics.Debug.WriteLine(myLocation);
            mapSetup();
        }

        public void OnConnectionSuspended(int cause)
        {
            System.Diagnostics.Debug.WriteLine("Connection Suspended!");
        }

        public void OnLocationChanged(Location location)
        {
            myMarker.SetPosition(new LatLng(location.Latitude, location.Longitude)).SetTitle("Volunteer").SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed));
            map.AnimateCamera(CameraUpdateFactory.NewLatLng(new Android.Gms.Maps.Model.LatLng(location.Latitude, location.Longitude)));
            map.AddMarker(myMarker);

            Android.Gms.Maps.Model.CameraPosition cp = new Android.Gms.Maps.Model.CameraPosition.Builder().
                Target(new Android.Gms.Maps.Model.LatLng(location.Latitude, location.Longitude)).Zoom(10).Bearing(90).Tilt(40).Build();

            map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp));

        }

        public void OnProviderDisabled(string provider)
        {
            throw new NotImplementedException();
        }

        public void OnProviderEnabled(string provider)
        {
            throw new NotImplementedException();
        }

        public void OnStatusChanged(string provider, [GeneratedEnum] Availability status, Bundle extras)
        {
            throw new NotImplementedException();
        }

        public void OnMapReady(GoogleMap googleMap)
        {
            map = googleMap;

            if (client.IsConnected)
            {
                if (myLocation == null)
                    System.Diagnostics.Debug.WriteLine("This is why it doesn't execute");

                else
                {
                    myMarker.SetPosition(new LatLng(myLocation.Latitude, myLocation.Longitude)).SetTitle("Volunteer").SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed));
                    map.AnimateCamera(CameraUpdateFactory.NewLatLng(new Android.Gms.Maps.Model.LatLng(myLocation.Latitude, myLocation.Longitude)));
                    map.AddMarker(myMarker);
                    Android.Gms.Maps.Model.CameraPosition cp = new Android.Gms.Maps.Model.CameraPosition.Builder().
                        Target(new Android.Gms.Maps.Model.LatLng(myLocation.Latitude, myLocation.Longitude)).Zoom(10).Bearing(90).Tilt(40).Build();

                    map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp));

                }
            }
        }
    }
}
