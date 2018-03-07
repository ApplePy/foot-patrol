
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
        private List<string> dataSet; //data set containing directions

        /// <summary>
        /// Gets the number of items in the directions data set.
        /// </summary>
        /// <value>The item count.</value>
        public override int ItemCount => dataSet.Count;

        /// <summary>
        /// Binds the view to the recyclerview view holder and sets the current item in the directions list.
        /// </summary>
        /// <param name="holder">Holder</param>
        /// <param name="position">Position</param>
        public override void OnBindViewHolder(RecyclerView.ViewHolder holder, int position)
        {
            DirectionsHolder dh = holder as DirectionsHolder; //create new direction holder
            dh.directions.Text = dataSet[position]; //set the test to the current position
        }

        /// <summary>
        /// Creates the view holder.
        /// </summary>
        /// <returns>The created view holder</returns>
        /// <param name="parent">Parent</param>
        /// <param name="viewType">View type</param>
        public override RecyclerView.ViewHolder OnCreateViewHolder(ViewGroup parent, int viewType)
        {
            View myView = LayoutInflater.From(parent.Context).Inflate(Resource.Layout.DirectionsLayout, parent, false);
            DirectionsHolder dh = new DirectionsHolder(myView); //create a new holder and pass the view through the constructor
            return dh;
        }

        /// <summary>
        /// When the adapter is created, a list of directions is passed and set.
        /// </summary>
        /// <param name="data">Data</param>
        public DirectionsAdapter(List<string> data)
        {
            dataSet = data;
        }
    }
}
