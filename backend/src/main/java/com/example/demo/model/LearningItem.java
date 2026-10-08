package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Data
public class LearningItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Enumerated(EnumType.STRING)
    private ItemType type; // VIDEO, QUIZ, CODING
    
    private String videoUrl;
    
    @Column(columnDefinition = "TEXT")
    private String content; // Content, Question text, or Problem Description
    
    @Column(columnDefinition = "TEXT")
    private String testCases; // JSON string for code sandbox test cases or quiz options
    
    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonIgnore
    private Module module;

    @OneToMany(mappedBy = "learningItem", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ItemConcept> itemConcepts;

    public enum ItemType {
        VIDEO, QUIZ, CODING
    }
}
