package com.example.filestorage.controller;

import com.example.filestorage.model.FileMetadata;
import com.example.filestorage.model.User;
import com.example.filestorage.repository.UserRepository;
import com.example.filestorage.security.FileSecurityService;
import com.example.filestorage.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileSecurityService fileSecurityService;

    @GetMapping("/files")
    public ResponseEntity<List<FileMetadata>> getFiles(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<FileMetadata> files = fileStorageService.getFilesByOwner(user.getId());
        return ResponseEntity.ok(files);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
            fileStorageService.storeFile(file, user.getId());
            return ResponseEntity.ok(Map.of("message", "File uploaded successfully"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to upload file"));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) throws java.io.FileNotFoundException, java.net.MalformedURLException {
        FileMetadata metadata = fileStorageService.getFile(id).orElseThrow();
        
        if (!fileSecurityService.isOwner(metadata, userDetails)) {
            return ResponseEntity.status(403).build();
        }

        Path filePath = fileStorageService.getFilePath(metadata.getFilename(), metadata.getOwnerId());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new java.io.FileNotFoundException("File not found " + metadata.getFilename());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) throws java.io.FileNotFoundException, java.net.MalformedURLException {
        FileMetadata metadata = fileStorageService.getFile(id).orElseThrow();

        if (!fileSecurityService.isOwner(metadata, userDetails)) {
            return ResponseEntity.status(403).build();
        }

        Path filePath = fileStorageService.getFilePath(metadata.getFilename(), metadata.getOwnerId());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new java.io.FileNotFoundException("File not found " + metadata.getFilename());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        FileMetadata metadata = fileStorageService.getFile(id).orElseThrow();

        if (fileSecurityService.isOwner(metadata, userDetails)) {
            fileStorageService.deleteFile(id);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        }
        
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @GetMapping("/usage")
    public ResponseEntity<Map<String, Long>> getStorageUsage(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        long usage = fileStorageService.getTotalStorageUsage(user.getId());
        return ResponseEntity.ok(Map.of("usage", usage));
    }
}
