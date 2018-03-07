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
using Android.Gms.Common;
using Android.Runtime;
using Android.Widget;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Android.Support.V7.Widget;
using Android.Support.V4.Widget;
using System.Threading;
using static Android.Widget.AdapterView;

namespace FootPatrol.Droid
{
    [Activity(Label = "VolunteerActivity")]
    public class VolunteerActivity : Android.Support.V4.App.Fragment, GoogleApiClient.IOnConnectionFailedListener, GoogleApiClient.IConnectionCallbacks, Android.Gms.Location.ILocationListener, IOnMapReadyCallback
    {
        public static string name, to_location, from_location, additional_info; //variables to keep name, location and additional information of user
        public static int id;

        private Typeface bentonSans; //font to be used in application
        private ArrayAdapter<System.String> listAdapter; //adapter to help display directions
        //private bool pickupComplete = false;

        private static SupportMapFragment mf; //fragment that displays map on < API 24
        private static Button completeTripBtn; //buttons to complete trip
        private static DrawerLayout mDrawerLayout, mfDrawerLayout; //drawer layouts for new and older android devices
        private static ImageButton mSideTab, mfSideTab; //side tab buttons for each view
        private static MapView mView; //mapView that displays map on >= API 24
        private static ImageView notificationBase, notificationBadge; //UI for displaying requests
        public static TextView badgeCounter; //counter that displays number of requests available to the volunteer
        private static ListView mListView, mfListView; //list views for both new and older android devices
        private static RecyclerView mRecyclerView, mfRecyclerView; //recycler views that display directions for new and older android devices
        private static RecyclerView.LayoutManager layoutManager; //layout manager for recycler view
        private static RelativeLayout mRelativeLayout, mfRelativeLayout; //relative layouts to display status of complete, cancel and pickup on trip

        private static string backendURI, getURI;

        public static List<string> request, steps; //lists to hold information on requests and direction steps
        public string[] menuItems; //list of menu items to be displayed in side tab
        public static RequestsActivity ra; //get a reference to each request object

        private static GoogleMap map; //reference to created google map
        private static Marker userMark; //user marker to be displayed on map
        private static View view; //the current view
        private static VolunteerActivity va; //reference to new instance of VolunteerActivity
        private static GoogleApiClient client; //the Google API client used to connect to Google Play Store
        private static Location myLocation; //the volunteer's current location
        private IFusedLocationProviderApi location; //location of the volunteer
        private LocationRequest locationRequest; //a new location request object so that location can be updated
        private MarkerOptions volunteerMarker, userMarker; //marker options to be used for each marker on map
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

            menuItems = new string[] { "EMERGENCY CONTACTS", "CAMPUS MAPS", "PAIR FOOT PATROLLERS", "CHECK-IN"}; //initializes list to displayed in listView 

            listAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, menuItems); //initializes ArrayAdapter to be displayed in listView
            layoutManager = new LinearLayoutManager(this.Context, LinearLayoutManager.Horizontal, false); //initializs the directions layout to be horizontal and sidescrolling
            backendURI = "http://staging.capstone.incode.ca/api/v1/requests/";
            getURI = "?offset=0&count=9&archived=true";
            request = new List<string>();

            TimerCallback time = new TimerCallback(retrieveRequests); //create a new timerCallback to be used in timer
            Timer timer = new Timer(time, 0, 0, 1000); //use the timerCallback to check for user requests every second

            try
            {
                MapsInitializer.Initialize(this.Context); //initialize the Google Maps Android API
            }

            catch (Exception e)
            {
                createAlert("Unable to initialize the map, the error is: " + e);
            }

