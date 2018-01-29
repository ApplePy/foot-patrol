using System;
using System.Threading.Tasks;
using Foundation;
using UIKit;

namespace FootPatrol.iOS
{
    public partial class ViewController : UIViewController, IViewController
    {

        public int requestID;
        public bool requestSent = false;

        private SViewController sharedViewController;

        protected ViewController(IntPtr handle) : base(handle)
        {
            // Note: this .ctor should not contain any initialization logic.

            sharedViewController = new SViewController(this);
        }

        public override void ViewDidLoad()
        {
            base.ViewDidLoad();

            //Request button clicked
            RequestButton.TouchUpInside += async (object sender, EventArgs e) => {

                if (requestSent == false) {

                    requestSent = true;
                    RequestButton.Enabled = false;

                    //Resign first responders
                    NameTextBox.ResignFirstResponder();
                    CurrentLocationTextBox.ResignFirstResponder();
                    DestinationTextBox.ResignFirstResponder();

                    //Get user information
                    string name = NameTextBox.Text;
                    string fromLocation = CurrentLocationTextBox.Text;
                    string toLocation = DestinationTextBox.Text;
                    string additionalInfo = AdditionalInfoTextBox.Text;

                    //Check if all required input fields have been filled out
                    if (name == "" || name == null)
                    {
                        NameTextBox.BackgroundColor = UIColor.Red;
                        return;
                    }
                    else if (fromLocation == "" || fromLocation == null)
                    {
                        CurrentLocationTextBox.BackgroundColor = UIColor.Red;
                        return;
                    }
                    else if (toLocation == "" || toLocation == null)
                    {
                        DestinationTextBox.BackgroundColor = UIColor.Red;
                        return;
                    }
                    else
                    {
                        NameTextBox.BackgroundColor = UIColor.White;
                        CurrentLocationTextBox.BackgroundColor = UIColor.White;
                    }

                    //Send footpatrol request
                    try
                    {
                        requestID = await RequestService.SendFootPatrolRequest(name, fromLocation, toLocation, additionalInfo);
                    }
                    catch (Exception error)
                    {
                        requestSent = false;

                        //Popup with error
                        var errorAlert = UIAlertController.Create("Error", "Please check your input.", UIAlertControllerStyle.Alert);
                        errorAlert.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));
                        PresentViewController(errorAlert, true, null);

                        RequestButton.Enabled = true;

                        return;
                    }

                    RequestButton.SetTitle("Cancel SafeWalk Request", UIControlState.Normal);

                    //Popup saying that request has been sent
                    var requestSentAlert = UIAlertController.Create("Request Sent", "Your SafeWalk request has been sent.", UIAlertControllerStyle.Alert);
                    requestSentAlert.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));
                    PresentViewController(requestSentAlert, true, null);

                    RequestButton.Enabled = true;

                } else {

                    requestSent = false;
                    RequestButton.Enabled = false;

                    //Cancel footpatrol request
                    try 
                    {
                        await RequestService.DeleteFootPatrolRequest(requestID);
                    }
                    catch (Exception error)
                    {
                        requestSent = true;

                        //Popup with error
                        var errorAlert = UIAlertController.Create("Error", "There was an error cancelling request.", UIAlertControllerStyle.Alert);
                        errorAlert.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));
                        PresentViewController(errorAlert, true, null);

                        RequestButton.Enabled = true;

                        return;
                    }

                    RequestButton.SetTitle("Request SafeWalk", UIControlState.Normal);

                    //Popup saying that request has been sent
                    var requestSentAlert = UIAlertController.Create("Request Cancelled", "Your SafeWalk request has been cancelled.", UIAlertControllerStyle.Alert);
                    requestSentAlert.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));
                    PresentViewController(requestSentAlert, true, null);

                    RequestButton.Enabled = true;

                }
            };

            //Feedback button clicked
            FeedbackButton.TouchUpInside += (object sender, EventArgs e) => {

                UIApplication.SharedApplication.OpenUrl(new NSUrl("https://docs.google.com/forms/d/e/1FAIpQLSdeB7-BxZh4oWTGqrMGMUL4wu0ufQRKmEyNvwKGfzXt8OdZYQ/viewform?usp=sf_link"));

            };

        }

        //Create and Display Popup
        public void DisplayPopup(string messsageTitle, string messageBody) 
        {
            var popup = UIAlertController.Create(messsageTitle, messageBody, UIAlertControllerStyle.Alert);
            popup.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));
            PresentViewController(popup, true, null);
        }

        public override void DidReceiveMemoryWarning()
        {
            base.DidReceiveMemoryWarning();
            // Release any cached data, images, etc that aren't in use.
        }
    }
}

