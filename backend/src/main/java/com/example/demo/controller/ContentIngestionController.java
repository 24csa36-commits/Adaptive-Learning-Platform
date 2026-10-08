package com.example.demo.controller;

import com.example.demo.dto.ContentIngestionRequest;
import com.example.demo.service.ContentIngestionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ingestion")
public class ContentIngestionController {

    private final ContentIngestionService ingestionService;

    public ContentIngestionController(ContentIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping("/video")
    public String ingestVideo(@RequestBody ContentIngestionRequest request) {
        return ingestionService.ingestAndGenerateContent(request);
    }
}
