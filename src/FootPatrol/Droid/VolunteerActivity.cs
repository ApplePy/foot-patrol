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
using Android.Support.V7.Widget;
using Android.Support.V4.Widget;
using Android.Content;
using System.Threading;
using static Android.Widget.AdapterView;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Android.Views.InputMethods;

namespace FootPatrol.Droid
{
    [Activity(Label = "VolunteerActivity")]
    public class VolunteerActivity : Android.Support.V4.App.Fragment, GoogleApiClient.IOnConnectionFailedListener, GoogleApiClient.IConnectionCallbacks, Android.Gms.Location.ILocationListener, IOnMapReadyCallback
    {
        public static string name, to_location, from_location, additional_info; //variables to keep name, location and additional information of user
        public static int id, pairID, myID = 1, vlnteerID;
        public static bool isPaired = false, pickupPending = false;

        public static Typeface bentonSans; //font to be used in application
        private static ArrayAdapter<String> listAdapter,fpAdapter; //adapter to help display direction

        private static SupportMapFragment mf; //fragment that displays map on < API 24
        private static Button completeTripBtn; //buttons to complete trip
        private static DrawerLayout mDrawerLayout, mfDrawerLayout; //drawer layouts for new and older android devices
        private static ImageButton mSideTab, mfSideTab; //side tab buttons for each view
        private static MapView mView; //mapView that displays map on >= API 24
        private static ImageView notificationBase, notificationBadge; //UI for displaying requests
        public static TextView badgeCounter, userName, toLoc, fromLoc, addInfo, pickupInfo, directionsText, searchViewDescription; //counter that displays number of requests available to the volunteer
        private static ListView mListView, mfListView, fpListView; //list views for both new and older android devices
        private static RecyclerView mRecyclerView, mfRecyclerView; //recycler views that display directions for new and older android devices
        private static RecyclerView.LayoutManager layoutManager; //layout manager for recycler view
        private static RelativeLayout mRelativeLayout, mfRelativeLayout; //relative layouts to display status of complete, cancel and pickup on trip
        private static Android.Widget.SearchView searchView;

        private static string backendURI, getRequestURI, getVolunteerURI, postPairURI, postInactivePairURI, setPairActiveURI, updateVolunteerURI;

        public static List<string> request, steps, fpNames, volunteerArray; //lists to hold information on requests and direction steps, and volunteer names
        public static List<int> volunteerID;
        public static string[] menuItems; //list of menu items to be displayed in side tab
        public static RequestsActivity ra; //get a reference to each request object
        public static UserRequests.Request acceptedRequest;

        private static GoogleMap map; //reference to created google map
        private static Marker userMark, volunteerMark, pairMark; //user marker to be displayed on map
        private static View view; //the current view
        private static VolunteerActivity va; //reference to new instance of VolunteerActivity
        private static GoogleApiClient client; //the Google API client used to connect to Google Play Store
        private static Location myLocation; //the volunteer's current location
        private IFusedLocationProviderApi location; //location of the volunteer
        private LocationRequest locationRequest; //a new location request object so that location can be updated
        private static MarkerOptions volunteerMarker, userMarker, pairMarker; //marker options to be used for each marker on map
        private PolylineOptions polyOptions; //polyline options for the following polyline
        private static Polyline poly; //polyline to display directions on the map

        public string tag;
        public Android.Support.V4.App.Fragment fragment;

        /// <summary>
        /// Creates a new instance of the VolunteerActivity class
        /// </summary>
        public static VolunteerActivity newInstance()
        {
            va = new VolunteerActivity();
            return va;
        }

        ///  <summary>
        ///  Creates fragment view and initializes UI components used in the view
        ///  </summary>
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            menuItems = new string[] { "NON-EMERGENCY CONTACTS", "CAMPUS MAPS", "PAIR/UNPAIR FOOT PATROLLERS"}; //initializes list to displayed in listView 
         
            listAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, menuItems); //initializes ArrayAdapter to be displayed in listView

            layoutManager = new LinearLayoutManager(this.Context, LinearLayoutManager.Horizontal, false); //initializs the directions layout to be horizontal and sidescrolling
            backendURI = "https://staging.capstone.incode.ca/api/v1";
            getRequestURI = "/requests/?offset=0&count=9&archived=false";
            getVolunteerURI = "/volunteers/inactive";
            postPairURI = "/volunteerpairs/";
            postInactivePairURI = "/volunteerpairs?inactive=true";
            updateVolunteerURI = "/volunteers/";
            request = new List<string>();
            fpNames = new List<string>();

            TimerCallback time = new TimerCallback(retrieveRequests); //create a new timerCallback to be used in timer
            Timer timer = new Timer(time, 0, 0, 1000); //use the timerCallback to check for user requests every second

