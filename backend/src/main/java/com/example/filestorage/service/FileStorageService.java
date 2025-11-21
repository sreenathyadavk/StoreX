package com.example.filestorage.service;

import com.example.filestorage.model.FileMetadata;
import com.example.filestorage.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    public FileMetadata storeFile(MultipartFile file, String ownerId) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file.");
        }
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Security: Prevent path traversal attacks
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new IOException("Invalid filename: " + filename);
        }
        
        // Security: Validate filename is not empty after cleaning
        if (filename.isEmpty()) {
            throw new IOException("Invalid filename");
        }
        
        Path userDir = Paths.get(uploadDir, "user_" + ownerId);

        if (!Files.exists(userDir)) {
            Files.createDirectories(userDir);
        }

        Path filePath = userDir.resolve(filename);
        
        // Security: Ensure the resolved path is still within user directory
        if (!filePath.normalize().startsWith(userDir.normalize())) {
            throw new IOException("Invalid file path");
        }
        
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        FileMetadata metadata = new FileMetadata();
        metadata.setFilename(filename);
        metadata.setContentType(file.getContentType());
        metadata.setSize(file.getSize());
        metadata.setUploadDate(new Date());
        metadata.setOwnerId(ownerId);

        return fileMetadataRepository.save(metadata);
    }

    public List<FileMetadata> getFilesByOwner(String ownerId) {
        return fileMetadataRepository.findByOwnerId(ownerId);
    }

    public Optional<FileMetadata> getFile(String id) {
        return fileMetadataRepository.findById(id);
    }
    
    public Path getFilePath(String filename, String ownerId) {
        return Paths.get(uploadDir, "user_" + ownerId).resolve(filename);
    }

    public void deleteFile(String id) throws IOException {
        Optional<FileMetadata> metadataOpt = fileMetadataRepository.findById(id);
        if (metadataOpt.isPresent()) {
            FileMetadata metadata = metadataOpt.get();
            Path filePath = Paths.get(uploadDir, "user_" + metadata.getOwnerId()).resolve(metadata.getFilename());
            Files.deleteIfExists(filePath);
            fileMetadataRepository.deleteById(id);
        }
    }

    public long getTotalStorageUsage(String ownerId) {
        return fileMetadataRepository.findByOwnerId(ownerId).stream()
                .mapToLong(FileMetadata::getSize)

                .sum();
    }

    public void deleteAllFilesForUser(String ownerId) throws IOException {
        List<FileMetadata> userFiles = fileMetadataRepository.findByOwnerId(ownerId);
        
        // Delete physical files
        Path userDir = Paths.get(uploadDir, "user_" + ownerId);
        if (Files.exists(userDir)) {
            // Delete all files in the directory
            try (var stream = Files.walk(userDir)) {
                stream.sorted((p1, p2) -> -p1.compareTo(p2)) // Reverse order to delete files before dir
                      .forEach(path -> {
                          try {
                              Files.delete(path);
                          } catch (IOException e) {
                              e.printStackTrace();
                          }
                      });
            }
        }

        // Delete metadata
        fileMetadataRepository.deleteAll(userFiles);
    }
}
