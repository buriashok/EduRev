package com.edtech.backend.dto;

import com.edtech.backend.model.Role;

public class AdminUserUpdateRequest {

    private Role role;
    private Boolean active;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
