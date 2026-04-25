package com.edtech.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class BulkUserImportRequest {

    @NotBlank
    private String csvContent;

    public String getCsvContent() {
        return csvContent;
    }

    public void setCsvContent(String csvContent) {
        this.csvContent = csvContent;
    }
}
