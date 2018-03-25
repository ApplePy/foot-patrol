using System;
namespace FootPatrol
{
    public class FPRequest
    {
        public int id;
        public string name;
        public string from_location;
        public string to_location;
        public string additional_info;
        public bool? archived;
        public string timestamp;
    }
}
