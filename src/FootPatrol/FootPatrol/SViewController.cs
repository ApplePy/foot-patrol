using System;
using System.Threading.Tasks;
//using Foundation;
//using UIKit;
namespace FootPatrol
{
    public class SViewController
    {
        public int requestID;
        public bool requestSent = false;

        private IViewController inst;

        public SViewController(IViewController instance)
        {
            inst = instance;
        }

        public async void RequestButtonClicked (string name, string fromLocation, string toLocation, string additionalInfo) {

            if (requestSent == false)
            {

                requestSent = true;
                inst.SetRequestButtonEnabled(false);

                //Check if all required input fields have been filled out
                if (name == "" || name == null)
                {
                    inst.DisplayPopup("Error", "Please check your input.");
                    return;
                }
                else if (fromLocation == "" || fromLocation == null)
                {
                    inst.DisplayPopup("Error", "Please check your input.");
                    return;
                }
                else if (toLocation == "" || toLocation == null)
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
        };

    }
}

