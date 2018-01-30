﻿using System.Linq;
using System.Text;
using Android.App;
using Android.Content;
using System.Collections.Generic;
using Android.Graphics;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Newtonsoft.Json.Linq;

namespace FootPatrol.Droid 
{               
    [Activity(Label = "Requests")]
    public class RequestsActivity2 : Android.Support.V4.App.DialogFragment
    {
        public static RequestsActivity2 req;
        private static View view;

        private static List<string> request, userName, toLoc, fromLoc, addInfo;
        private static int reqCount;

        private int currentCount;

        public static RequestsActivity2 newInstance(List<string> requests, int requestCount)
        {
            req = new RequestsActivity2();
            reqCount = requestCount;
            request = requests;
            return req;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            view = inflater.Inflate(Resource.Layout.Requests, container, false);

            RelativeLayout layout = (RelativeLayout)view.FindViewById(Resource.Id.relativeLayout);
            Color backgroundColour = new Color(79, 38, 131);
            layout.SetBackgroundColor(backgroundColour);

            foreach(string a in request)
            System.Diagnostics.Debug.WriteLine(a);

            TextView name = (TextView)view.FindViewById(Resource.Id.userName);
            TextView toLocation = (TextView)view.FindViewById(Resource.Id.toLocation);
            TextView fromLocation = (TextView)view.FindViewById(Resource.Id.fromLocation);
            TextView additionalInfo = (TextView)view.FindViewById(Resource.Id.additionalInfo);
            ImageButton rightArrow = (ImageButton)view.FindViewById(Resource.Id.rightArrow);
            ImageButton leftArrow = (ImageButton)view.FindViewById(Resource.Id.leftArrow);

            currentCount = 0;

            userName = new List<string>();
            toLoc = new List<string>();
            fromLoc = new List<string>();
            addInfo = new List<string>();

            foreach(string req in request)
            {
                JObject o = JObject.Parse(req);

                string n = (string)o.SelectToken("name");
                string to = (string)o.SelectToken("to_location");
                string from = (string)o.SelectToken("from_location");
                string aInfo = (string)o.SelectToken("additional_info"); 

                userName.Add(n);
                toLoc.Add(to);
                fromLoc.Add(from);
                addInfo.Add(aInfo);
            }

            foreach(string a in userName)
            {
                System.Diagnostics.Debug.WriteLine(a);
            }

            leftArrow.Click += (sender, e) =>
            {
                if(currentCount == 0)
                {
                    leftArrow.Enabled = false; 
                }

                else
                {
                    leftArrow.Enabled = true;
                    name.Text = "NAME " + userName[currentCount];
                    fromLocation.Text = "START LOCATION " + fromLoc[currentCount];
                    toLocation.Text = "END LOCATION " + toLoc[currentCount];
                    additionalInfo.Text = "ADDITIONAL INFO " + addInfo[currentCount];
                    currentCount--;
                }
            };

            rightArrow.Click += (sender, e) =>
            {
                if(currentCount == reqCount - 1)
                {
                    rightArrow.Enabled = false;
                }

                else
                {
                    rightArrow.Enabled = true;
                    name.Text = "NAME: " + userName[currentCount];
                    fromLocation.Text = "START LOCATION: " + fromLoc[currentCount];
                    toLocation.Text = "END LOCATION: " + toLoc[currentCount];
                    additionalInfo.Text = "ADDITIONAL INFO: " + addInfo[currentCount];
                    currentCount++;
                }
            };

            return view;
        }
    }
}