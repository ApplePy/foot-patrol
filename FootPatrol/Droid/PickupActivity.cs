﻿using Android.App; using Android.Widget; using Android.OS; using Android.Views; using Android.Runtime; using System;  namespace FootPatrol.Droid {     public class PickUpActivity : Android.Support.V4.App.Fragment     {         public PickUpActivity()         {          }          public override View OnCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)         {             View view = inflater.Inflate(Resource.Layout.PickupLayout, container, false);             return view;         }     } }