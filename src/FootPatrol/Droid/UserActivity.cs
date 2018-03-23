﻿using Android.App;
using Android.OS;
using Android.Views;
using Android.Gms.Common.Apis;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.Gms.Location;
using Android.Graphics;
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
        private static ImageButton mSideTab, mfSideTab; //side tab buttons for each view
        private static Android.Widget.Button pickUpBtn;
        private static EditText userName, destination, additionalInfo;
        private static Android.Widget.ListView mListView, mfListView, searchListView;
        private static MarkerOptions userMarker;
        private static CircleOptions circle;
        private static DrawerLayout mDrawerLayout, mfDrawerLayout;
        private static Android.Widget.RelativeLayout relativeLayout, acceptedRequestLayout;
        private static Android.Views.View view; //the current view
        private static TextView svDescription;
        private static ArrayAdapter<String> listAdapter, locationAdapter;
        private static Android.Widget.SearchView searchView;
        private static string[] menuItems, locationNames;
        private string backendURI, postRequestURI;
        private static int requestID;
        private static Android.Widget.ProgressBar spinner;
        private static TimerCallback tc;
        public static Timer timer;

        public string tag;
        public Android.Support.V4.App.Fragment fragment;

        public override Android.Views.View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            Forms.Init(this.Activity,savedInstanceState);
            menuItems = new string[] { "CAMPUS MAPS", "NON-EMERGENCY CONTACTS", "CONTACT US", "ABOUT US", "WHAT WE DO", "VOLUNTEER" };
            locationNames = new string[] {"3M CENTRE" , "ALUMNI HALL" , "BIOLOGY & GEOLOGY SCIENCES", "CHEMISTRY BUILDING" ,
            "ELBORN COLLEGE", "HEALTH SCIENCES BUILDING", "KRESGE BUILDING", "LAWSON HALL", "MIDDLESEX COLLEGE", "NORTH CAMPUS BUILDING", "NATURAL SCIENCES CENTRE",
            "SPENCER ENGINEERING BUILDING", "SOMERVILLE HOUSE", "SOCIAL SCIENCES CENTRE", "STEVENSON HALL", "TALBOT COLLEGE", "THOMPSON ENGINEERING BUILDING", "THAMES HALL", "UNIVERSITY COLLEGE", "UNIVERSITY COMMUNITY CENTRE",
            "VISUAL ARTS CENTRE", "WELDON LIBRARY", "WESTERN SCIENCE CENTRE", "BRESCIA CAMPUS", "HURON CAMPUS", "IVEY BUSINESS SCHOOL",
                "BROUGHDALE HALL (KING'S UNIVERSITY COLLEGE)", "FACULTY BUILDING (KING'S UNIVERSITY COLLEGE)", "WEMPLE HALL (KING'S UNIVERSITY COLLEGE)", "LABATT HALL (KING'S UNIVERSITY COLLEGE)",
                "DANTE LENARDON HALL (KING'S UNIVERSITY COLLEGE"};

            backendURI = "http://staging.capstone.incode.ca/api/v1";
            postRequestURI = "/requests";

            listAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, menuItems);
            locationAdapter = new ArrayAdapter<string>(this.Context, Resource.Layout.ListElement, locationNames);

            try
            {
                MapsInitializer.Initialize(this.Context); //initialize the Google Maps Android API
            }

            catch (Exception e)
            {
                createAlert("Unable to initialize the map, the error is: " + e);
            }

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
            {
                view = inflater.Inflate(Resource.Layout.UserScreen, container, false);
                mView = (MapView)view.FindViewById(Resource.Id.userMap);
                mSideTab = (ImageButton)view.FindViewById(Resource.Id.userSideTab);
                mDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.userdrawer);
                mListView = (Android.Widget.ListView)view.FindViewById(Resource.Id.userListView);
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

                mListView.Adapter = listAdapter;
                searchListView.Adapter = locationAdapter;

                mSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mSideTab, mDrawerLayout, mListView);
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
                    pickUpBtnClicked();
                };

                mListView.ItemClick += (sender, e) =>
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
                mfSideTab = (ImageButton)view.FindViewById(Resource.Id.userSideTabMF);
                mfDrawerLayout = (DrawerLayout)view.FindViewById(Resource.Id.userdrawerMF);
                mfListView = (Android.Widget.ListView)view.FindViewById(Resource.Id.userListViewMF);
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

                mfListView.Adapter = listAdapter;
                searchListView.Adapter = locationAdapter;

                mfSideTab.Click += (sender, e) =>
                {
                    sideTabClicked(mfSideTab, mfDrawerLayout, mfListView);
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
                    pickUpBtnClicked();
                };

                mfListView.ItemClick += (sender, e) =>
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

        private void selectItem(int position)
        {
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

            if (Int32.Parse(Build.VERSION.Sdk) > 23)
                switchFragment(fragment, Resource.Id.userdrawer, tag);
            else
                switchFragment(fragment, Resource.Id.userdrawerMF, tag);

        }

        private void switchFragment(Android.Support.V4.App.Fragment frag, int resource, string tag)
        {
            Android.Support.V4.App.FragmentTransaction fragmentTransaction = this.Activity.SupportFragmentManager.BeginTransaction(); //begin the fragment transaction
            fragmentTransaction.SetCustomAnimations(Resource.Layout.EnterAnimation, Resource.Layout.ExitAnimation); //add animation to slide new fragment to the left
            fragmentTransaction.AddToBackStack("UserActivity");
            fragmentTransaction.Replace(resource, frag, tag);
            fragmentTransaction.Commit(); //commit the transaction
        }

        private void pickUpBtnClicked()
        {
            spinner.Visibility = ViewStates.Visible;
            clearInitialUI();
            circle = new CircleOptions();
            LatLng center = new LatLng(myLocation.Latitude, myLocation.Longitude);
            circle.InvokeCenter(center).InvokeFillColor(Android.Graphics.Color.Purple).InvokeRadius(500).InvokeStrokeWidth(5);
            map.AddCircle(circle);
            svDescription.Visibility = ViewStates.Visible;
            svDescription.Text = "SEARCHING FOR VOLUNTEERS";

            //Submit the request so that it can be picked up and return the id
            requestID = Task.Run(() => submitRequest()).Result;

            spinner.Visibility = ViewStates.Gone;

            tc = new TimerCallback(retrieveRequestUpdate); //create a new timerCallback to be used in timer
            timer = new Timer(tc, 0, 0, 1000); //use the timerCallback to check for user requests every second

        }

        private void clearInitialUI()
        {
            relativeLayout.Visibility = ViewStates.Gone;
            clearSearchUI();
        }

        private void itemSelected(string dest)
        {
            if (!string.IsNullOrWhiteSpace(destination.Text))
            {
                searchListView.Visibility = ViewStates.Gone; 
                showAlert(dest);
                clearSearchView();
            }

            else
            {
                searchListView.Visibility = ViewStates.Gone;
                relativeLayout.Visibility = ViewStates.Visible;
                clearSearchView();
                destination.Text = dest;
                destination.Enabled = false;
            }
        }

        private void showAlert(string dest)
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetMessage("Are you sure you would like to change your destination?")
                   .SetPositiveButton("Yes", (sender, e) =>
                   {
                       relativeLayout.Visibility = ViewStates.Visible;
                       destination.Text = dest;
                       destination.Enabled = false;
                   })
                   .SetNegativeButton("No", (sender, e) =>
                   {
                       //Do nothing
                   });

            Dialog dialog = builder.Create();
            dialog.Show();
        }

        private void clearSearchUI()
        {
            searchView.Visibility = ViewStates.Gone;
            searchListView.Visibility = ViewStates.Gone;
        }

        private void clearSearchView()
        {
            searchView.SetQuery("", true);
            InputMethodManager manager = (InputMethodManager)this.Activity.GetSystemService(Context.InputMethodService);
            manager.HideSoftInputFromWindow(searchView.WindowToken, 0);
        }

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
            HttpResponseMessage response = await httpClient.PostAsync(customURI, httpContent);

            try
            {
                response.EnsureSuccessStatusCode();
                var res = await response.Content.ReadAsStringAsync();
                JObject jObj = JObject.Parse(res);
                var id = jObj.SelectToken("id");
                return Int32.Parse(id.ToString());
            }

            catch(Exception e)
            {
                createAlert("The request response failed with exception: " + e);
            }

            return 0;
        }

        private async Task<string> getRequestStatus()
        {
            HttpClient httpClient = new HttpClient();
            Uri customURI = new Uri(backendURI + postRequestURI + "/" + requestID.ToString());
            HttpResponseMessage response = await httpClient.GetAsync(customURI);

            try
            {
                response.EnsureSuccessStatusCode();
                var res = await response.Content.ReadAsStringAsync();
                JObject obj = JObject.Parse(res);
                var statusLine = obj.SelectToken("status");
                return statusLine.ToString();
            }

            catch(Exception e)
            {
                createAlert("The request response failed with exception " + e);
            }

            return "";
        }

        private void retrieveRequestUpdate(object state)
        {
            string status = Task.Run(() => getRequestStatus()).Result;
            System.Diagnostics.Debug.WriteLine("The status is: " + status);
            if (status == "IN_PROGRESS")
            {
                timer.Change(Timeout.Infinite, Timeout.Infinite);
                Device.BeginInvokeOnMainThread(displayVolunteers);
            }
        }

        private void displayVolunteers()
        {
            acceptedRequestLayout.Visibility = ViewStates.Visible;
        }
    }
}