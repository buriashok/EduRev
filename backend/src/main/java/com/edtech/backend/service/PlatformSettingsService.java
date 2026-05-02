package com.edtech.backend.service;

import com.edtech.backend.model.PlatformSetting;
import com.edtech.backend.repository.PlatformSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
public class PlatformSettingsService {

    private static final Map<String, String> DEFAULTS = Map.of(
            "siteName", "EduRev",
            "maintenanceMode", "false",
            "primaryColor", "#0f62fe"
    );

    private static final Set<String> ALLOWED_KEYS = Set.of("siteName", "maintenanceMode", "primaryColor");

    @Autowired
    private PlatformSettingRepository platformSettingRepository;

    @Transactional
    public Map<String, String> getSettings() {
        ensureDefaults();
        Map<String, String> settings = new LinkedHashMap<>();
        platformSettingRepository.findAll().forEach(setting -> settings.put(setting.getKey(), setting.getValue()));
        DEFAULTS.forEach(settings::putIfAbsent);
        return settings;
    }

    @Transactional
    public Map<String, String> updateSettings(Map<String, String> updates) {
        ensureDefaults();
        updates.forEach((key, value) -> {
            if (!ALLOWED_KEYS.contains(key)) {
                return;
            }

            PlatformSetting setting = platformSettingRepository.findById(key).orElseGet(() -> {
                PlatformSetting created = new PlatformSetting();
                created.setKey(key);
                return created;
            });

            setting.setValue(sanitizeValue(key, value));
            platformSettingRepository.save(setting);
        });
        return getSettings();
    }

    private void ensureDefaults() {
        DEFAULTS.forEach((key, value) -> {
            if (!platformSettingRepository.existsById(key)) {
                PlatformSetting setting = new PlatformSetting();
                setting.setKey(key);
                setting.setValue(value);
                platformSettingRepository.save(setting);
            }
        });
    }

    private String sanitizeValue(String key, String value) {
        String sanitized = value == null ? "" : value.trim();

        if ("maintenanceMode".equals(key)) {
            return Boolean.toString(Boolean.parseBoolean(sanitized));
        }

        if ("primaryColor".equals(key) && !sanitized.matches("^#[0-9a-fA-F]{6}$")) {
            throw new RuntimeException("Primary color must be a hex color like #0f62fe");
        }

        if ("siteName".equals(key) && (sanitized.isBlank() || sanitized.length() > 80)) {
            throw new RuntimeException("Site name must be between 1 and 80 characters");
        }

        return sanitized;
    }
}
