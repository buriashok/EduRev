package com.edtech.backend.security;

import org.springframework.security.core.GrantedAuthority;

public final class RoleAccess {

    private RoleAccess() {
    }

    public static boolean isAdmin(UserPrincipal userPrincipal) {
        return hasAuthority(userPrincipal, "ROLE_ADMIN");
    }

    public static boolean isInstructor(UserPrincipal userPrincipal) {
        return hasAuthority(userPrincipal, "ROLE_INSTRUCTOR");
    }

    public static boolean canManageInstructorContent(UserPrincipal userPrincipal, Long ownerId) {
        return isAdmin(userPrincipal) || (ownerId != null && ownerId.equals(userPrincipal.getId()));
    }

    private static boolean hasAuthority(UserPrincipal userPrincipal, String authority) {
        return userPrincipal != null
                && userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority::equals);
    }
}
