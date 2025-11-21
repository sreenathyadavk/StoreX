package com.example.filestorage.repository;

import com.example.filestorage.model.FileMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FileMetadataRepository extends MongoRepository<FileMetadata, String> {
    List<FileMetadata> findByOwnerId(String ownerId);
}
