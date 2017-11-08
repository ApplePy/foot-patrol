using System;
using Foundation;
using UIKit;

namespace FootPatrol.iOS
{
    public partial class ViewController : UIViewController
    {
        protected ViewController(IntPtr handle) : base(handle)
        {
            // Note: this .ctor should not contain any initialization logic.
        }

        public override void ViewDidLoad()
        {
            base.ViewDidLoad();
            // Perform any additional setup after loading the view, typically from a nib.

            RequestButton.TouchUpInside += (object sender, EventArgs e) => {

                //Resign first responders
                NameTextBox.ResignFirstResponder();
                CurrentLocationTextBox.ResignFirstResponder();
                DestinationTextBox.ResignFirstResponder();

                //Get user information
                string name = NameTextBox.Text;
                string currentLocation = CurrentLocationTextBox.Text;
                string destination = DestinationTextBox.Text;

                //Check if all required input fields have been filled out
                if (name == "" || name == null) {
                    NameTextBox.BackgroundColor = UIColor.Red;
                    return;
                } else if (currentLocation == "" || currentLocation == null) {
                    CurrentLocationTextBox.BackgroundColor = UIColor.Red;
                    return;
                } else {
                    NameTextBox.BackgroundColor = UIColor.White;
                    CurrentLocationTextBox.BackgroundColor = UIColor.White;
                }
                    
                //Sent footpatrol request
                RequestService.SendFootPatrolRequest(name, currentLocation, destination).Wait();

                //Popup saying that request has been sent
                var requestSentAlert = UIAlertController.Create("Request Sent", "Your SafeWalk request has been sent.", UIAlertControllerStyle.Alert);
                requestSentAlert.AddAction(UIAlertAction.Create("Ok", UIAlertActionStyle.Default, null));
                PresentViewController(requestSentAlert, true, null);
            };

            FeedbackButton.TouchUpInside += (object sender, EventArgs e) => {

                UIApplication.SharedApplication.OpenUrl(new NSUrl("https://docs.google.com/forms/d/e/1FAIpQLSdeB7-BxZh4oWTGqrMGMUL4wu0ufQRKmEyNvwKGfzXt8OdZYQ/viewform?usp=sf_link"));

            };

        }

        public override void DidReceiveMemoryWarning()
        {
            base.DidReceiveMemoryWarning();
            // Release any cached data, images, etc that aren't in use.
        }
    }
}

