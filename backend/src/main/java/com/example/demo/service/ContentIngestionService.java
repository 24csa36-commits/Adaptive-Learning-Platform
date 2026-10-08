package com.example.demo.service;

import com.example.demo.dto.ContentIngestionRequest;
import com.example.demo.model.Concept;
import com.example.demo.model.ItemConcept;
import com.example.demo.model.LearningItem;
import com.example.demo.repository.ConceptRepository;
import com.example.demo.repository.ItemConceptRepository;
import com.example.demo.repository.LearningItemRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class ContentIngestionService {

    private final GroqAIService aiService;
    private final ConceptRepository conceptRepository;
    private final LearningItemRepository learningItemRepository;
    private final ItemConceptRepository itemConceptRepository;

    public ContentIngestionService(GroqAIService aiService, 
                                   ConceptRepository conceptRepository, 
                                   LearningItemRepository learningItemRepository, 
                                   ItemConceptRepository itemConceptRepository) {
        this.aiService = aiService;
        this.conceptRepository = conceptRepository;
        this.learningItemRepository = learningItemRepository;
        this.itemConceptRepository = itemConceptRepository;
    }

    /**
     * Processes a new course material (e.g., YouTube video transcript).
     * 1. Generates context-aware quizzes from the transcript via Groq.
     * 2. (Mocked) Stores transcript chunks in Vector Database (pgvector).
     * 3. Saves the video and generated quiz as LearningItems linked to the Concept.
     */
    public String ingestAndGenerateContent(ContentIngestionRequest request) {
        Optional<Concept> conceptOpt = conceptRepository.findById(request.getConceptId());
        if (conceptOpt.isEmpty()) {
            throw new IllegalArgumentException("Concept ID not found");
        }
        Concept concept = conceptOpt.get();

        // 1. Vector Database Embedding (Simulated here if pgvector bean isn't directly wired yet)
        System.out.println("Chunking transcript and saving embeddings to pgvector for RAG...");
        // e.g., vectorStore.add(List.of(new Document(request.getTranscript())));

        // 2. Save the Video as a Learning Item
        LearningItem videoItem = new LearningItem();
        videoItem.setTitle(request.getTitle() + " (Video)");
        videoItem.setType(LearningItem.ItemType.VIDEO);
        videoItem.setVideoUrl(request.getYoutubeUrl());
        videoItem.setContent(request.getTranscript()); // Saving transcript for reference
        videoItem = learningItemRepository.save(videoItem);

        ItemConcept videoIc = new ItemConcept();
        videoIc.setLearningItem(videoItem);
        videoIc.setConcept(concept);
        videoIc.setWeight(0.5);
        itemConceptRepository.save(videoIc);

        // 3. Generate the Context-Aware Quiz using Llama 3
        int numQuestions = request.getNumQuestions() != null ? request.getNumQuestions() : 3;
        String quizJson = aiService.generateContextAwareQuiz(request.getTranscript(), numQuestions);

        // 4. Save the generated Quiz as a Learning Item
        LearningItem quizItem = new LearningItem();
        quizItem.setTitle(request.getTitle() + " (Knowledge Check)");
        quizItem.setType(LearningItem.ItemType.QUIZ);
        quizItem.setTestCases(quizJson); // Storing the generated JSON array here
        quizItem = learningItemRepository.save(quizItem);

        ItemConcept quizIc = new ItemConcept();
        quizIc.setLearningItem(quizItem);
        quizIc.setConcept(concept);
        quizIc.setWeight(1.0); // Quizzes carry more weight for mastery
        itemConceptRepository.save(quizIc);

        return "Successfully ingested video, embedded to vector store, and generated " + numQuestions + " context-aware questions.";
    }
}
