using Android.App;
using Android.Content;
using Android.Net;
using Android.OS;
using Android.Views;
using Android.Widget;

namespace FootPatrol.Droid
{
    [Activity(Label = "NonEmergencyContactsActivity")]
    public class NonEmergencyContactsActivity : Android.Support.V4.App.Fragment
    {
        Button footPatrolBtn, campusPoliceBtn;
        string fpPhone, cpPhone;

        public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
        {
            View view;
            fpPhone = "519-661-3650";
            cpPhone = "519-661-3300";
            view = inflater.Inflate(Resource.Layout.NonEmergencyContact, container, false);
            footPatrolBtn = (Button)view.FindViewById(Resource.Id.footPatrolHQBtn);
            campusPoliceBtn = (Button)view.FindViewById(Resource.Id.campusPoliceBtn);

            footPatrolBtn.Click += (sender, e) =>
            {
                createAlert(fpPhone, "Foot Patrol HQ");
            };

            campusPoliceBtn.Click += (sender, e) =>
            {
                createAlert(cpPhone, "Campus Police");
            };

            return view;
        }

        private void createAlert(string phoneNum, string service)
        {
            AlertDialog.Builder builder = new AlertDialog.Builder(this.Context);
            builder.SetMessage("Are you sure you want to call " + service + "?").SetNegativeButton("No", (sender, e) =>
            {
                //Do nothing
            }).SetPositiveButton("Yes", (sender, e) =>
            {
                string phone = "tel:" + phoneNum;
                Uri uri = Uri.Parse(phone);
                Intent intent = new Intent(Intent.ActionCall);
                intent.SetData(uri);
                StartActivity(intent);
            });

            Dialog dialog = builder.Create();
            dialog.Show();
        }
    }
}
