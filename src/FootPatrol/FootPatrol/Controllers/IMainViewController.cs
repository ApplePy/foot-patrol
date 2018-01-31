using System;
namespace FootPatrol
{
    public interface IMainViewController
    {
        void DisplayPopup(string messsageTitle, string messageBody);
        void SetRequestButtonEnabled(bool enabled);
        void SetRequestButtonTitle(string title);
    }
}
