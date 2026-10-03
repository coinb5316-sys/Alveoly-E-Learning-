package com.alveoly.learning;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // This line is required by the plugin
        ModifiedMainActivityForSocialLoginPlugin.super.onCreate(savedInstanceState);
    }
}