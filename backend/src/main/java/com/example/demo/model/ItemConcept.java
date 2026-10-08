package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class ItemConcept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "learning_item_id")
    @JsonIgnore
    private LearningItem learningItem;
    
    @ManyToOne
    @JoinColumn(name = "concept_id")
    private Concept concept;
    
    // How strongly this item tests/teaches the concept (0.0 to 1.0)
    private Double weight; 
}
