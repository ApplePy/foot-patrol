﻿using Android.App;
using System.Collections.Generic;
using Android.Graphics;
using Android.OS;
using Android.Views;
using Android.Widget;
using Newtonsoft.Json.Linq;
using System;

namespace FootPatrol.Droid 
{               
    [Activity(Label = "Requests")]
    public class RequestsActivity : Android.Support.V4.App.DialogFragment
    {
        public static RequestsActivity ra; //reference to RequestsActivity
        public static VolunteerActivity va; //reference to VolunteerActivity
        private static View view; //reference of the current view

        public static List<UserRequests.Request> activeRequests; //list of user requests
        private static int reqCount; //number of requests

        public TextView name, toLocation, fromLocation, additionalInfo; //UI components to be displayed in each request

        private int currentCount;

        /// <summary>
        /// Create a new instance of RequestsActivity and pass the list of requests into the constructor
        /// </summary>
        /// <returns>The RequestsActivity instance.</returns>
        /// <param name="requests">List of requests</param>
        public static RequestsActivity newInstance(List<string> requests)
        {
            ra = new RequestsActivity(); //create new instance
            activeRequests = new List<UserRequests.Request>();//initialize new list of requests
            reqCount = requests.Count; //save the count into request count variable
            saveRequests(requests);
            return ra;
        }

        /// <summary>
        /// Create a new RequestsActivity view and parse each request and add each component to its respective list
        /// </summary>
        /// <returns>The create view.</returns>
        /// <param name="inflater">Inflater</param>
        /// <param name="container">Container</param>
        /// <param name="savedInstanceState">Saved instance state</param>
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            Dialog.Window.RequestFeature(WindowFeatures.NoTitle); //remove the title from the dialog fragment
            base.OnCreate(savedInstanceState);

            Dialog.Window.SetLayout(ViewGroup.LayoutParams.MatchParent,ViewGroup.LayoutParams.WrapContent); //set the layout of the dialog fragment
            view = inflater.Inflate(Resource.Layout.Requests, container, false);

            //initialize each variable to its view component
            name = (TextView)view.FindViewById(Resource.Id.userName);
            toLocation = (TextView)view.FindViewById(Resource.Id.toLocation);
            fromLocation = (TextView)view.FindViewById(Resource.Id.fromLocation);
            additionalInfo = (TextView)view.FindViewById(Resource.Id.additionalInfo);
            ImageButton rightArrow = (ImageButton)view.FindViewById(Resource.Id.rightArrow);
            ImageButton leftArrow = (ImageButton)view.FindViewById(Resource.Id.leftArrow);
            ImageButton closeBtn = (ImageButton)view.FindViewById(Resource.Id.closeButton);
            Button acceptReq = (Button)view.FindViewById(Resource.Id.acceptRequest);
            ProgressBar loadingSpinner = (ProgressBar)view.FindViewById(Resource.Id.spinner1);

            loadingSpinner.Visibility = ViewStates.Gone;

            //Take care of correct fonts
            Typeface bentonSans = Typeface.CreateFromAsset(this.Activity.Application.Assets, "BentonSansRegular.otf");
            setFont(bentonSans, name);
            setFont(bentonSans, toLocation);
            setFont(bentonSans, fromLocation);
            setFont(bentonSans, additionalInfo);
             
            currentCount = 0; //set the initial count to zero

            //if there exists more than 1 request
            if (activeRequests.Count > 1)
            {
                setInfo(activeRequests[currentCount]); //set the current info

                disableArrow(leftArrow); //disable the left arrow

                //left arrow click listener
                leftArrow.Click += (sender, e) =>
                {
                    enableArrow(rightArrow); //enable the right arrow
                    currentCount--; //decrease the current count
                    if (currentCount == 0)
                    {
                        disableArrow(leftArrow); //if the count is 0, no more requests to the left
                    }
                    setInfo(activeRequests[currentCount]); //set the current info
                };

                //right arrow click listener
                rightArrow.Click += (sender, e) =>
                {
                    enableArrow(leftArrow); //enable the left arrow
                    currentCount++; //increase the current count
                    if (currentCount == reqCount - 1)
                    {
                        disableArrow(rightArrow); //if it is the last request, no more requests to the right
                    }
                    setInfo(activeRequests[currentCount]); //set the current info
                };
            }

            else //if there is only 1 request
            {
                //disable both arrows 
                disableArrow(leftArrow);
                disableArrow(rightArrow);
                setInfo(activeRequests[0]); //set info of the only request
            }

            //close button click listener
            closeBtn.Click += (sender, e) =>
            {
                dismissFragment(); //close the dialog fragment
            };

            //accept request button click listener
            acceptReq.Click += (sender, e) =>
            {
                loadingSpinner.Visibility = ViewStates.Visible;
                va = new VolunteerActivity(); //initialize the new instance of the VolunteerActivity class
                va.onTripAcceptAsync(activeRequests[currentCount]); //pass the accepted request into the trip accept function
            };

            return view;
        }

        /// <summary>
        /// Disables the arrow passed in the parameter.
        /// </summary>
        /// <param name="button">Button.</param>
        private void disableArrow(ImageButton button)
        {
            button.Enabled = false;
            button.SetBackgroundColor(Color.Gray);
        }

        /// <summary>
        /// Enables the arrow passed in the parameter
        /// </summary>
        /// <param name="button">Button.</param>
        private void enableArrow(ImageButton button)
        {
            button.Enabled = true;
            button.SetBackgroundColor(Color.White);
        }

        /// <summary>
        /// Dismiss the current dialog fragment.
        /// </summary>
        public void dismissFragment()
        {
            this.Dismiss();
        }

        /// <summary>
        /// Set the info in the request UI to the current request information.
        /// </summary>
        /// <param name="request">The current request</param>
        private void setInfo(UserRequests.Request request)
        {
            name.Text = "NAME: " + request.name; 
            fromLocation.Text = "START LOCATION: " + request.fromLoc;
            toLocation.Text = "END LOCATION: " + request.toLoc;
            additionalInfo.Text = "ADDITIONAL INFO: " + request.addInfo;
        }

        public static void saveRequests(List<string> requests)
        {
            foreach (string req in requests)
            {
                JObject o = JObject.Parse(req); //parse the request into a string

                //get each respective string using the selectToken method
                string userName = (string)o.SelectToken("name");
                string toLoc = (string)o.SelectToken("to_location");
                string fromLoc = (string)o.SelectToken("from_location");
                string aInfo = (string)o.SelectToken("additional_info");
                string requestId = (string)o.SelectToken("id");

                activeRequests.Add(new UserRequests.Request(userName, toLoc, fromLoc, aInfo, Int32.Parse(requestId)));
            }
        }

        private void setFont(Typeface font, TextView text)
        {
            text.SetTypeface(font, TypefaceStyle.Normal);
        }
    }
}