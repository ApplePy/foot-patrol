using System;
using System.Threading.Tasks;
using System.Threading;
namespace FootPatrol
{
    public class SMainViewController
    {
        public int requestID;
        public bool requestSent = false;
        public Mutex mutex;

        private IMainViewController inst;

        public SMainViewController(IMainViewController instance)
        {
            inst = instance;
            mutex = new Mutex();
        }

        //Send request
        public async void SendRequest(string name, string fromLocation, string toLocation, string additionalInfo) 
        {
            //Send request
            try
            {
                //Send request
                requestID = await RequestService.SendFootPatrolRequest(name, fromLocation, toLocation, additionalInfo);

                //Change button to cancel
                inst.DisplayPopup("Request Sent", "Your SafeWalk request has been sent.");
                inst.SetRequestButtonTitle("Cancel SafeWalk Request");
                requestSent = true;
            }
            catch
            {
                //Display error
                inst.DisplayPopup("Error", "Please check your input.");
            }
        }

        //Cancel request
        public async void CancelRequest() 
        {
            //Cancel footpatrol request
            try
            {
                //Cancel request
                await RequestService.DeleteFootPatrolRequest(requestID);

                //Change button to request
                inst.DisplayPopup("Request Cancelled", "Your SafeWalk request has been cancelled.");
                inst.SetRequestButtonTitle("Request SafeWalk");
                requestSent = false;
            }
            catch
            {
                //Popup with error
                inst.DisplayPopup("Error", "There was an error cancelling request.");
            }
        }

        //Request button clicked
        public void RequestButtonClicked (string name, string fromLocation, string toLocation, string additionalInfo) {

            //Lock mutex and disable button
            mutex.WaitOne();
            inst.SetRequestButtonEnabled(false);

            //If button is set to request
            if (requestSent == false)
            {
                //Check if all required input fields have been filled out
                if (String.IsNullOrEmpty(name) || String.IsNullOrEmpty(fromLocation) || String.IsNullOrEmpty(toLocation))
                {
                    //Display error
                    inst.DisplayPopup("Error", "Please check your input.");

                    //Enable button and release mutex
                    inst.SetRequestButtonEnabled(true);
                    mutex.ReleaseMutex();
                    return;
                }

                SendRequest(name, fromLocation, toLocation, additionalInfo);

            }
            else //If button is set to cancel
            {
                CancelRequest();
            }

            //Enable button and unlock mutex
            inst.SetRequestButtonEnabled(true);
            mutex.ReleaseMutex();

        }
    }
}

