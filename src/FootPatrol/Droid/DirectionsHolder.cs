using Android.Support.V7.Widget;
using Android.App;
using Android.Views;
using Android.Widget;

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