            fpNames = Task.Run(() => getVolunteers()).Result;
            fpAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, fpNames);

            try
            {
                MapsInitializer.Initialize(this.Context); //initialize the Google Maps Android API
            }

            catch (Exception e)
            {
                createAlert("Unable to initialize the map, the error is: " + e);
            }

            createLocationRequest(); //create new location request to continuously update volunteer request
            clientSetup(); //set up the Google client 

            if (Int32.Parse(Build.VERSION.Sdk) > 23) //if the user is using a build version of >= API 24 (use mapView)
            {
                //initialize UI elements
                view = inflater.Inflate(Resource.Layout.VolunteerScreen, container, false);
                notificationBase = (ImageView)view.FindViewById(Resource.Id.notificationBase);
                notificationBadge = (ImageView)view.FindViewById(Resource.Id.notificationBadge);
                badgeCounter = (TextView)view.FindViewById(Resource.Id.badgeCounter);
                mListView = (ListView)view.FindViewById(Resource.Id.navigationList1);
                fpListView = (ListView)view.FindViewById(Resource.Id.listView2);
                mSideTab = (ImageButton)view.FindViewById(Resource.Id.sideTabBtn);
                searchView = (Android.Widget.SearchView)view.FindViewById(Resource.Id.searchView);
                mDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.drawer_layout);
                mRelativeLayout = (RelativeLayout)view.FindViewById(Resource.Id.innerRelative);
                completeTripBtn = (Button)view.FindViewById(Resource.Id.completeTripBtn);
                mRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView1);
                mView = (MapView)view.FindViewById(Resource.Id.map);
                userName = (TextView)view.FindViewById(Resource.Id.userName1);
                toLoc = (TextView)view.FindViewById(Resource.Id.userToLoc);
                fromLoc = (TextView)view.FindViewById(Resource.Id.userFromLoc);
                addInfo = (TextView)view.FindViewById(Resource.Id.userAddInfo);
                pickupInfo = (TextView)view.FindViewById(Resource.Id.pickupInfo);
                searchViewDescription = (TextView)view.FindViewById(Resource.Id.volunteerSVDescription);

                mRelativeLayout.Visibility = ViewStates.Gone; //set the visibility of the complete trip UI to gone
                mRecyclerView.Visibility = ViewStates.Gone; //set the visibility of the directions UI to gone
                removeSearchUI();

                mRecyclerView.SetLayoutManager(layoutManager); //set the layout manager of the recyclerview to display direction

                //onClick listeners for each interactable UI element
                mSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mSideTab, mDrawerLayout, mListView);
                };

                completeTripBtn.Click += (sender, e) =>
                {
                    completeBtnClicked();
                };

                mListView.Adapter = listAdapter;
                fpListView.Adapter = fpAdapter;

                searchView.SetQueryHint("Search for volunteer");

                searchView.QueryTextChange += (sender, e) =>
                {
                    if (searchView.Query == "")
                        fpListView.Visibility = ViewStates.Gone;

                    else
                    {
                        fpListView.Visibility = ViewStates.Visible;
                        fpAdapter.Filter.InvokeFilter(e.NewText);
                    }
                };

                mListView.ItemClick += (sender, e) => //listView click listener
                {
                    selectItem(e.Position);
                };

                fpListView.ItemClick += (sender, e) =>
                {
                    confirmFootPatroller(fpAdapter.GetItem(e.Position).ToString());
                };

                mView.OnCreate(savedInstanceState);
                mView.OnStart(); //start loading the map into the mapView
            }

            else
            {
                //initialize UI elements
                view = inflater.Inflate(Resource.Layout.VolunteerScreenMF, container, false);
                notificationBase = (ImageView)view.FindViewById(Resource.Id.notificationBase2);
                notificationBadge = (ImageView)view.FindViewById(Resource.Id.notificationBadge2);
                badgeCounter = (TextView)view.FindViewById(Resource.Id.badgeCounter2);
                mfSideTab = (ImageButton)view.FindViewById(Resource.Id.sideTabBtn1);
                mfListView = (ListView)view.FindViewById(Resource.Id.listView1);
                fpListView = (ListView)view.FindViewById(Resource.Id.listView3);
                searchView = (Android.Widget.SearchView)view.FindViewById(Resource.Id.searchView1);
                mfDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.drawer_layout1);
                mfRelativeLayout = (RelativeLayout)view.FindViewById(Resource.Id.innerRelative1);
                completeTripBtn = (Button)view.FindViewById(Resource.Id.completeTripBtn1);
                mf = (SupportMapFragment)this.ChildFragmentManager.FindFragmentById(Resource.Id.map2);
                mfRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView2);
                userName = (TextView)view.FindViewById(Resource.Id.userName2);
                toLoc = (TextView)view.FindViewById(Resource.Id.userToLoc1);
                fromLoc = (TextView)view.FindViewById(Resource.Id.userFromLoc1);
                addInfo = (TextView)view.FindViewById(Resource.Id.userAddInfo1);
                pickupInfo = (TextView)view.FindViewById(Resource.Id.pickupInfo1);
                searchViewDescription = (TextView)view.FindViewById(Resource.Id.volunteerSVDescriptionMF);

                //set visibilities to gone of UI elements not presently used
                mfRecyclerView.Visibility = ViewStates.Gone;
                mfRelativeLayout.Visibility = ViewStates.Gone;
                removeSearchUI();

                mfRecyclerView.SetLayoutManager(layoutManager); //set the layout manager of the recyclerView

                mfListView.Adapter = listAdapter; //set the listView adapter
                fpListView.Adapter = fpAdapter;

                searchView.SetQueryHint("Search for volunteer");

                searchView.QueryTextChange += (sender, e) =>
                {
                    if (searchView.Query == "")
                        fpListView.Visibility = ViewStates.Gone;

                    else
                    {
                        fpListView.Visibility = ViewStates.Visible;
                        fpAdapter.Filter.InvokeFilter(e.NewText);
                    }
                };

                mfListView.ItemClick += (sender, e) => //listView click listener
                {
                    selectItem(e.Position);
                };

                fpListView.ItemClick += (sender, e) =>
                {
                    confirmFootPatroller(fpAdapter.GetItem(e.Position).ToString());
                };
              
                //onClick listeners for each interactable UI element
                mfSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mfSideTab, mfDrawerLayout, mfListView);
                };

                completeTripBtn.Click += (sender, e) =>
                {
                    completeBtnClicked();
                };

                mf.OnCreate(savedInstanceState);
                mf.OnStart(); //start loading the map in the MapFragment
            }

            //Take care of correct fonts
            bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");

            setFont(bentonSans, badgeCounter);
            setFont(bentonSans, userName);
            setFont(bentonSans, toLoc);
            setFont(bentonSans, fromLoc);
            setFont(bentonSans, addInfo);
            setFont(bentonSans, pickupInfo);

            //on click listeners for the request notification UI element
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

        /// <summary>
        /// Start the map display and connect client if it isn't already connected from clientSetup() call
        /// </summary>
        public override void OnStart()
        {
            base.OnStart();
            if(!client.IsConnected)
                client.Connect(); //if the client is not already connected, connect to the client before opening the map
        }

		/// <summary>
		/// Setup the googleAPI client to help administer map and get the current location using Location Services
		/// </summary>
		private void clientSetup()
        {
            client = new GoogleApiClient.Builder(Application.Context.ApplicationContext).AddConnectionCallbacks(this)
                                        .AddOnConnectionFailedListener(this)
                                        .AddApi(LocationServices.API).Build(); //create new client and add needed callbacks
            location = LocationServices.FusedLocationApi; //initialize
            client.Connect(); //conncet to the client on 
        }

        /// <summary>
        /// Creates the location request.
        /// </summary>
        private void createLocationRequest()
        {
            locationRequest = LocationRequest.Create(); //create a new location request
            locationRequest.SetPriority(LocationRequest.PriorityHighAccuracy) //set the location request priority to high
                           .SetInterval(10000) //set the interval for location updates to every minute
                           .SetFastestInterval(1000); //set the fastest interval for location updates to every second
        }

        /// <summary>
        /// Setup the map based on the build version used.
        /// </summary>
        private void mapSetup()
        {
            if (Int32.Parse(Build.VERSION.Sdk) <= 23) //if the android version is older
                mf.GetMapAsync(this); //set the mapFragment

            else
                mView.GetMapAsync(this); //set the mapView
        }

        /// <summary>
        /// On connection failure, attempt to reconnect the client.
        /// </summary>
        /// <param name="result">Connection Result</param>
        public void OnConnectionFailed(ConnectionResult result)
        {
            onConnectionInterrupted();
        }

        /// <summary>
        /// On client connection, get the last known location of the client and set up the map.
        /// </summary>
        /// <param name="connectionHint">Connection Hint</param>
        public void OnConnected(Bundle connectionHint)
        {
            myLocation = location.GetLastLocation(client); //once the client is connected, get the last known location of the device
            mapSetup(); //now that client is connected, attempt to setup map
            location.RequestLocationUpdates(client, locationRequest, this); //request location updates using the created client and locationRequest objects
        }

        /// <summary>
        /// On connection suspension, attempt to reconnect the client.
        /// </summary>
        /// <param name="cause">Cause of connection failure</param>
        public void OnConnectionSuspended(int cause)
        {
            onConnectionInterrupted();
        }

        /// <summary>
        /// If the volunteer's location has changed, get the new GPS coordinates and set the marker and camera to the new location.
        /// </summary>
        /// <param name="location">Current location</param>
        public void OnLocationChanged(Location location)
        {
            LatLng userPosition = new LatLng(location.Latitude, location.Longitude);
            volunteerMarker.SetPosition(userPosition);
            Task.Run(() => updateLatLng(myID, userPosition.Latitude.ToString(), userPosition.Longitude.ToString()));

            if(isPaired)
            {
                LatLng pairPosition = new LatLng(location.Latitude, location.Longitude + 0.0005);
                pairMarker.SetPosition(pairPosition);
                Task.Run(() => updateLatLng(vlnteerID, pairPosition.Latitude.ToString(), pairPosition.Longitude.ToString()));
            }
        }

        /// <summary>
        /// On provider disabled.
        /// </summary>
        /// <param name="provider">Provider</param>
        public void OnProviderDisabled(string provider)
        {
           //Do nothing 
        }

        /// <summary>
        /// On provider enabled.
        /// </summary>
        /// <param name="provider">Provider.</param>
        public void OnProviderEnabled(string provider)
        {
            //Do nothing
        }

        /// <summary>
        /// On status changed.
        /// </summary>
        /// <param name="provider">Provider</param>
        /// <param name="status">Status</param>
        /// <param name="extras">Extras</param>
        public void OnStatusChanged(string provider, [GeneratedEnum] Availability status, Bundle extras)
        {
            //Do nothing
        }

        /// <summary>
        /// When the map is ready to be displayed, get a reference to the map and display the volunteers initial position
        /// </summary>
        /// <param name="googleMap">Google map to be displayerd</param>
        public void OnMapReady(GoogleMap googleMap)
        {
            map = googleMap; //set the created googleMap to the map variables
            map.UiSettings.CompassEnabled = false; //disable compass
            map.UiSettings.MapToolbarEnabled = false; //disable map toolbar

            if (client.IsConnected) //if the client is still connected
            {
                LatLng position = new LatLng(myLocation.Latitude, myLocation.Longitude);
                volunteerMarker = new MarkerOptions();
                volunteerMarker.SetTitle("You")
                               .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed)) //set the current position of the volunteer using a marker
                               .SetPosition(position);
                CameraPosition cameraPosition = new CameraPosition.Builder().Target(position)
                                                                            .Zoom(15)
                                                                            .Tilt(45)
                                                                            .Build();
                volunteerMark = map.AddMarker(volunteerMarker); //add the marker on the map
                map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cameraPosition));
            }

            else
                client.Reconnect(); //attempt to reconnect the client
        }

        /// <summary>
        /// Asynchronous task that retrieves user requests from requests API
        /// </summary>
        /// <returns>User foot patrol requests</returns>
        private async Task<List<string>> getRequests()
        {
            HttpClient httpClient = new HttpClient(); //create a new HttpClient
            Uri customURI = new Uri(backendURI + getRequestURI); //get the URI to the API
            var response = await httpClient.GetAsync(customURI); //get the asynchronous response

            try
            {
                response.EnsureSuccessStatusCode(); //make sure the response returns with the correct status code
                List<string> requestArray = new List<string>(); //initialize a new list of requests
                var responseContent = await response.Content.ReadAsStringAsync(); //get the content of the response
                var o = JObject.Parse(responseContent); //parse the response using JObject from Newtonsoft JSON library
                var requests = o.SelectToken("requests").ToList(); //get each request from JToken List
                foreach (JToken a in requests)
                {
                    requestArray.Add(a.ToString()); //for each token in the list, add it to the newly created request array
                }

                return requestArray; 
            }

            catch (Exception error)
            {
                createAlert("The task to get user requests failed! The error is: " + error);
                return null;
            }
        }

        private async Task<List<string>> getVolunteers()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + getVolunteerURI);
            var response = await httpClient.GetAsync(customURI); //get the asynchronous response

            try 
            {
                response.EnsureSuccessStatusCode(); //make sure the response returns with the correct status code
                volunteerArray = new List<string>();
                volunteerID = new List<int>();
                var responseContent = await response.Content.ReadAsStringAsync();
                var content = JObject.Parse(responseContent);
                var volunteers = content.SelectToken("volunteers").ToList();

                foreach(JToken a in volunteers)
                {
                    volunteerArray.Add(a.SelectToken("first_name").ToString() + " " + a.SelectToken("last_name").ToString());
                    volunteerID.Add(Int32.Parse(a.SelectToken("id").ToString()));
                }

                return volunteerArray;
            }

            catch (Exception error)
            {
                createAlert("The task to get volunteers failed! The error is: " + error);
            }

            return null;
        }

        /// <summary>
        /// The request click listener.
        /// </summary>
        private void onRequestClick()
        {
            if (request.Count == 0)
            {
                createAlert("There are no requests to be fulfilled!"); //if there are no requests, display alert
            }

            else
            {
                ra = RequestsActivity.newInstance(request); //create a new dialog fragment and pass the request list and amount of requests
                ra.Show(this.FragmentManager, "Requests"); //show the new dialog fragment
            }
        }

        /// <summary>
        /// Set the font to the appropriate 
        /// </summary>
        /// <param name="font">Font</param>
        /// <param name="text">Textview Object</param>
        private void setFont(Typeface font, TextView text)
        {
            text.SetTypeface(font, TypefaceStyle.Normal);
        }

        /// <summary>
        /// If the request is accepted, call the position for address task (translates string location to gps coordinates).
        /// Then set the position of the user as a marker on the map. 
        /// Then retrieve the polyline pattern from the Google Directions API and decode the polyline and display the result on the map.
        /// Finally remove the request from the list of requests.
        /// </summary>
        /// <param name="request">The accepted request</param>
        public void onTripAcceptAsync(UserRequests.Request request)
        {
            acceptedRequest = request;

            ra.dismissFragment(); //dismiss the request dialog fragment
            removeRequestUI(); //remove the trip UI so that the volunteer can accept more requests

            if (!(isPaired))
            {
                updateSearchUI();
                searchViewDescription.Text = "PICKUP PENDING PAIRING";
                pickupPending = true;
            }

            else
            {
                searchViewDescription.Text = "SEARCH FOR VOLUNTEER";
                startTrip(acceptedRequest);
            }
        }

        /// <summary>
        /// Gets the GPS coordinates of a string address and converts it to GPS coordinates using the Google Geocoder API
        /// </summary>
        /// <returns>The string position of the address.</returns>
        /// <param name="address">Address</param>

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

            catch (Exception error)
            {
                createAlert("The task to get user requests failed! The error is: " + error);
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

        /// <summary>
        /// Gets the polyline pattern using the Google Directions API, by specifying the start and end locations.
        /// As an intermediate step also saves directions into a string array to be displayed in UI.
        /// </summary>
        /// <returns>The polyline representing directions between start and destination locations</returns>
        /// <param name="start">Start</param>
        /// <param name="dest">Destination</param>
        private async Task<string> getPolyPat(string start, string dest)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri("https://maps.googleapis.com/maps/api/directions/json?origin=" + start + "&destination=" + dest + "&mode=walking&key=AIzaSyDQMcKBqfQwfRC88Lt02V8FP5yGPUqIq04");
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (Exception error)
            {
                createAlert("The task failed with exception: " + error);
            }

            var content = await response.Content.ReadAsStringAsync();
            JObject dir = JObject.Parse(content);
            string polyPattern = (string)dir.SelectToken("routes[0].overview_polyline.points");
            var stepDirections = dir.SelectTokens("routes[0].legs[0].steps[*].html_instructions");
            steps = new List<string>();

            foreach(JToken step in stepDirections)
            {
               steps.Add(step.ToString());
            }

            //use regex to remove all unnecessary html tags from directions
            for (int i = 0; i < steps.Count; i++)
            {
                steps[i] = Regex.Replace(steps[i], "<style>(.|\n)*?</style>", string.Empty);
                steps[i] = Regex.Replace(steps[i], @"<xml>(.|\n)*?</xml>", string.Empty);
                steps[i] = Regex.Replace(steps[i], @"<(.|\n)*?>", string.Empty);

                //for proper formatting, separate words that are attached
                if(steps[i].Contains("Destination")) //if the step is the last step
                {
                    int spaceIndex = steps[i].IndexOf("Destination", StringComparison.CurrentCulture); //find the index of destination
                    string substring = steps[i].Substring(spaceIndex); //get the substring containing the destination
                    steps[i] = steps[i].Remove(spaceIndex); //remove destination from the step
                    steps.Add(substring); //make a new step containing destination information
                    break;
                }
            }
            return polyPattern;
        }

        /// <summary>
        /// Decodes the polyline from a mix of random characters to a list of latitude and longitude points.
        /// </summary>
        /// <returns>The decoded polyline.</returns>
        /// <param name="encodedPoints">Encoded points</param>
        private List<LatLng> DecodePolyline(string encodedPoints)
        {
            //if no directions are passed, return nothing
            if (string.IsNullOrWhiteSpace(encodedPoints))
            {
                return null;
            }

            int index = 0; //start with the first character
            var polylineChars = encodedPoints.ToCharArray(); //change the string to a character array to analyze each character
            var polyline = new List<LatLng>(); //initialize the new list of LatLng points

            //initialize each variable
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
                    next5Bits = polylineChars[index++] - 63; //subtract 63 from each value
                    sum |= (next5Bits & 31) << shifter; //bitwise or each set of 5 bits with the address of the last value and left shift by an increment of 5 bits
                    shifter += 5; //increment shift by 5 to look at the next 5 bits
                }
                while (next5Bits >= 32 && index < polylineChars.Length); //do this while there are still 5-bit chunks

                if (index >= polylineChars.Length) //break out of the while loop if the character array is empty or the index is larger than the size of the char array
                {
                    break;
                }

                currentLat += (sum & 1) == 1 ? ~(sum >> 1) : (sum >> 1); //convert the binary value to decimal

                // calculate longitude using same steps as above
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

                var mLatLng = new LatLng(Convert.ToDouble(currentLat) / 100000.0, Convert.ToDouble(currentLng) / 100000.0); //divide each result by 1e5 to get the decimal value
                polyline.Add(mLatLng); //add the polyline to the set of LatLng points
            }
            return polyline;
        }

        /// <summary>
        /// Click listener for the side tab.
        /// </summary>
        /// <param name="btn">Button</param>
        /// <param name="drawer">Drawer</param>
        /// <param name="list">List</param>
        private void sideTabClicked(ImageButton btn, DrawerLayout drawer, ListView list)
        {
            if (drawer.IsDrawerOpen(list))
            {
                btn.SetX(0); //set the button to its initial position
                drawer.CloseDrawer(list); //close the drawer
            }

            else
            {
                drawer.OpenDrawer(list); //if the drawer isn't open, open it
            }
        }

        /// <summary>
        /// Button listener for the complete trip button.
        /// </summary>
        private void completeBtnClicked()
        {
            if (completeTripBtn.Text == "COMPLETE TRIP")
            {
                AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
                builder.SetTitle("Complete Trip")
                       .SetMessage("Are you sure you want to complete the trip?")
                       .SetPositiveButton("Yes", (sender, e) =>
                {
                    disableUI();
                    Task.Run(() => updateRequestStatus("COMPLETED", true));
                    if (Int32.Parse(Build.VERSION.Sdk) > 23)
                        mListView.GetChildAt(2).Enabled = true;

                    else
                        mfListView.GetChildAt(2).Enabled = true;

                }).SetNegativeButton("No", (sender, e) =>
                {
                    //Do nothing
                });

                Dialog dialog = builder.Create();
                dialog.Show(); //show the dialog
            }

            else
            {
                completeTripBtn.Text = "COMPLETE TRIP";
                poly.Remove();
                userMark.Remove();
                userPickedUp();
            }
        }

        /// <summary>
        /// Removes the request UI from the view.
        /// </summary>
        private void removeRequestUI()
        {
            notificationBase.Visibility = ViewStates.Gone;
            notificationBadge.Visibility = ViewStates.Gone;
            badgeCounter.Visibility = ViewStates.Gone;
        }

        /// <summary>
        /// Removes the trip UI from the view.
        /// </summary>
        private void disableUI()
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

            enableRequestUI();

            poly.Remove();
            userMark.Remove();
        }

        /// <summary>
        /// Creates an alert specified by the string parameter.
        /// </summary>
        /// <param name="alert">Alert.</param>
        private void createAlert(string alert)
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetMessage(alert)
                   .SetNeutralButton("OK", (sender, e) =>
            {
                //Do nothing
            });

            Dialog dialog = builder.Create();
            dialog.Show();
        }

        /// <summary>
        /// The handler to modify the badgecounter total amount of requests in the requests UI.
        /// </summary>
        protected Handler handler = new Handler((Message obj) =>
        {
            int requestCount = obj.Arg1;
            badgeCounter.Text = requestCount.ToString();
        });

        /// <summary>
        /// Retrieve requests by running the getRequests task and pass the number of requests through a handler to be shown on the UI thread
        /// </summary>
        /// <param name="state">State</param>
        private void retrieveRequests(object state)
        {
            request = Task.Run(() => getRequests()).Result;
            int requestCount = request.Count;
            Message msg = handler.ObtainMessage();
            msg.Arg1 = requestCount;
            handler.SendMessage(msg);
        }

        /// <summary>
        /// If the client has failed to connect, attempt to reconnect the client, otherwise notify the user.
        /// </summary>
        private void onConnectionInterrupted()
        {
            try
            {
                client.Reconnect(); //attempt to reconnect the client
            }

            catch
            {
                createAlert("Could not connect to google API client, please try again later."); //if the client cannot be connected, display alert
            }
        }

        private void selectItem(int position)
        {
            switch (position)
            {
                case 0:
                    fragment = new NonEmergencyContactsActivity();
                    tag = "NonEmergencyContactsActivity";
                    break;

                case 1:
                    fragment = new CampusMapsActivity();
                    tag = "CampusMapsActivity";
                    break;

                case 2:
                    if (!isPaired)
                        updateSearchUI();
                    else
                    {
                        Task.Run(() => setPairActive(false));
                        isPaired = false;
                        pairID = 0;
                        pairMark.Remove();
                    }
                    break;
            }

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                mDrawerLayout.CloseDrawer(mListView); //close the drawer when entering new view
                if (position != 2)
                    switchFragment(fragment, Resource.Id.drawer_layout, tag);
            }

            else
            {
                mfDrawerLayout.CloseDrawer(mfListView); //close the drawer when entering new view
                if (position != 2)
                    switchFragment(fragment, Resource.Id.drawer_layout1, tag);
            }
        }

        private void confirmFootPatroller(string fpName)
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetMessage("Are you sure you would like to pair with " + fpName + "?")
                   .SetPositiveButton("Yes", (sender, e) =>
                   {
                       int position = findPosition(fpName);
                       int vID = volunteerID[position];
                       vlnteerID = vID;
                       pairID = Task.Run(() => pairFootPatrollers(vID)).Result;
                       Task.Run(() => setPairActive(true));
                       clearSearchView();

                       if (pickupPending)
                       {
                           startTrip(acceptedRequest);
                       }
                       else
                       {
                           enableRequestUI();
                       }
                       pairMarker = new MarkerOptions();
                       pairMarker.SetTitle(fpName)
                                 .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueGreen))
                                 .SetPosition(new LatLng(myLocation.Latitude, myLocation.Longitude + 0.0005));
                       pairMark = map.AddMarker(pairMarker);
                       removeSearchUI();
                      
                       isPaired = true;
                   })
                   .SetNegativeButton("No", (sender, e) =>
                   {
                       //Do nothing
                   });

            Dialog dialog = builder.Create();
            dialog.Show();
        }

        private void switchFragment(Android.Support.V4.App.Fragment frag, int resource, string t)
        {
            Android.Support.V4.App.FragmentTransaction fragmentTransaction = this.Activity.SupportFragmentManager.BeginTransaction(); //begin the fragment transaction
            fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation); //add animation to slide new fragment to the left
            fragmentTransaction.AddToBackStack("VolunteerActivity");
            fragmentTransaction.Replace(resource, frag, t);
            fragmentTransaction.Commit(); //commit the transaction
        }

        private void updateSearchUI()
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

            removeRequestUI();
            searchView.Visibility = ViewStates.Visible;
            searchViewDescription.Visibility = ViewStates.Visible;
        }

        private async Task<int> pairFootPatrollers(int vID)
        {
            //First check whether the pair already exists
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + postInactivePairURI);
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
                var responseString = await response.Content.ReadAsStringAsync();
                var parsedString = JObject.Parse(responseString);
                var pairs = parsedString.SelectTokens("pairs[*]");
                foreach(JToken pair in pairs)
                {
                    var firstID = pair.SelectToken("volunteers[0].id");
                    var secondID = pair.SelectToken("volunteers[1].id");
                    var pairingID = pair.SelectToken("id");

                    //We've found a match
                    if (Int32.Parse(firstID.ToString()) == myID && vID == Int32.Parse(secondID.ToString()))
                    {
                        return Int32.Parse(pairingID.ToString());
                    }
                }
            }

            catch(Exception e)
            {
                createAlert("There was an exception " + e);
            }
            //Otherwise create the new pairing and get the pairID

            customURI = new Uri(backendURI + postPairURI);
            var content = new VolunteerPairs
            {
                active = true,
                volunteers = new int[2] {myID, vID}
            };

            var stringContent = JsonConvert.SerializeObject(content);
            HttpContent httpContent = new StringContent(stringContent,Encoding.UTF8, "application/json");
            response = await httpClient.PostAsync(customURI, httpContent);

            try 
            {
                response.EnsureSuccessStatusCode();
                var responseString = await response.Content.ReadAsStringAsync();
                var jObj = JObject.Parse(responseString);
                var pairingID = jObj.SelectToken("id");

                return Int32.Parse(pairingID.ToString());
            }

            catch(Exception e)
            {
                createAlert("There was an exception! The error was: " + e);
            }

            return 0;
        }

        private void enableRequestUI()
        {
            badgeCounter.Visibility = ViewStates.Visible;
            notificationBase.Visibility = ViewStates.Visible;
            notificationBadge.Visibility = ViewStates.Visible;
        }

        private int findPosition(string volunteer)
        {
            for (var i = 0; i < fpNames.Count; i++)
            {
                if (fpNames[i] == volunteer)
                    return i;
            }

            return -1;
        }

        private void startTrip(UserRequests.Request requestedTrip)
        {
            completeTripBtn.Text = "PICKED UP USER";

            //Set UI elements to display pickup information
            userName.Text = "Name: " + requestedTrip.name;
            toLoc.Text = "End Location: " + requestedTrip.toLoc;
            fromLoc.Text = "Start Location: " + requestedTrip.fromLoc;
            addInfo.Text = "Additional Information: " + requestedTrip.addInfo;
            pickupInfo.Text = "Pickup Information";

            Task.Run(() => updateRequestStatus("IN_PROGRESS", false));

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
                mListView.GetChildAt(2).Enabled = false;

            else
                mfListView.GetChildAt(2).Enabled = false;
            
            string userLocation = requestedTrip.fromLoc;
            string[] latLng = userLocation.Split(' ');

            double latitude = Double.Parse(latLng[0]);
            double longitude = Double.Parse(latLng[1]);

            userMarker = new MarkerOptions();

            userMarker.SetPosition(new LatLng(latitude, longitude))
                      .SetTitle(name)
                      .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueBlue)); //add the user starting location as a marker on the screen
            userMark = map.AddMarker(userMarker); //add the map marker to the screen and return a reference so that it can be removed

            string currentLocation = myLocation.Latitude.ToString() + "," + myLocation.Longitude.ToString();
            string destinationLocation = latitude.ToString() + "," + longitude.ToString();

            var polyPattern = Task.Run(() => getPolyPat(currentLocation, destinationLocation)).Result; //get the poly pattern character string

            List<LatLng> polyline = DecodePolyline(polyPattern); //decode the character string into a polyline that can be displayed on the map
            polyOptions = new PolylineOptions().InvokeColor(Color.Blue).InvokeWidth(10); //create the new polyline as a blue line of 10 thickness

            foreach (LatLng point in polyline)
            {
                polyOptions.Add(point); //for each point in the LatLng list, add the separate polyline to the polyline options
            }

            poly = map.AddPolyline(polyOptions); //display the polyline on the map

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
        }

        private async Task<string> updateRequestStatus(string status, bool archived)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + "/requests/" + acceptedRequest.id.ToString());

            var content = new RequestStatus
            {
                archived = archived,
                pairing = pairID,
                status = status
            };

            var stringContent = JsonConvert.SerializeObject(content);
            HttpContent httpContent = new StringContent(stringContent, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await httpClient.PatchAsync(customURI, httpContent);

            try
            {
                response.EnsureSuccessStatusCode();
                var responseString = await response.Content.ReadAsStringAsync();
                var jObj = JObject.Parse(responseString);

                return "";
            }

            catch (Exception e)
            {
                createAlert("There was an exception! The error was: " + e);
            }

            return "";  
        }

        private void userPickedUp()
        {
            //Set UI elements to display pickup information
            userName.Text = "Name: " + acceptedRequest.name;
            toLoc.Text = "End Location: " + acceptedRequest.toLoc;
            fromLoc.Text = "Start Location: " + acceptedRequest.fromLoc;
            addInfo.Text = "Additional Information: " + acceptedRequest.addInfo;
            pickupInfo.Text = "Pickup Information";

            var address = to_location; //set the starting user destination as the address
            address = address + " Western University"; //concatenate the address with Western University to narrow the search
            var approximateLocation = Task.Run(() => getPositionForAddress(address)).Result; //get GPS coordinates of the approximate location

            //store the latitude and longitude in separate double variables
            double latitude = System.Double.Parse(approximateLocation[0]);
            double longitude = System.Double.Parse(approximateLocation[1]);

            LatLng userCoordinates = new LatLng(latitude, longitude); //initialize new LatLng object to define user coordinates

            userMarker.SetPosition(userCoordinates)
                      .SetTitle(name)
                      .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueBlue)); //add the user starting location as a marker on the screen
            userMark = map.AddMarker(userMarker); //add the map marker to the screen and return a reference so that it can be removed

            //store the volunteer and user coordinates in separate variables
            string currentLocation = myLocation.Latitude.ToString() + "," + myLocation.Longitude.ToString();
            string destinationLocation = userCoordinates.Latitude.ToString() + "," + userCoordinates.Longitude.ToString();

            var polyPattern = Task.Run(() => getPolyPat(currentLocation, destinationLocation)).Result; //get the poly pattern character string

            List<LatLng> polyline = DecodePolyline(polyPattern); //decode the character string into a polyline that can be displayed on the map
            polyOptions = new PolylineOptions().InvokeColor(Color.Blue).InvokeWidth(10); //create the new polyline as a blue line of 10 thickness

            foreach (LatLng point in polyline)
            {
                polyOptions.Add(point); //for each point in the LatLng list, add the separate polyline to the polyline options
            }

            poly = map.AddPolyline(polyOptions); //display the polyline on the map

            //Depending on Android version, display the directions in the UI and set the adapter and add complete and cancel trip buttons to UI also
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
        }

        private void removeSearchUI()
        {
            searchView.Visibility = ViewStates.Gone;
            fpListView.Visibility = ViewStates.Gone;
            searchViewDescription.Visibility = ViewStates.Gone;
            clearSearchView();
        }

        private async Task<string> setPairActive(bool isActive)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + postPairURI + pairID.ToString() + "/active");

            var content = new VPairStatus {
                active = isActive
            };

            var stringContent = JsonConvert.SerializeObject(content);
            HttpContent httpContent = new StringContent(stringContent, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await httpClient.PostAsync(customURI, httpContent);

            try 
            {
                response.EnsureSuccessStatusCode();
            }

            catch(Exception e)
            {
                createAlert("The exception is: " + e);
            }

            return "";
        }

        private void clearSearchView()
        {
            searchView.SetQuery("", true);
            InputMethodManager manager = (InputMethodManager)this.Activity.GetSystemService(Context.InputMethodService);
            manager.HideSoftInputFromWindow(searchView.WindowToken, 0);
        }

        private async Task<string> updateLatLng(int ID, string lat, string lng)
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + updateVolunteerURI + ID.ToString());
            var Timestamp = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString();

            var content = new UpdateVolunteer
            {
                latitude = lat,
                longitude = lng,
                timestamp = Timestamp
            };

            var serializedContent = JsonConvert.SerializeObject(content);
            HttpContent httpContent = new StringContent(serializedContent, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await httpClient.PatchAsync(customURI, httpContent);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch(Exception e)
            {
                createAlert("The task failed to complete due to exception " + e);
            }

            return "";
        }
    }
}
