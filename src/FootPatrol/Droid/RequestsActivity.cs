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

        public static List<string> request, userName, toLoc, fromLoc, addInfo;
        public static List<int> idList;
        private static int reqCount;

        public TextView name, toLocation, fromLocation, additionalInfo;

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

            name = (TextView)view.FindViewById(Resource.Id.userName);
            toLocation = (TextView)view.FindViewById(Resource.Id.toLocation);
            fromLocation = (TextView)view.FindViewById(Resource.Id.fromLocation);
            additionalInfo = (TextView)view.FindViewById(Resource.Id.additionalInfo);
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

            foreach (string req in request)
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

            if (userName.Count > 1)
            {
                setInfo(currentCount);

                disableArrow(leftArrow);

                leftArrow.Click += (sender, e) =>
                {
                    enableArrow(rightArrow);
                    currentCount--;
                    if (currentCount == 0)
                    {
                        disableArrow(leftArrow);
                    }
                    setInfo(currentCount);
                };

                rightArrow.Click += (sender, e) =>
                {
                    enableArrow(leftArrow);
                    currentCount++;
                    if (currentCount == reqCount - 1)
                    {
                        disableArrow(rightArrow);
                    }
                    setInfo(currentCount);

                };
            }

            else
            {
                disableArrow(leftArrow);
                disableArrow(rightArrow);
                setInfo(0);
            }

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

        public void setInfo(int currentCount)
        {
            name.Text = "NAME: " + userName[currentCount];
            fromLocation.Text = "START LOCATION: " + fromLoc[currentCount];
            toLocation.Text = "END LOCATION: " + toLoc[currentCount];
            additionalInfo.Text = "ADDITIONAL INFO: " + addInfo[currentCount];
        }

    }
}