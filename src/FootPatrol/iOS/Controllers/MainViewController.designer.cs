// WARNING
//
// This file has been generated automatically by Visual Studio from the outlets and
// actions declared in your storyboard file.
// Manual changes to this file will not be maintained.
//
using Foundation;
using System;
using System.CodeDom.Compiler;

namespace FootPatrol.iOS
{
    [Register ("MainViewController")]
    partial class MainViewController
    {
        [Outlet]
        UIKit.UIButton Button { get; set; }

        [Outlet]
        [GeneratedCode ("iOS Designer", "1.0")]
        UIKit.UITextField AdditionalInfoTextBox { get; set; }

        [Outlet]
        [GeneratedCode ("iOS Designer", "1.0")]
        UIKit.UITextField CurrentLocationTextBox { get; set; }

        [Outlet]
        [GeneratedCode ("iOS Designer", "1.0")]
        UIKit.UITextField DestinationTextBox { get; set; }

        [Outlet]
        [GeneratedCode ("iOS Designer", "1.0")]
        UIKit.UIButton FeedbackButton { get; set; }

        [Outlet]
        [GeneratedCode ("iOS Designer", "1.0")]
        UIKit.UITextField NameTextBox { get; set; }

        [Outlet]
        [GeneratedCode ("iOS Designer", "1.0")]
        UIKit.UIButton RequestButton { get; set; }

        void ReleaseDesignerOutlets ()
        {
            if (AdditionalInfoTextBox != null) {
                AdditionalInfoTextBox.Dispose ();
                AdditionalInfoTextBox = null;
            }

            if (CurrentLocationTextBox != null) {
                CurrentLocationTextBox.Dispose ();
                CurrentLocationTextBox = null;
            }

            if (DestinationTextBox != null) {
                DestinationTextBox.Dispose ();
                DestinationTextBox = null;
            }

            if (FeedbackButton != null) {
                FeedbackButton.Dispose ();
                FeedbackButton = null;
            }

            if (NameTextBox != null) {
                NameTextBox.Dispose ();
                NameTextBox = null;
            }

            if (RequestButton != null) {
                RequestButton.Dispose ();
                RequestButton = null;
            }
        }
    }
}