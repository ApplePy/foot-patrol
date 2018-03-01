using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Common.Apis;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.Gms.Location;
using Android.Graphics;
using Android.Locations;
using System.Net.Http;
using System;
using System.Linq;
using System.Text;
using Android.Gms.Common;
using Android.Runtime;
using Android.Widget;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Android.Support.V7.Widget;
using Android.Support.V4.Widget;
using System.Threading;

namespace FootPatrol.Droid
{
    [Activity(Label = "VolunteerActivity")]
    public class VolunteerActivity : Android.Support.V4.App.Fragment, GoogleApiClient.IOnConnectionFailedListener, GoogleApiClient.IConnectionCallbacks, Android.Gms.Location.ILocationListener, IOnMapReadyCallback
    {
        public string name, to_location, from_location, additional_info;
        private Typeface bentonSans;
        private ArrayAdapter<System.String> listAdapter;
        private bool pickupComplete = false;

        private static SupportMapFragment mf;
        private static Button completeTripBtn, cancelTripBtn;
        private static DrawerLayout mDrawerLayout, mfDrawerLayout;
        private static ImageButton mSideTab, mfSideTab;
        private static MapView mView;
        private static ImageView notificationBase, notificationBadge;
        public static TextView badgeCounter;
        private static ListView mListView, mfListView;
        private static RecyclerView mRecyclerView, mfRecyclerView;
        private static RecyclerView.LayoutManager layoutManager;
        private static RelativeLayout mRelativeLayout, mfRelativeLayout;

        public static List<string> request, steps;
        public string[] menuItems;
        public static RequestsActivity ra;

        private static GoogleMap map;
        private static Marker userMark;
        private static View view;
        private static VolunteerActivity va;
        private static GoogleApiClient client;
        private static Location myLocation;
        private IFusedLocationProviderApi location;
        private LocationRequest locationRequest;
        private MarkerOptions myMarker,userMarker;
        private PolylineOptions polyOptions;
        private static Polyline poly;

        public static VolunteerActivity newInstance()
        {
            va = new VolunteerActivity();
            return va;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            menuItems = new string[] { "EMERGENCY CONTACTS", "CAMPUS MAPS", "PAIR FOOT PATROLLERS"};

            listAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, menuItems);
            layoutManager = new LinearLayoutManager(this.Context, LinearLayoutManager.Horizontal, false);

            TimerCallback time = new TimerCallback(retrieveRequests);
            Timer timer = new Timer(time, 0, 0, 1000);

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
                mSideTab = (ImageButton)view.FindViewById(Resource.Id.sideTabBtn);
                mDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.drawer_layout);
                mRelativeLayout = (RelativeLayout)view.FindViewById(Resource.Id.innerRelative);
                cancelTripBtn = (Button)view.FindViewById(Resource.Id.cancelTripBtn);
                completeTripBtn = (Button)view.FindViewById(Resource.Id.completeTripBtn);

                mRelativeLayout.Visibility = ViewStates.Gone;

                mRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView1);
                mRecyclerView.Visibility = ViewStates.Gone;
                mRecyclerView.SetLayoutManager(layoutManager);

                mSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mSideTab, mDrawerLayout, mListView);
                };

                cancelTripBtn.Click += (sender, e) =>
                {
                    cancelBtnClicked();
                };

                completeTripBtn.Click += (sender, e) =>
                {
                    if (pickupComplete)
                        completeBtnClicked();

                    else
                        pickUpClicked();
                };

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
                mfSideTab = (ImageButton)view.FindViewById(Resource.Id.sideTabBtn1);
                mfListView = (ListView)view.FindViewById(Resource.Id.listView1);
                mfDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.drawer_layout1);
                mfRelativeLayout = (RelativeLayout)view.FindViewById(Resource.Id.innerRelative1);
                cancelTripBtn = (Button)view.FindViewById(Resource.Id.cancelTripBtn1);
                completeTripBtn = (Button)view.FindViewById(Resource.Id.completeTripBtn1);
                mfRelativeLayout.Visibility = ViewStates.Gone;

                mfRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView2);
                mfRecyclerView.Visibility = ViewStates.Gone;
                mfRecyclerView.SetLayoutManager(layoutManager);

                mfListView.SetAdapter(listAdapter);

                //Take care of correct fonts
                bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");
                setFont(bentonSans, badgeCounter);

                mfSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mfSideTab, mfDrawerLayout, mfListView);
                };

                cancelTripBtn.Click += (sender, e) =>
                {
                    cancelBtnClicked();
                };

                completeTripBtn.Click += (sender, e) =>
                {
                    completeBtnClicked();
                };

                mf = (SupportMapFragment)this.ChildFragmentManager.FindFragmentById(Resource.Id.map2);
                mf.OnCreate(savedInstanceState);
                mf.OnStart();
            }

            notificationBase.Click += (sender, e) =>
            {
                onRequestClick(handler.ObtainMessage().Arg1);
            };

            notificationBadge.Click += (sender, e) =>
            {
                onRequestClick(handler.ObtainMessage().Arg1);
            };


            return view;
        }

        public override void OnStart()
        {
            base.OnStart();
            client.Connect(); //connect the client
        }

        private void clientSetup()
        {
            client = new GoogleApiClient.Builder(Application.Context.ApplicationContext).AddConnectionCallbacks(this).AddOnConnectionFailedListener(this).AddApi(LocationServices.API).Build(); //create new client
            location = LocationServices.FusedLocationApi;
            client.Connect();
        }

        private void createLocationRequest()
        {
            locationRequest = LocationRequest.Create();
            locationRequest.SetPriority(LocationRequest.PriorityHighAccuracy);
            locationRequest.SetInterval(10000);
            locationRequest.SetFastestInterval(1000);
        }

        private void mapSetup()
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
                Target(newPos).Zoom(20).Bearing(90).Tilt(40).Build();

            map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp));

        }

        public void OnProviderDisabled(string provider)
        {
           //Do nothing 
        }

        public void OnProviderEnabled(string provider)
        {
            //Do nothing
        }

        public void OnStatusChanged(string provider, [GeneratedEnum] Availability status, Bundle extras)
        {
            //Do nothing
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

        private async Task<List<string>> getRequests()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("http://staging.capstone.incode.ca/api/v1/requests?offset=0&count=9&archived=true");
            var response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (System.Exception error)
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

                return requestArray;
            }

            else
            {
                System.Diagnostics.Debug.WriteLine("The status is: " + status);
                return null;
            }
        }

        private void onRequestClick(int requestCount)
        {
            if (requestCount == 0)
            {
                createAlert();
            }

            else
            {
                ra = RequestsActivity.newInstance(request, requestCount);
                ra.Show(this.FragmentManager, "Requests");
            }
        }

        private void setFont(Typeface font, TextView text)
        {
            text.SetTypeface(font, TypefaceStyle.Normal);
        }

        public void onTripAcceptAsync(string username, string toLoc, string fromLoc, string addInfo, int Id)
        {
            //Set variables to accept trip request to be used if trip is cancelled
            name = username;
            to_location = toLoc;
            from_location = fromLoc;
            additional_info = addInfo;

            var address = fromLoc;
            address = address + " Western University";
            var approximateLocation = Task.Run(() => getPositionForAddress(address)).Result;

            double latitude = System.Double.Parse(approximateLocation[0]);
            double longitude = System.Double.Parse(approximateLocation[1]);

            userMarker = new MarkerOptions();
            LatLng userCoordinates = new LatLng(latitude, longitude);
            ra.dismissFragment();
            userMarker.SetPosition(userCoordinates).SetTitle(username).SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueBlue));
            userMark = map.AddMarker(userMarker);

            notificationBase.Visibility = ViewStates.Gone;
            notificationBadge.Visibility = ViewStates.Gone;
            badgeCounter.Visibility = ViewStates.Gone;

            string currentLocation = myLocation.Latitude.ToString() + "," + myLocation.Longitude.ToString();
            string destinationLocation = userCoordinates.Latitude.ToString() + "," + userCoordinates.Longitude.ToString();

            var polyPattern = Task.Run(() => getPolyPat(currentLocation, destinationLocation)).Result;

            System.Diagnostics.Debug.WriteLine("The pattern is: " + polyPattern);
            
            List<LatLng> polyline = DecodePolyline(polyPattern);
            polyOptions = new PolylineOptions().InvokeColor(Color.Blue).InvokeWidth(10);

            foreach(LatLng point in polyline)
            {
                polyOptions.Add(point);
            }

            poly = map.AddPolyline(polyOptions);

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                mRecyclerView.Visibility = ViewStates.Visible;
                mRecyclerView.SetAdapter(new DirectionsAdapter(steps));
                mRelativeLayout.Visibility = ViewStates.Visible;

            }

            else
            {
                mfRecyclerView.Visibility = ViewStates.Visible;
                mfRecyclerView.SetAdapter(new DirectionsAdapter(steps));
                mfRelativeLayout.Visibility = ViewStates.Visible;
            }

            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("http://staging.capstone.incode.ca/api/v1/requests/" + Id.ToString());
            httpClient.DeleteAsync(customURI);
                
        }

        private async Task<string[]> getPositionForAddress(string address)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("https://maps.googleapis.com/maps/api/geocode/json?address=" + address +
                                    "&key=AIzaSyCMJ3Pw9W7IVXtT0AWi8Vb6iL9Y9JZJnZw");
            
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (System.Exception error)
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

        private async Task<string> getPolyPat(string start, string dest)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("https://maps.googleapis.com/maps/api/directions/json?origin=" + start + "&destination=" + dest + "&mode=walking&key=AIzaSyDQMcKBqfQwfRC88Lt02V8FP5yGPUqIq04");
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (System.Exception error)
            {
                System.Diagnostics.Debug.WriteLine("The exception is: " + error);
            }

            var content = await response.Content.ReadAsStringAsync();
            JObject dir = JObject.Parse(content);
            System.Diagnostics.Debug.WriteLine(dir);
            string polyPattern = (string)dir.SelectToken("routes[0].overview_polyline.points");
            var stepDirections = dir.SelectTokens("routes[0].legs[0].steps[*].html_instructions");
            steps = new List<string>();

            foreach(JToken step in stepDirections)
            {
               steps.Add(step.ToString());
            }

            for (int i = 0; i < steps.Count;i++)
            {
                steps[i] = steps[i].Replace("<b>", "");
                steps[i] = steps[i].Replace("</b>", "");
            }

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
            var polyline = new List<LatLng>();
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
                polyline.Add(mLatLng);
            }
            return polyline;
        }

        private void sideTabClicked(ImageButton btn, DrawerLayout drawer, ListView list)
        {
            if(drawer.IsDrawerOpen(list))
            {
                System.Diagnostics.Debug.WriteLine(drawer.GetX());
                btn.SetX(0);
                drawer.CloseDrawer(list);
            }

            else
            {
                drawer.OpenDrawer(list);
            }
        }

        private void cancelBtnClicked()
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetTitle("Cancel Trip").SetMessage("Are you sure you want to cancel the trip?").SetPositiveButton("Yes", async (sender, e) =>
            {
                HttpClient httpClient = new HttpClient();
                Uri customURI = new Uri("http://staging.capstone.incode.ca/api/v1/requests");

                VolunteerActivity volunteer = new VolunteerActivity();
                volunteer.name = name;
                volunteer.from_location = from_location;
                volunteer.to_location = to_location;
                volunteer.additional_info = additional_info;
                string vObj = JsonConvert.SerializeObject(volunteer);
                System.Diagnostics.Debug.WriteLine("The volunteer object is: " + vObj);

                HttpContent content = new StringContent(vObj, Encoding.UTF8, "application/json");
                var result = await httpClient.PostAsync(customURI, content);

                postTripUI();

            }).SetNegativeButton("No", (sender, e) =>
            {
                //Do nothing
            });

            Dialog dialog = builder.Create();
            dialog.Show();
        }

        private void pickUpClicked()
        {
            completeTripBtn.Text = "COMPLETE TRIP";
            pickupComplete = true;

        }

        private void completeBtnClicked()
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetTitle("Complete Trip").SetMessage("Are you sure you want to complete the trip?").SetPositiveButton("Yes", (sender, e) =>
            {
                postTripUI();
                completeTripBtn.Text = "PICKED UP USER";
                pickupComplete = false;

            }).SetNegativeButton("No", (sender, e) =>
            {
                //Do nothing
            });
                                                                                                                          
            Dialog dialog = builder.Create();
            dialog.Show();
        }

        private void postTripUI()
        {
            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                mRecyclerView.Visibility = ViewStates.Gone;
                mRelativeLayout.Visibility = ViewStates.Gone;
            }

            else
            {
                mfRecyclerView.Visibility = ViewStates.Gone;
                mfRelativeLayout.Visibility = ViewStates.Gone;
            }

            badgeCounter.Visibility = ViewStates.Visible;
            notificationBase.Visibility = ViewStates.Visible;
            notificationBadge.Visibility = ViewStates.Visible;

            poly.Remove();
            userMark.Remove();
        }

        private void createAlert()
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetMessage("There are no requests to be fulfilled!").SetNeutralButton("OK", (sender, e) =>
            {
                //Do nothing
            });

            Dialog dialog = builder.Create();
            dialog.Show();
        }

        protected Handler handler = new Handler((Message obj) =>
        {
            int requestCount = obj.Arg1;
            badgeCounter.Text = requestCount.ToString();
        });

        private void retrieveRequests(object state)
        {
            request = Task.Run(() => getRequests()).Result;
            int requestCount = request.Count;
            Message msg = handler.ObtainMessage();
            msg.Arg1 = requestCount;
            handler.SendMessage(msg);
        }
    }
}
