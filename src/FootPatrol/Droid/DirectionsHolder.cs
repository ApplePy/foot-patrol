
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Android.Support.V7.Widget;
using Android.App;
using Android.Graphics;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Android.Content.Res;

namespace FootPatrol.Droid
{
    [Activity(Label = "DirectionsHolder")]
    public class DirectionsHolder : RecyclerView.ViewHolder
    {
        public TextView directions;

        public DirectionsHolder(View itemView) : base (itemView)
        {
            directions = (TextView)itemView.FindViewById(Resource.Id.directionsText);
        }
    }

}
