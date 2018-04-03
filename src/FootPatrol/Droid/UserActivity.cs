using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Common.Apis;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.Gms.Location;
using Android.Locations;
using System;
using Xamarin.Forms;
using System.Text;
using Android.Gms.Common;
using Android.Widget;
using Android.Views.InputMethods;
using Android.Support.V4.Widget;
using Android.Content;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Threading;
using System.Collections.Generic;
using Java.Lang;

namespace FootPatrol.Droid
{
    [Activity(Label = "UserActivity")]
    public class UserActivity : Android.Support.V4.App.Fragment, GoogleApiClient.IOnConnectionFailedListener, GoogleApiClient.IConnectionCallbacks, Android.Gms.Location.ILocationListener, IOnMapReadyCallback
    {
        private static GoogleApiClient client; //the Google API client used to connect to Google Play Store
        private static Location myLocation; //the volunteer's current location
        private IFusedLocationProviderApi location; //location of the volunteer
        private LocationRequest locationRequest; //a new location request object so that location can be updated
        private static GoogleMap map; //reference to created google map
        private static MapView mView; //mapView that displays map on >= API 24
        private static SupportMapFragment mf; //fragment that displays map on < API 24
        private static ImageButton sideTab; //side tab buttons for each view
        private static Android.Widget.Button pickUpBtn;
        private static EditText userName, destination, additionalInfo;
        private static Android.Widget.ListView listView, searchListView;
        private static MarkerOptions userMarker, pairOneMarker, pairTwoMarker;
        private static CircleOptions circle;
        private static DrawerLayout drawerLayout;
        private static Android.Widget.RelativeLayout relativeLayout, acceptedRequestLayout;
        private static Android.Views.View view; //the current view
        private static TextView svDescription;
        private static ArrayAdapter<System.String> listAdapter, locationAdapter;
        private static Android.Widget.SearchView searchView;
        private static string[] menuItems, locationNames;
        private static string backendURI, postRequestURI, findPairsURI;
        public int requestID, pairingID;
        private static Android.Widget.ProgressBar spinner;
        private static TimerCallback tc, circleCB;
        public static Timer timer, circleTimer;
        private static Circle mapCircle;
        public static LatLng volunteerOneLatLng, volunteerTwoLatLng;
        private static PolylineOptions polyOptions;
        private static Polyline poly;
        private static UserActivity ua;
        public static volatile int counter;

        public string tag;
        public Android.Support.V4.App.Fragment fragment;

        public override Android.Views.View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            ua = new UserActivity();

            Forms.Init(this.Activity,savedInstanceState);
            menuItems = new string[] { "CAMPUS MAPS", "NON-EMERGENCY CONTACTS", "CONTACT US", "ABOUT US", "WHAT WE DO", "VOLUNTEER" };
            locationNames = new string[] {"3M CENTRE" , "ALUMNI HALL" , "BIOLOGY & GEOLOGY SCIENCES", "CHEMISTRY BUILDING" ,
            "ELBORN COLLEGE", "HEALTH SCIENCES BUILDING", "KRESGE BUILDING", "LAWSON HALL", "MIDDLESEX COLLEGE", "NORTH CAMPUS BUILDING", "NATURAL SCIENCES CENTRE",
            "SPENCER ENGINEERING BUILDING", "SOMERVILLE HOUSE", "SOCIAL SCIENCES CENTRE", "STEVENSON HALL", "TALBOT COLLEGE", "THOMPSON ENGINEERING BUILDING", "THAMES HALL", "UNIVERSITY COLLEGE", "UNIVERSITY COMMUNITY CENTRE",
            "VISUAL ARTS CENTRE", "WELDON LIBRARY", "WESTERN SCIENCE CENTRE", "BRESCIA CAMPUS", "HURON CAMPUS", "IVEY BUSINESS SCHOOL",
                "BROUGHDALE HALL (KING'S UNIVERSITY COLLEGE)", "FACULTY BUILDING (KING'S UNIVERSITY COLLEGE)", "WEMPLE HALL (KING'S UNIVERSITY COLLEGE)", "LABATT HALL (KING'S UNIVERSITY COLLEGE)",
                "DANTE LENARDON HALL (KING'S UNIVERSITY COLLEGE"};

            backendURI = Resources.GetString(Resource.String.api_url);
            postRequestURI = "/requests";
            findPairsURI = "/volunteerPairs/";

            listAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, menuItems);
            locationAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, locationNames);

            try
            {
                MapsInitializer.Initialize(this.Context); //initialize the Google Maps Android API
            }

            catch (System.Exception e)
            {
                createAlert("Unable to initialize the map, the error is: " + e);
            }

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                view = inflater.Inflate(Resource.Layout.UserScreen, container, false);
                mView = (MapView)view.FindViewById(Resource.Id.userMap);
                sideTab = (ImageButton)view.FindViewById(Resource.Id.userSideTab);
                drawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.userdrawer);
                listView = (Android.Widget.ListView)view.FindViewById(Resource.Id.userListView);
                searchView = (Android.Widget.SearchView)view.FindViewById(Resource.Id.userSearchView);
                searchListView = (Android.Widget.ListView)view.FindViewById(Resource.Id.userSearchListView);
                svDescription = (TextView)view.FindViewById(Resource.Id.userSVDescription);
                pickUpBtn = (Android.Widget.Button)view.FindViewById(Resource.Id.requestPickupBtn);
                userName = (EditText)view.FindViewById(Resource.Id.userName5);
                destination = (EditText)view.FindViewById(Resource.Id.userToLocation);
                additionalInfo = (EditText)view.FindViewById(Resource.Id.userAdditionalInfo);
                relativeLayout = (Android.Widget.RelativeLayout)view.FindViewById(Resource.Id.userInnerRelative);
                spinner = (Android.Widget.ProgressBar)view.FindViewById(Resource.Id.spinner2);
                acceptedRequestLayout = (Android.Widget.RelativeLayout)view.FindViewById(Resource.Id.acceptedRequestLayout);

                searchListView.Visibility = ViewStates.Gone;
                relativeLayout.Visibility = ViewStates.Gone;
                spinner.Visibility = ViewStates.Gone;
                acceptedRequestLayout.Visibility = ViewStates.Gone;

                listView.Adapter = listAdapter;
                searchListView.Adapter = locationAdapter;

                sideTab.Click += (sender, e) =>
                {
                    sideTabClicked(sideTab, drawerLayout, listView);
                };

                searchView.SetQueryHint("Search for destination");

                searchView.QueryTextChange += (sender, e) =>
                {
                    if (searchView.Query == "")
                    {
                        searchListView.Visibility = ViewStates.Gone;
                    }

                    else
                    {
                        searchListView.Visibility = ViewStates.Visible;
                        locationAdapter.Filter.InvokeFilter(e.NewText);
                    }
                };

                pickUpBtn.Click += (sender, e) =>
                {
                    new spinnerTask(spinner, ua).Execute();
                };

                listView.ItemClick += (sender, e) =>
                {
                    selectItem(e.Position);
                };

                searchListView.ItemClick += (sender, e) =>
                {
                    itemSelected(locationAdapter.GetItem(e.Position));
                };

                mView.OnCreate(savedInstanceState);
                mView.OnStart(); //start loading the map into the mapView
            }

            else
            {
                view = inflater.Inflate(Resource.Layout.UserScreenMF, container, false);
                mf = (SupportMapFragment)this.ChildFragmentManager.FindFragmentById(Resource.Id.userMapMF);
                sideTab = (ImageButton)view.FindViewById(Resource.Id.userSideTabMF);
                drawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.userdrawerMF);
                listView = (Android.Widget.ListView)view.FindViewById(Resource.Id.userListViewMF);
                searchView = (Android.Widget.SearchView)view.FindViewById(Resource.Id.userSearchViewMF);
                searchListView = (Android.Widget.ListView)view.FindViewById(Resource.Id.userSearchListViewMF);
                svDescription = (TextView)view.FindViewById(Resource.Id.userSVDescriptionMF);
                pickUpBtn = (Android.Widget.Button)view.FindViewById(Resource.Id.requestPickupBtn1);
                userName = (Android.Widget.EditText)view.FindViewById(Resource.Id.userName6);
                destination = (EditText)view.FindViewById(Resource.Id.userToLocation1);
                additionalInfo = (EditText)view.FindViewById(Resource.Id.userAdditionalInfo1);
                relativeLayout = (Android.Widget.RelativeLayout)view.FindViewById(Resource.Id.userInnerRelativeMF);
                spinner = (Android.Widget.ProgressBar)view.FindViewById(Resource.Id.spinner3);
                acceptedRequestLayout = (Android.Widget.RelativeLayout)view.FindViewById(Resource.Id.acceptedRequestLayout2);

                searchListView.Visibility = ViewStates.Gone;
                relativeLayout.Visibility = ViewStates.Gone;
                spinner.Visibility = ViewStates.Gone;
                acceptedRequestLayout.Visibility = ViewStates.Gone;

                listView.Adapter = listAdapter;
                searchListView.Adapter = locationAdapter;

                sideTab.Click += (sender, e) =>
                {
                    sideTabClicked(sideTab, drawerLayout, listView);
                };

                searchView.SetQueryHint("Search for destination");

                searchView.QueryTextChange += (sender, e) =>
                {
                    if (searchView.Query == "")
                    {
                        searchListView.Visibility = ViewStates.Gone;
                    }

                    else
                    {
                        searchListView.Visibility = ViewStates.Visible;
                        locationAdapter.Filter.InvokeFilter(e.NewText);
                    }
                };

                pickUpBtn.Click += (sender, e) =>
                {
                    new spinnerTask(spinner, ua).Execute();
                };

                listView.ItemClick += (sender, e) =>
                {
                    selectItem(e.Position);
                };

                searchListView.ItemClick += (sender, e) =>
                {
                    itemSelected(locationAdapter.GetItem(e.Position));
                };

                mf.OnCreate(savedInstanceState);
                mf.OnStart(); //start loading the map into the mapView
            }

            createLocationRequest(); //create new location request to continuously update volunteer request
            clientSetup(); //set up the Google client 

            return view;
        }

        public void OnConnected(Bundle connectionHint)
        {
            myLocation = location.GetLastLocation(client); //once the client is connected, get the last known location of the device
            mapSetup(); //now that client is connected, attempt to setup map
            location.RequestLocationUpdates(client, locationRequest, this); //request location updates using the created client and locationRequest objects
        }

        public void OnConnectionFailed(ConnectionResult result)
        {
            onConnectionInterrupted();
        }

        public void OnConnectionSuspended(int cause)
        {
            onConnectionInterrupted();
        }

        public void OnLocationChanged(Location location)
        {
            LatLng userPosition = new LatLng(location.Latitude, location.Longitude);
            userMarker.SetPosition(userPosition);
        }

        public void OnMapReady(GoogleMap googleMap)
        {
            map = googleMap; //set the created googleMap to the map variables
            map.UiSettings.CompassEnabled = false; //disable compass
            map.UiSettings.MapToolbarEnabled = false; //disable map toolbar

            if (client.IsConnected) //if the client is still connected
            {
                LatLng position = new LatLng(myLocation.Latitude, myLocation.Longitude);
                userMarker = new MarkerOptions();
                userMarker.SetTitle("You")
                          .SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed)) //set the current position of the volunteer using a marker
                          .SetPosition(position);
                CameraPosition cameraPosition = new CameraPosition.Builder().Target(position)
                                                                            .Zoom(15)
                                                                            .Tilt(45)
                                                                            .Build();
                map.AddMarker(userMarker); //add the marker on the map
                map.AnimateCamera(CameraUpdateFactory.NewCameraPosition(cameraPosition));
            }

            else
                client.Reconnect(); //attempt to reconnect the client
        }

        /// <summary>
        /// Setup the googleAPI client to help administer map and get the current location using Location Services
        /// </summary>
        private void clientSetup()
        {
            client = new GoogleApiClient.Builder(Android.App.Application.Context.ApplicationContext).AddConnectionCallbacks(this)
                                        .AddOnConnectionFailedListener(this)
                                        .AddApi(LocationServices.API).Build(); //create new client and add needed callbacks
            location = LocationServices.FusedLocationApi; //initialize
            client.Connect(); //conncet to the client on 
        }

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
        /// Start the map display and connect client if it isn't already connected from clientSetup() call
        /// </summary>
        public override void OnStart()
        {
            base.OnStart();
            if (!client.IsConnected)
                client.Connect(); //if the client is not already connected, connect to the client before opening the map
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

        /// <summary>
        /// Click listener for the side tab.
        /// </summary>
        /// <param name="btn">Button</param>
        /// <param name="drawer">Drawer</param>
        /// <param name="list">List</param>
        private void sideTabClicked(ImageButton btn, DrawerLayout drawer, Android.Widget.ListView list)
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
        /// Selects the item from the clicked listview.
        /// </summary>
        /// <param name="position">Position clicked.</param>
        private void selectItem(int position)
        {
            //based on the position of the item selected add the selected fragment and tag
            switch(position)
            {
                case 0:
                    fragment = new CampusMapsActivity();
                    tag = "CampusMapsActivity";
                    break;
                case 1:
                    fragment = new NonEmergencyContactsActivity();
                    tag = "NonEmergencyContactsActivity";
                    break;
                case 2:
                    fragment = new ContactUsActivity();
                    tag = "ContactUsActivity";
                    break;
                case 3:
                    fragment = new AboutUsActivity();
                    tag = "AboutUsActivity";
                    break;
                case 4:
                    fragment = new WWDActivity();
                    tag = "WhatWeDoActivity";
                    break;
                case 5:
                    fragment = new VolunteeringActivity();
                    tag = "VolunteeringActivity";
                    break;
            }
            drawerLayout.CloseDrawer(listView);
            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                switchFragment(fragment, Resource.Id.userdrawer, tag);
            }
            else
            {
                switchFragment(fragment, Resource.Id.userdrawerMF, tag);
            }

        }

        /// <summary>
        /// Switches the fragment to the selected listview item.
        /// </summary>
        /// <param name="frag">Frag.</param>
        /// <param name="resource">Resource.</param>
        /// <param name="tag">Tag.</param>
        private void switchFragment(Android.Support.V4.App.Fragment frag, int resource, string tag)
        {
            Android.Support.V4.App.FragmentTransaction fragmentTransaction = this.Activity.SupportFragmentManager.BeginTransaction(); //begin the fragment transaction
            fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation); //add animation to slide new fragment to the left
            fragmentTransaction.AddToBackStack("UserActivity");
            fragmentTransaction.Replace(resource, frag, tag);
            fragmentTransaction.Commit(); //commit the transaction
        }

        /// <summary>
        /// Once the user clicks the request pickup option.
        /// </summary>
        public void pickUpBtnClicked()
        {
            //update the UI
            clearInitialUI();
            circleCB = new TimerCallback(circleUpdates);
            circleTimer = new Timer(circleCB, 0, 0, 1000);
            svDescription.Visibility = ViewStates.Visible;
            svDescription.Text = "SEARCHING FOR VOLUNTEERS";

            //Submit the request so that it can be picked up and return the id
            requestID = Task.Run(() => submitRequest()).Result;

            tc = new TimerCallback(retrieveRequestUpdate); //create a new timerCallback to be used in timer
            timer = new Timer(tc, 0, 0, 1000); //use the timerCallback to check for user requests every second

        }

        private void circleUpdates(object state)
        {
            counter += 50;
            if(counter == 500)
            {
                counter = 0;
            }

            Task.Run(() => updateCircle());
        }

        private async Task<string> updateCircle()
        {
            circle = new CircleOptions();
            LatLng center = new LatLng(myLocation.Latitude, myLocation.Longitude);
            circle.InvokeCenter(center).InvokeFillColor(Android.Graphics.Color.Purple).InvokeRadius(counter).InvokeStrokeWidth(5);
            mapCircle = map.AddCircle(circle);
            return "";
        }

        /// <summary>
        /// Clears the initial user interface.
        /// </summary>
        private void clearInitialUI()
        {
            relativeLayout.Visibility = ViewStates.Gone;
            clearSearchUI();
        }

        /// <summary>
        /// Once the destination is selected from the list, update UI.
        /// </summary>
        /// <param name="dest">Destination.</param>
        private void itemSelected(string dest)
        {
            searchListView.Visibility = ViewStates.Gone; 
            clearSearchView();
            if (!string.IsNullOrWhiteSpace(destination.Text))
            {
                showAlert(dest);
            }

            else
            {
                relativeLayout.Visibility = ViewStates.Visible;
                destination.Text = dest;
                destination.Enabled = false;
            }
        }

        /// <summary>
        /// Shows an alert based on the passed string.
        /// </summary>
        /// <param name="msg">The passed message.</param>
        private void showAlert(string msg)
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetMessage("Are you sure you would like to change your destination?")
                   .SetPositiveButton("Yes", (sender, e) =>
                   {
                       relativeLayout.Visibility = ViewStates.Visible;
                       destination.Text = msg;
                       destination.Enabled = false;
                   })
                   .SetNegativeButton("No", (sender, e) =>
                   {
                       //Do nothing
                   });

            Dialog dialog = builder.Create();
            dialog.Show();
        }

        /// <summary>
        /// Clears the search user interface.
        /// </summary>
        private void clearSearchUI()
        {
            searchView.Visibility = ViewStates.Gone;
            searchListView.Visibility = ViewStates.Gone;
        }

        /// <summary>
        /// Clears the search view.
        /// </summary>
        private void clearSearchView()
        {
            searchView.SetQuery("", true); //set the query to empty
            InputMethodManager manager = (InputMethodManager)this.Activity.GetSystemService(Context.InputMethodService); //get the keyboard manager
            manager.HideSoftInputFromWindow(searchView.WindowToken, 0); //hide the keyboard
        }

        /// <summary>
        /// Submits the request.
        /// </summary>
        /// <returns>The request.</returns>
        private async Task<int> submitRequest()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + postRequestURI);
            string stringLocation = myLocation.Latitude.ToString() + " " + myLocation.Longitude.ToString();
            var content = new WalkRequest
            {
                name = userName.Text,
                from_location = stringLocation,
                to_location = destination.Text,
                additional_info = additionalInfo.Text
            };

            var stringContent = JsonConvert.SerializeObject(content);

            HttpContent httpContent = new StringContent(stringContent, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await httpClient.PostAsync(customURI, httpContent); //getting the error here

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch(System.Exception e)
            {
                createAlert("The request response failed with exception: " + e);
            }

            var res = await response.Content.ReadAsStringAsync();
            JObject jObj = JObject.Parse(res);
            var id = jObj.SelectToken("id");
            return Int32.Parse(id.ToString());
        }

        /// <summary>
        /// Gets the request status.
        /// </summary>
        /// <returns>The request status.</returns>
        private async Task<string> getRequestStatus()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + postRequestURI + "/" + requestID.ToString());
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            JToken statusLine = null;
            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch(System.Exception e)
            {
                createAlert("The request response failed with exception: " + e);
            }

            var res = await response.Content.ReadAsStringAsync();
            JObject obj = JObject.Parse(res);
            statusLine = obj.SelectToken("status");

            return statusLine.ToString();
        }

        /// <summary>
        /// Gets the names of volunteers given a certain pair id.
        /// </summary>
        /// <returns>The volunteer names.</returns>
        private async Task<List<string>> getVolunteerNames()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + findPairsURI + pairingID.ToString());
            HttpResponseMessage httpResponse = await httpClient.GetAsync(customURI);

            List<string> names = new List<string>();
            try
            {
                httpResponse.EnsureSuccessStatusCode();
            }

            catch (System.Exception e)
            {
                createAlert("The exception thrown is: " + e);
            }

            var responseString = await httpResponse.Content.ReadAsStringAsync();
            JObject jObj = JObject.Parse(responseString);

            //get information to be returned and displayed
            var volunteerOneFN = jObj.SelectToken("volunteers[0].first_name");
            var volunteerOneLN = jObj.SelectToken("volunteers[0].last_name");
            var volunteerTwoFN = jObj.SelectToken("volunteers[1].first_name");
            var volunteerTwoLN = jObj.SelectToken("volunteers[1].last_name");
            var volunteerOneLat = jObj.SelectToken("volunteers[0].latitude");
            var volunteerTwoLat = jObj.SelectToken("volunteers[1].latitude");
            var volunteerOneLong = jObj.SelectToken("volunteers[0].longitude");
            var volunteerTwoLong = jObj.SelectToken("volunteers[0].longitude");

            names.Add(volunteerOneFN + " " + volunteerOneLN);
            names.Add(volunteerTwoFN + " " + volunteerTwoLN);

            volunteerOneLatLng = new LatLng(System.Double.Parse(volunteerOneLat.ToString()), System.Double.Parse(volunteerOneLong.ToString()));
            volunteerTwoLatLng = new LatLng(System.Double.Parse(volunteerTwoLat.ToString()), System.Double.Parse(volunteerTwoLong.ToString()));

            return names;
        }

        /// <summary>
        /// Gets the pairing id of a given volunteer pair.
        /// </summary>
        /// <returns>The pairing identifier.</returns>
        public async Task<int> getPairingID()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + postRequestURI + "/" + requestID.ToString());
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
            }

            catch (System.Exception e)
            {
                createAlert("The request failed in the task. The exception is: " + e);
            }

            var res = await response.Content.ReadAsStringAsync();
            JObject obj = JObject.Parse(res);
            var pairing = obj.SelectToken("pairing");

            return Int32.Parse(pairing.ToString());
        }

        /// <summary>
        /// Retrieves the request update based on a timer, and waits for status to be changed.
        /// </summary>
        /// <param name="state">State.</param>
        private void retrieveRequestUpdate(object state)
        {
            string status = Task.Run(() => getRequestStatus()).Result;

            if (status == "IN_PROGRESS") //We know that the request has been accepted, we need to find the correct pairing ID
            {
                new updateUITask(ua).Execute();
                timer.Change(Timeout.Infinite, Timeout.Infinite);
            }
        }

        /// <summary>
        /// Displays the volunteers once the request is accepted.
        /// </summary>
        public void displayVolunteers()
        {
            //update the UI
            acceptedRequestLayout.Visibility = ViewStates.Visible;
            svDescription.Visibility = ViewStates.Gone;
            mapCircle.Remove();

            pairOneMarker = new MarkerOptions();
            pairTwoMarker = new MarkerOptions();

            List<string> returnedNames = new List<string>();
            returnedNames = Task.Run(() => getVolunteerNames()).Result;

            //get the locations of both volunteers that accepted the user request
            pairOneMarker.SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueRed))
                         .SetPosition(volunteerOneLatLng)
                         .SetTitle(returnedNames[0]);
            pairTwoMarker.SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueGreen))
                         .SetPosition(volunteerTwoLatLng)
                         .SetTitle(returnedNames[1]);

            //add marker to the map
            map.AddMarker(pairOneMarker); 
            map.AddMarker(pairTwoMarker);

            string currentLocation = myLocation.Latitude.ToString() + "," + myLocation.Longitude.ToString();
            string destinationLocation = volunteerOneLatLng.Latitude.ToString() + "," + volunteerOneLatLng.Longitude.ToString();

            var polyPattern = Task.Run(() => getPolyPat(currentLocation, destinationLocation)).Result; //get the poly pattern character string

            List<LatLng> polyline = DecodePolyline(polyPattern); //decode the character string into a polyline that can be displayed on the map
            polyOptions = new PolylineOptions().InvokeColor(Android.Graphics.Color.Blue).InvokeWidth(10); //create the new polyline as a blue line of 10 thickness

            foreach (LatLng point in polyline)
            {
                polyOptions.Add(point); //for each point in the LatLng list, add the separate polyline to the polyline options
            }

            poly = map.AddPolyline(polyOptions); //display the polyline on the map
        }

        /// <summary>
        /// Gets the polyline pattern from the directions api.
        /// </summary>
        /// <returns>The poly pat.</returns>
        /// <param name="start">Start location.</param>
        /// <param name="dest">Destination.</param>
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
                createAlert("The exception is: " + error);
            }

            var content = await response.Content.ReadAsStringAsync();
            JObject dir = JObject.Parse(content);
            string polyPattern = (string)dir.SelectToken("routes[0].overview_polyline.points");

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
    }

    /// <summary>
    /// The spinner task to be called asynchronously.
    /// </summary>
    public class spinnerTask : AsyncTask
    {
        Android.Widget.ProgressBar _pb;
        UserActivity _ua;

        public spinnerTask(Android.Widget.ProgressBar pb, UserActivity ua)
        {
            _pb = pb;
            _ua = ua;
        }

		protected override void OnPostExecute(Java.Lang.Object result)
		{
			base.OnPostExecute(result);
            _pb.Visibility = ViewStates.Gone;
		}

		protected override Java.Lang.Object DoInBackground(params Java.Lang.Object[] @params)
        {
            PublishProgress(null);
            return null;
        }

		protected override void OnProgressUpdate(params Java.Lang.Object[] values)
		{
            base.OnProgressUpdate(values);
            _ua.pickUpBtnClicked();
		}

		protected override void OnPreExecute()
        {
            base.OnPreExecute();
            _pb.Visibility = ViewStates.Visible;
        }

    }

    /// <summary>
    /// Update UI Task.
    /// </summary>
    public class updateUITask : AsyncTask
    {
        UserActivity _ua;

        public updateUITask(UserActivity ua)
        {
            _ua = ua;
        }

        protected override Java.Lang.Object DoInBackground(params Java.Lang.Object[] @params)
        {
            return null;
        }

		protected override void OnPreExecute()
		{
			base.OnPreExecute();
            _ua.pairingID = Task.Run(() => _ua.getPairingID()).Result;
		}

		protected override void OnPostExecute(Java.Lang.Object result)
		{
			base.OnPostExecute(result);
            _ua.displayVolunteers();
		}
	}
}
