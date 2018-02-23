
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Android.Support.V7.Widget;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "DirectionsAdapter")]
    public class DirectionsAdapter : RecyclerView.Adapter
    {
        private List<string> dataSet;

        public override int ItemCount => dataSet.Count;

        public override void OnBindViewHolder(RecyclerView.ViewHolder holder, int position)
        {
            DirectionsHolder dh = holder as DirectionsHolder;
            dh.directions.Text = dataSet[position];
        }

        public override RecyclerView.ViewHolder OnCreateViewHolder(ViewGroup parent, int viewType)
        {
            View myView = LayoutInflater.From(parent.Context).Inflate(Resource.Layout.DirectionsLayout, parent, false);
            DirectionsHolder dh = new DirectionsHolder(myView);
            return dh;
        }

        public DirectionsAdapter(List<string> data)
        {
            dataSet = data;
        }
    }
}
