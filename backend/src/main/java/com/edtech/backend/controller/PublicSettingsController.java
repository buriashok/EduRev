package com.edtech.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class PublicSettingsController {

    // These would ideally come from a database, but using the same mock storage as AdminController for consistency
    public static Map<String, String> platformSettings = new HashMap<>();
    static {
        platformSettings.put("siteName", "EduRev");
        platformSettings.put("maintenanceMode", "false");
        platformSettings.put("primaryColor", "#0f62fe");
    }

    @GetMapping
    public Map<String, String> getSettings() {
        return platformSettings;
    }
}
