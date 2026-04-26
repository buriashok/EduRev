package com.edtech.backend.repository;

import com.edtech.backend.model.AiChatMessage;
import com.edtech.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findByUserOrderByCreatedAtAsc(User user);
}
