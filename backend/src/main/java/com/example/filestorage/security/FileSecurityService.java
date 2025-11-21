package com.example.filestorage.security;

import com.example.filestorage.model.FileMetadata;
import com.example.filestorage.model.User;
import com.example.filestorage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class FileSecurityService {

    @Autowired
    private UserRepository userRepository;

    public boolean isOwner(FileMetadata fileMetadata, UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return fileMetadata.getOwnerId().equals(user.getId());
    }
}
