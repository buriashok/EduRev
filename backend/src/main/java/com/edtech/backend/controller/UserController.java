package com.edtech.backend.controller;

import com.edtech.backend.model.User;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userService.getUserById(userPrincipal.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(userPrincipal.getId(), userDetails);
        return ResponseEntity.ok(updatedUser);
    }
}
