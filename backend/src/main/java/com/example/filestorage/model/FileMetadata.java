package com.example.filestorage.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "files")
public class FileMetadata {
    @Id
    private String id;
    private String filename;
    private String contentType;
    private long size;
    private Date uploadDate;
    private String ownerId;

    public String getDisplaySize() {
        double sizeInMb = (double) size / (1024 * 1024);
        return String.format("%.2f MB", sizeInMb);
    }
}
