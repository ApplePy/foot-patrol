﻿using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Common.Apis;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.Gms.Location;
using Android.Graphics;
using Android.Locations;
using System.Collections;
using System.Net.Http;
using System;
using System.Linq;
using Android.Gms.Common;
using Android.Runtime;
using Android.Widget;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Android.Support.V7.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "VolunteerActivity")]
    public class VolunteerActivity : Android.Support.V4.App.Fragment, GoogleApiClient.IOnConnectionFailedListener, GoogleApiClient.IConnectionCallbacks, Android.Gms.Location.ILocationListener, IOnMapReadyCallback
    {
        public string name, to_location, from_location, additional_info;
        private Typeface bentonSans;
        private ArrayAdapter<String> listAdapter;

        private static SupportMapFragment mf;
        private static MapView mView;
        private static ImageView notificationBase, notificationBadge;
        private static TextView badgeCounter;
        private static ListView mListView, mfListView;
        private static RecyclerView mRecyclerView, mfRecyclerView;

        public List<string> request;
        public int requestCount;
        public string[] menuItems;
        public static RequestsActivity ra;

        private static GoogleMap map;
        private static View view;
        private static VolunteerActivity va;
        private static GoogleApiClient client;
        private static Location myLocation;
        private IFusedLocationProviderApi location;
        private LocationRequest locationRequest;
        MarkerOptions myMarker;

        public static VolunteerActivity newInstance()
        {
            System.Diagnostics.Debug.WriteLine("We're using the Map View!");
            va = new VolunteerActivity();
            return va;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            menuItems = new string[] { "EMERGENCY CONTACTS", "CAMPUS MAPS", "PAIR FOOT PATROLLERS"};

            listAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, menuItems);

            try
            {
                MapsInitializer.Initialize(this.Context);
            }

            catch (Java.Lang.Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e.StackTrace);
            }

            myMarker = new MarkerOptions();

            createLocationRequest();
            clientSetup();


            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                view = inflater.Inflate(Resource.Layout.VolunteerScreen, container, false);
                notificationBase = (ImageView)view.FindViewById(Resource.Id.notificationBase);
                notificationBadge = (ImageView)view.FindViewById(Resource.Id.notificationBadge);
                badgeCounter = (TextView)view.FindViewById(Resource.Id.badgeCounter);
                mListView = (ListView)view.FindViewById(Resource.Id.navigationList1);
                mRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView1);


                mListView.SetAdapter(listAdapter);

                //Take care of correct fonts
                bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");
                setFont(bentonSans, badgeCounter);

                mView = (MapView)view.FindViewById(Resource.Id.map);
                mView.OnCreate(savedInstanceState);
                mView.OnStart();
            }

            else
            {
                view = inflater.Inflate(Resource.Layout.VolunteerScreenMF, container, false);
                notificationBase = (ImageView)view.FindViewById(Resource.Id.notificationBase2);
                notificationBadge = (ImageView)view.FindViewById(Resource.Id.notificationBadge2);
                badgeCounter = (TextView)view.FindViewById(Resource.Id.badgeCounter2);
                mfListView = (ListView)view.FindViewById(Resource.Id.listView1);
                mfRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView2);

                mfListView.SetAdapter(listAdapter);

                //Take care of correct fonts
                bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");
                setFont(bentonSans, badgeCounter);

                mf = (SupportMapFragment)this.ChildFragmentManager.FindFragmentById(Resource.Id.map2);
                mf.OnCreate(savedInstanceState);
                mf.OnStart();
            }

            request = Task.Run(() => getRequests()).Result; //get all user requests
            requestCount = request.Count;


            notificationBase.Click += (sender, e) =>
            {
                onRequestClick();
            };

            notificationBadge.Click += (sender, e) =>
            {
                onRequestClick();
            };

            return view;
        }

        public override void OnStart()
        {
            base.OnStart();
            client.Connect(); //connect the client
        }

        public void clientSetup()
        {
            client = new GoogleApiClient.Builder(Application.Context.ApplicationContext).AddConnectionCallbacks(this).AddOnConnectionFailedListener(this).AddApi(LocationServices.API).Build(); //create new client
            location = LocationServices.FusedLocationApi;
            client.Connect();
        }

        public void createLocationRequest()
        {
            locationRequest = LocationRequest.Create();
            locationRequest.SetPriority(LocationRequest.PriorityHighAccuracy);
            locationRequest.SetInterval(10000);
            locationRequest.SetFastestInterval(1000);
        }

        public void mapSetup()
        {
            if (Int32.Parse(Build.VERSION.Sdk) <= 23)
                mf.GetMapAsync(this);

            else
                mView.GetMapAsync(this);
        }

        public void OnConnectionFailed(ConnectionResult result)
        {
            System.Diagnostics.Debug.WriteLine("Connection Failed!");
        }

        public void OnConnected(Bundle connectionHint)
        {
            myLocation = location.GetLastLocation(client);
            mapSetup();
            if (!client.IsConnected)
                client.Reconnect();
            else
                location.RequestLocationUpdates(client, locationRequest, this);
        }

        public void OnConnectionSuspended(int cause)
        {
            System.Diagnostics.Debug.WriteLine("Connection Suspended!");
        }

        public void OnLocationChanged(Location location)
        {
            LatLng newPos = new LatLng(location.Latitude, location.Longitude);
            myMarker.SetPosition(newPos).SetTitle("Volunteer").SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed));
            myMarker.SetPosition(newPos);

            CameraPosition cp = new CameraPosition.Builder().
                Target(newPos).Zoom(15).Bearing(90).Tilt(40).Build();

            map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp));

        }

        public void OnProviderDisabled(string provider)
        {
            
        }

        public void OnProviderEnabled(string provider)
        {
            
        }

        public void OnStatusChanged(string provider, [GeneratedEnum] Availability status, Bundle extras)
        {
            
        }

        public void OnMapReady(GoogleMap googleMap)
        {
            map = googleMap;
            map.UiSettings.CompassEnabled = false;
            map.UiSettings.MyLocationButtonEnabled = false;
            map.UiSettings.MapToolbarEnabled = false;

            if (client.IsConnected)
            {
                if (myLocation == null)
                    System.Diagnostics.Debug.WriteLine("This is why it doesn't execute");

                else
                {
                    myMarker.SetPosition(new LatLng(myLocation.Latitude, myLocation.Longitude)).SetTitle("Volunteer").SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed));
                    map.AnimateCamera(CameraUpdateFactory.NewLatLng(new LatLng(myLocation.Latitude, myLocation.Longitude)));
                    map.AddMarker(myMarker);
                    CameraPosition cp = new CameraPosition.Builder().
                        Target(new LatLng(myLocation.Latitude, myLocation.Longitude)).Zoom(20).Bearing(90).Tilt(40).Build();

                    map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp));

                }
            }

            else
                client.Reconnect();
        }

        public async Task<List<string>> getRequests()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("http://staging.capstone.incode.ca/api/v1/requests?offset=0&count=9&archived=true");
            var response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (Exception error)
            {
                System.Diagnostics.Debug.WriteLine("The exception is: " + error);
            }

            int status = (int)response.StatusCode;
            List<string> requestArray = new List<string>();

            if (status == 200 || status == 201)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var o = JObject.Parse(responseContent);
                var requests = o.SelectToken("requests").ToList();
                foreach (JToken a in requests)
                {
                    requestArray.Add(a.ToString());
                }

                badgeCounter.Text = requests.Count.ToString();
                return requestArray;
            }

            else
            {
                System.Diagnostics.Debug.WriteLine("The status is: " + status);
                return null;
            }
        }

        public void onRequestClick()
        {
            ra = RequestsActivity.newInstance(request, requestCount);
            ra.Show(this.FragmentManager,"Requests");
        }

        public void setFont(Typeface font, TextView text)
        {
            text.SetTypeface(font, TypefaceStyle.Normal);
        }

        public void onTripAcceptAsync(string name, string toLoc, string fromLoc, string addInfo)
        {
            var address = fromLoc;
            address = address + " Western University";
            var approximateLocation = Task.Run(() => getPositionForAddress(address)).Result;

            double latitude = Double.Parse(approximateLocation[0]);
            double longitude = Double.Parse(approximateLocation[1]);

            MarkerOptions userMarker = new MarkerOptions();
            LatLng userCoordinates = new LatLng(latitude, longitude);
            ra.dismissFragment();
            userMarker.SetPosition(userCoordinates).SetTitle(name).SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueBlue));
            map.AddMarker(userMarker);

            notificationBase.Visibility = ViewStates.Gone;
            notificationBadge.Visibility = ViewStates.Gone;
            badgeCounter.Visibility = ViewStates.Gone;

            string currentLocation = myLocation.Latitude.ToString() + "," + myLocation.Longitude.ToString();
            string destinationLocation = userCoordinates.Latitude.ToString() + "," + userCoordinates.Longitude.ToString();
           
            var polyPattern = Task.Run(() => getPolyPat(currentLocation, destinationLocation)).Result;

            List<LatLng> polyline = DecodePolyline(polyPattern);
            var polyOption = new PolylineOptions().InvokeColor(Color.Blue).InvokeWidth(10);

            foreach(LatLng point in polyline)
            {
                polyOption.Add(point);
            }

            map.AddPolyline(polyOption);

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                
            }

            else
            {
                
            }
                


        }

        public async Task<string[]> getPositionForAddress(string address)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("https://maps.googleapis.com/maps/api/geocode/json?address=" + address +
                                    "&key=AIzaSyCMJ3Pw9W7IVXtT0AWi8Vb6iL9Y9JZJnZw");
            
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (Exception error)
            {
                System.Diagnostics.Debug.WriteLine("The exception is: " + error);
            }

            var content = await response.Content.ReadAsStringAsync();
            JObject obj = JObject.Parse(content);
            var latitudePos = (string)obj.SelectToken("results[0].geometry.location.lat");
            var longitudePos = (string)obj.SelectToken("results[0].geometry.location.lng");

            string[] coords = new string[2];
            coords[0] = latitudePos;
            coords[1] = longitudePos;
            return coords;
        }

        public async Task<string> getPolyPat(string start, string dest)
        {
            string[] directions = new string[1];
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("https://maps.googleapis.com/maps/api/directions/json?origin=" + start + "&destination=" + dest + "&mode=walking&key=AIzaSyDQMcKBqfQwfRC88Lt02V8FP5yGPUqIq04");
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (Exception error)
            {
                System.Diagnostics.Debug.WriteLine("The exception is: " + error);
            }

            var content = await response.Content.ReadAsStringAsync();
            JObject dir = JObject.Parse(content);
            System.Diagnostics.Debug.WriteLine(dir);
            string polyPattern = (string)dir.SelectToken("routes[0].overview_polyline.points");
            System.Diagnostics.Debug.WriteLine("The poly pattern is: " + polyPattern);
            return polyPattern;
        }

        private List<LatLng> DecodePolyline(string encodedPoints)
        {
            if (string.IsNullOrWhiteSpace(encodedPoints))
            {
                return null;
            }

            int index = 0;
            var polylineChars = encodedPoints.ToCharArray();
            var poly = new List<LatLng>();
            int currentLat = 0;
            int currentLng = 0;
            int next5Bits;

            while (index < polylineChars.Length)
            {
                // calculate next latitude
                int sum = 0;
                int shifter = 0;

                do
                {
                    next5Bits = polylineChars[index++] - 63;
                    sum |= (next5Bits & 31) << shifter;
                    shifter += 5;
                }
                while (next5Bits >= 32 && index < polylineChars.Length);

                if (index >= polylineChars.Length)
                {
                    break;
                }

                currentLat += (sum & 1) == 1 ? ~(sum >> 1) : (sum >> 1);

                // calculate next longitude
                sum = 0;
                shifter = 0;

                do
                {
                    next5Bits = polylineChars[index++] - 63;
                    sum |= (next5Bits & 31) << shifter;
                    shifter += 5;
                }
                while (next5Bits >= 32 && index < polylineChars.Length);

                if (index >= polylineChars.Length && next5Bits >= 32)
                {
                    break;
                }

                currentLng += (sum & 1) == 1 ? ~(sum >> 1) : (sum >> 1);

                var mLatLng = new LatLng(Convert.ToDouble(currentLat) / 100000.0, Convert.ToDouble(currentLng) / 100000.0);
                poly.Add(mLatLng);
            }

            return poly;
        }


    }
}
