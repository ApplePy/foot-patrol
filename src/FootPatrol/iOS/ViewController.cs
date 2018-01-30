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
            RequestButton.TouchUpInside += (object sender, EventArgs e) => {

                //Resign first responders
                NameTextBox.ResignFirstResponder();
                CurrentLocationTextBox.ResignFirstResponder();
                DestinationTextBox.ResignFirstResponder();

                //Get user information
                string name = NameTextBox.Text;
                string fromLocation = CurrentLocationTextBox.Text;
                string toLocation = DestinationTextBox.Text;
                string additionalInfo = AdditionalInfoTextBox.Text;

                sharedViewController.RequestButtonClicked(name, fromLocation, toLocation, additionalInfo);

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

        public void SetRequestButtonEnabled(bool enabled) 
        {
            RequestButton.Enabled = enabled;
        }

        public void SetRequestButtonTitle(string title) 
        {
            RequestButton.SetTitle(title, UIControlState.Normal);
        }

        public override void DidReceiveMemoryWarning()
        {
            base.DidReceiveMemoryWarning();
            // Release any cached data, images, etc that aren't in use.
        }
    }
}

