using Android.App;
using Android.OS;
using Android.Views;
using Android.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "CampusMapsActivity")]
    public class CampusMapsActivity : Android.Support.V4.App.Fragment
    {
        ImageButton fpMapBtn, campusMapBtn;
        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            View view;
            view = inflater.Inflate(Resource.Layout.CampusMaps, container, false);
            fpMapBtn = (ImageButton)view.FindViewById(Resource.Id.footPatrolMapBtn);
            campusMapBtn = (ImageButton)view.FindViewById(Resource.Id.campusMapBtn);

            fpMapBtn.Click += (sender, e) =>
            {
                showImage(inflater, container, Resource.Layout.FootPatrolMap);
            };

            campusMapBtn.Click += (sender, e) =>
            {
                showImage(inflater, container, Resource.Layout.CampusMap);
            };

            return view;
        }

        private void showImage(LayoutInflater inflater, ViewGroup container, int resource)
        {
            View newView;
            newView = inflater.Inflate(resource, container, false);
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context).SetView(newView);
            Dialog dialog = builder.Create();
            dialog.Show();

        }
    }
}
