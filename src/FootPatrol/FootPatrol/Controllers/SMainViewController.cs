using System;
using System.Threading.Tasks;
//using Foundation;
//using UIKit;
namespace FootPatrol
{
    public class SMainViewController
    {
        public int requestID;
        public bool requestSent = false;

        private IMainViewController inst;

        public SMainViewController(IMainViewController instance)
        {
            inst = instance;
        }

        public async void RequestButtonClicked (string name, string fromLocation, string toLocation, string additionalInfo) {

            if (requestSent == false)
            {

                requestSent = true;
                inst.SetRequestButtonEnabled(false);

                //Check if all required input fields have been filled out
                if (String.IsNullOrEmpty(name) || String.IsNullOrEmpty(fromLocation) || String.IsNullOrEmpty(toLocation))
                {
                    inst.DisplayPopup("Error", "Please check your input.");
                    return;
                }

                //Send footpatrol request
                try
                {
                    requestID = await RequestService.SendFootPatrolRequest(name, fromLocation, toLocation, additionalInfo);
                }
                catch (Exception error)
                {
                    requestSent = false;

                    inst.DisplayPopup("Error", "Please check your input.");

                    inst.SetRequestButtonEnabled(true);

                    return;
                }

                inst.SetRequestButtonTitle("Cancel SafeWalk Request");

                inst.DisplayPopup("Request Sent", "Your SafeWalk request has been sent.");

                inst.SetRequestButtonEnabled(true);

            }
            else
            {

                requestSent = false;
                inst.SetRequestButtonEnabled(false);

                //Cancel footpatrol request
                try
                {
                    await RequestService.DeleteFootPatrolRequest(requestID);
                }
                catch (Exception error)
                {
                    requestSent = true;

                    //Popup with error
                    inst.DisplayPopup("Error", "There was an error cancelling request.");

                    inst.SetRequestButtonEnabled(true);

                    return;
                }

                inst.SetRequestButtonTitle("Request SafeWalk");

                //Popup saying that request has been sent
                inst.DisplayPopup("Request Cancelled", "Your SafeWalk request has been cancelled.");

                inst.SetRequestButtonEnabled(true);

            }
        }

    }
}

