package com.edtech.backend.controller;

import com.edtech.backend.service.PlatformSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class PublicSettingsController {

    @Autowired
    private PlatformSettingsService platformSettingsService;

    @GetMapping
    public Map<String, String> getSettings() {
        return platformSettingsService.getSettings();
    }
}
