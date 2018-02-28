using Android.App;
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
        public static RequestsActivity req;
        public static VolunteerActivity va;
        private static View view;

        private static List<string> request, userName, toLoc, fromLoc, addInfo;
        private static List<int> idList;
        private static int reqCount;

        private int currentCount;

        public static RequestsActivity newInstance(List<string> requests, int requestCount)
        {
            req = new RequestsActivity();
            reqCount = requestCount;
            request = requests;
            return req;
        }

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            Dialog.Window.RequestFeature(WindowFeatures.NoTitle);
            base.OnCreate(savedInstanceState);

            Dialog.Window.SetLayout(ViewGroup.LayoutParams.MatchParent,ViewGroup.LayoutParams.WrapContent);
            view = inflater.Inflate(Resource.Layout.Requests, container, false);

            TextView name = (TextView)view.FindViewById(Resource.Id.userName);
            TextView toLocation = (TextView)view.FindViewById(Resource.Id.toLocation);
            TextView fromLocation = (TextView)view.FindViewById(Resource.Id.fromLocation);
            TextView additionalInfo = (TextView)view.FindViewById(Resource.Id.additionalInfo);
            ImageButton rightArrow = (ImageButton)view.FindViewById(Resource.Id.rightArrow);
            ImageButton leftArrow = (ImageButton)view.FindViewById(Resource.Id.leftArrow);
            ImageButton closeBtn = (ImageButton)view.FindViewById(Resource.Id.closeButton);
            Button acceptReq = (Button)view.FindViewById(Resource.Id.acceptRequest);

            currentCount = 0;

            userName = new List<string>();
            toLoc = new List<string>();
            fromLoc = new List<string>();
            addInfo = new List<string>();
            idList = new List<int>();

            foreach(string req in request)
            {
                JObject o = JObject.Parse(req);

                string n = (string)o.SelectToken("name");
                string to = (string)o.SelectToken("to_location");
                string from = (string)o.SelectToken("from_location");
                string aInfo = (string)o.SelectToken("additional_info");
                string id = (string)o.SelectToken("id");

                userName.Add(n);
                toLoc.Add(to);
                fromLoc.Add(from);
                addInfo.Add(aInfo);
                idList.Add(Int32.Parse(id));
            }

            name.Text = "NAME: " + userName[currentCount];
            fromLocation.Text = "START LOCATION: " + fromLoc[currentCount];
            toLocation.Text = "END LOCATION: " + toLoc[currentCount];
            additionalInfo.Text = "ADDITIONAL INFO: " + addInfo[currentCount];


            disableArrow(leftArrow);

            leftArrow.Click += (sender, e) =>
            {
                if(currentCount == 0)
                {
                    disableArrow(leftArrow);
                }

                else
                {
                    enableArrow(leftArrow);
                    enableArrow(rightArrow);
                    name.Text = "NAME: " + userName[currentCount];
                    fromLocation.Text = "START LOCATION: " + fromLoc[currentCount];
                    toLocation.Text = "END LOCATION: " + toLoc[currentCount];
                    additionalInfo.Text = "ADDITIONAL INFO: " + addInfo[currentCount];
                    currentCount--;
                }
            };

            rightArrow.Click += (sender, e) =>
            {
                if(currentCount >= reqCount - 2)
                {
                    disableArrow(rightArrow);
                }

                else
                {
                    enableArrow(leftArrow);
                    enableArrow(rightArrow);
                    name.Text = "NAME: " + userName[currentCount];
                    fromLocation.Text = "START LOCATION: " + fromLoc[currentCount];
                    toLocation.Text = "END LOCATION: " + toLoc[currentCount];
                    additionalInfo.Text = "ADDITIONAL INFO: " + addInfo[currentCount];
                    currentCount++;
                }
            };

            closeBtn.Click += (sender, e) =>
            {
                dismissFragment();
            };

            acceptReq.Click += (sender, e) =>
            {
                va = new VolunteerActivity();
                va.onTripAcceptAsync(userName[currentCount], toLoc[currentCount], fromLoc[currentCount], addInfo[currentCount], idList[currentCount]);
            };

            return view;
        }

        public void disableArrow(ImageButton button)
        {
            button.Enabled = false;
            button.SetBackgroundColor(Color.Gray);
        }

        public void enableArrow(ImageButton button)
        {
            button.Enabled = true;
            button.SetBackgroundColor(Color.White);
        }

        public void dismissFragment()
        {
            this.Dismiss();
        }

    }
}