            volunteerMarker = new MarkerOptions(); //initialize the volunteer MarkerOptions

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
                mSideTab = (ImageButton)view.FindViewById(Resource.Id.sideTabBtn);
                mDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.drawer_layout);
                mRelativeLayout = (RelativeLayout)view.FindViewById(Resource.Id.innerRelative);
                completeTripBtn = (Button)view.FindViewById(Resource.Id.completeTripBtn);
                mRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView1);
                mView = (MapView)view.FindViewById(Resource.Id.map);

                mRelativeLayout.Visibility = ViewStates.Gone; //set the visibility of the complete trip UI to gone
                mRecyclerView.Visibility = ViewStates.Gone; //set the visibility of the directions UI to gone

                mRecyclerView.SetLayoutManager(layoutManager); //set the layout manager of the recyclerview to display direction

                //onClick listeners for each interactable UI element
                mSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mSideTab, mDrawerLayout, mListView);
                };

                completeTripBtn.Click += (sender, e) =>
                {
                    //if (pickupComplete)
                    completeBtnClicked();

                    //else
                        //pickUpClicked();
                };

                mListView.SetAdapter(listAdapter); //set the listView adapter to the adapter initialized in the view
                mListView.ItemClick += (sender, e) => //listView click listener
                {
                    selectItem(e.Position);
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
                mfDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.drawer_layout1);
                mfRelativeLayout = (RelativeLayout)view.FindViewById(Resource.Id.innerRelative1);
                completeTripBtn = (Button)view.FindViewById(Resource.Id.completeTripBtn1);
                mf = (SupportMapFragment)this.ChildFragmentManager.FindFragmentById(Resource.Id.map2);
                mfRecyclerView = (RecyclerView)view.FindViewById(Resource.Id.recyclerView2);

                //set visibilities to gone of UI elements not presently used
                mfRecyclerView.Visibility = ViewStates.Gone;
                mfRelativeLayout.Visibility = ViewStates.Gone;

                mfRecyclerView.SetLayoutManager(layoutManager); //set the layout manager of the recyclerView

                mfListView.SetAdapter(listAdapter); //set the listView adapter
                mfListView.ItemClick += (sender, e) => //listView click listener
                {
                    selectItem(e.Position);
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
            setMarker(new LatLng(location.Latitude, location.Longitude)); //create new LatLng object representing new volunteer position
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
                volunteerMarker = new MarkerOptions();
                setMarker(new LatLng(myLocation.Latitude, myLocation.Longitude));
                map.AddMarker(volunteerMarker); //add the marker on the map
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
            Uri customURI = new Uri(backendURI + getURI); //get the URI to the API
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
            //Set variables to save user information from request
            name = request.name;
            to_location = request.toLoc;
            from_location = request.fromLoc;
            additional_info = request.addInfo;
            id = request.id;

            var address = from_location; //set the starting user destination as the address
            address = address + " Western University"; //concatenate the address with Western University to narrow the search
            var approximateLocation = Task.Run(() => getPositionForAddress(address)).Result; //get GPS coordinates of the approximate location

            //store the latitude and longitude in separate double variables
            double latitude = System.Double.Parse(approximateLocation[0]); 
            double longitude = System.Double.Parse(approximateLocation[1]);

            userMarker = new MarkerOptions(); //initialize a new set of marker options to be used for the user
            LatLng userCoordinates = new LatLng(latitude, longitude); //initialize new LatLng object to define user coordinates

            ra.dismissFragment(); //dismiss the request dialog fragment

            userMarker.SetPosition(userCoordinates)
                      .SetTitle(name)
                      .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueBlue)); //add the user starting location as a marker on the screen
            userMark = map.AddMarker(userMarker); //add the map marker to the screen and return a reference so that it can be removed

            removeRequestUI(); //remove the trip UI so that the volunteer can accept more requests

            //store the volunteer and user coordinates in separate variables
            string currentLocation = myLocation.Latitude.ToString() + "," + myLocation.Longitude.ToString();
            string destinationLocation = userCoordinates.Latitude.ToString() + "," + userCoordinates.Longitude.ToString();

            var polyPattern = Task.Run(() => getPolyPat(currentLocation, destinationLocation)).Result; //get the poly pattern character string

            List<LatLng> polyline = DecodePolyline(polyPattern); //decode the character string into a polyline that can be displayed on the map
            polyOptions = new PolylineOptions().InvokeColor(Color.Blue).InvokeWidth(10); //create the new polyline as a blue line of 10 thickness

            foreach(LatLng point in polyline)
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

            HttpClient httpClient = new HttpClient(); //create a new HTTP client
            string userID = id.ToString();
            System.Diagnostics.Debug.WriteLine("The custom uri is: " + backendURI + userID);
            Uri customURI = new Uri(backendURI + userID);
            httpClient.DeleteAsync(customURI); //delete the accepted request from all requests
                
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
                System.Diagnostics.Debug.WriteLine("The exception is: " + error);
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

            for (int i = 0; i < steps.Count;i++)
            {
                steps[i] = steps[i].Replace("<b>", "");
                steps[i] = steps[i].Replace("</b>", "");
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

        private void pickUpClicked()
        {
            //completeTripBtn.Text = "COMPLETE TRIP";
            //pickupComplete = true;
        }

        /// <summary>
        /// Button listener for the complete trip button.
        /// </summary>
        private void completeBtnClicked()
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetTitle("Complete Trip")
                   .SetMessage("Are you sure you want to complete the trip?")
                   .SetPositiveButton("Yes", (sender, e) =>
            {
                postTripUI(); //on completed trip, update UI to accept more requests
                //completeTripBtn.Text = "PICKED UP USER";
                //pickupComplete = false;

            }).SetNegativeButton("No", (sender, e) =>
            {
                //Do nothing
            });
                                                                                                                          
            Dialog dialog = builder.Create();
            dialog.Show(); //show the dialog
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

        private void setMarker(LatLng position)
        {
            volunteerMarker.SetPosition(position)
                               .SetTitle("Volunteer")
                               .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed)); //set the current position of the volunteer using a marker
            CameraPosition cp = new CameraPosition.Builder().Target(position)
                                                  .Zoom(15)
                                                  .Bearing(90)
                                                  .Tilt(40)
                                                  .Build(); //setup a new camera position
            map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cp)); //animate the camera to the new camera position
        }

        private void selectItem(int position)
        {
            switch (position)
            {
                case 0:
                    fragment = new EmergencyContactsActivity();
                    tag = "EmergencyContactsActivity";
                    break;

                case 1:
                    fragment = new CampusMapsActivity();
                    tag = "CampusMapsActivity";
                    break;

                case 2:
                    //fragment = new CampusMapsActivity();
                    //tag = "CampusMapsActivity";
                    break;

                case 3:
                    //fragment = new CampusMapsActivity();
                    //tag = "CampusMapsActivity";
                    break;
            }

            Android.Support.V4.App.FragmentTransaction fragmentTransaction = ChildFragmentManager.BeginTransaction(); //begin the fragment transaction
            fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation); //add animation to slide new fragment to the left

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                mDrawerLayout.CloseDrawer(mListView);
                fragmentTransaction.Replace(Resource.Id.drawer_layout, fragment, tag); //replace the old fragment with the new on
            }

            else
            {
                mfDrawerLayout.CloseDrawer(mfListView);
                fragmentTransaction.Replace(Resource.Id.drawer_layout1, fragment, tag);
            }

            fragmentTransaction.AddToBackStack(null); //add the transaction to the back stack
            fragmentTransaction.Commit(); //commit the transaction

       
        }
    }
}
