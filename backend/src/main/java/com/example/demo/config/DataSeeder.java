package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.model.LearningItem.ItemType;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ConceptRepository conceptRepository;

    public DataSeeder(CourseRepository courseRepository, UserRepository userRepository, ConceptRepository conceptRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.conceptRepository = conceptRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User defaultUser = new User();
            defaultUser.setName("Alex Johnson");
            defaultUser.setEmail("student@example.com");
            defaultUser.setPassword("password123");
            defaultUser.setSkillLevel("Intermediate");
            defaultUser.setLearningGoal("Backend Engineer");
            defaultUser.setStreak(14);
            defaultUser.setOverallReadiness(82);
            defaultUser.setFocusIndex(88);
            userRepository.save(defaultUser);
        }

        if (courseRepository.count() == 0) {
            // Seed Concepts
            Concept cOop = new Concept();
            cOop.setName("OOP");
            cOop.setDescription("Object-Oriented Programming");
            
            Concept cCollections = new Concept();
            cCollections.setName("Collections");
            cCollections.setDescription("Java Collections Framework");
            cCollections.setPrerequisites(Collections.singletonList(cOop));

            conceptRepository.saveAll(Arrays.asList(cOop, cCollections));

            // Seed Course
            Course javaCourse = new Course();
            javaCourse.setTitle("Java Backend Fundamentals");
            javaCourse.setDescription("Master Java Backend concepts from OOP to Data Structures.");
            javaCourse.setDifficulty("Intermediate");
            javaCourse.setDuration("4 Weeks");
            javaCourse.setProgress(0);
            javaCourse.setCategory("Backend Development");

            // Module 1
            com.example.demo.model.Module m1 = new com.example.demo.model.Module();
            m1.setTitle("Data Structures in Java");
            m1.setCourse(javaCourse);

            // Item 1: Video
            LearningItem item1 = new LearningItem();
            item1.setTitle("Understanding HashMaps in Java");
            item1.setType(ItemType.VIDEO);
            item1.setVideoUrl("https://www.youtube.com/embed/grEKMHGYyns");
            item1.setModule(m1); item1.setContent("A HashMap in Java implements the Map interface to store key-value pairs. It uses a hashing function to compute an index (hash code) for the key, determining which bucket the value will be stored in. A HashMap provides O(1) average time complexity for both get() and put() operations. If two different keys generate the same hash code, a 'collision' occurs. Before Java 8, collisions were handled purely using a LinkedList at the bucket. In Java 8 and later, if a bucket gets more than 8 elements (TREEIFY_THRESHOLD), the LinkedList is transformed into a Red-Black Tree, improving the worst-case time complexity from O(n) to O(log n). Keys in a HashMap must override both equals() and hashCode() properly.");
            
            ItemConcept ic1 = new ItemConcept();
            ic1.setLearningItem(item1);
            ic1.setConcept(cCollections);
            ic1.setWeight(0.5); // Introduces the concept
            item1.setItemConcepts(Arrays.asList(ic1));

            // Item 2: Coding Task
            LearningItem item2 = new LearningItem();
            item2.setTitle("Implement a frequency counter");
            item2.setType(ItemType.CODING);
            item2.setContent("Write a function that counts the frequency of characters in a string using a HashMap.");
            item2.setTestCases("[{\"input\":\"hello\", \"expected\": {\"h\":1, \"e\":1, \"l\":2, \"o\":1}}]");
            item2.setModule(m1);

            ItemConcept ic2 = new ItemConcept();
            ic2.setLearningItem(item2);
            ic2.setConcept(cCollections);
            ic2.setWeight(1.0); // Heavily tests the concept
            item2.setItemConcepts(Arrays.asList(ic2));

            // Item 3: Quiz
            LearningItem item3 = new LearningItem();
            item3.setTitle("HashMap Conceptual Quiz");
            item3.setType(ItemType.QUIZ);
            item3.setTestCases("[{\"id\": 1, \"text\": \"Why is HashMap typically O(1) for lookups?\", \"options\": [\"It uses a hashing function to map keys to array indices\", \"It performs a binary search on sorted keys\", \"It iterates through all elements until a match is found\", \"It uses a self-balancing binary search tree natively\"], \"correctAnswer\": \"It uses a hashing function to map keys to array indices\", \"explanation\": \"Hash functions convert keys into direct array indices for instant access.\"}, {\"id\": 2, \"text\": \"What happens in a HashMap when a 'collision' occurs?\", \"options\": [\"The HashMap throws a RuntimeException\", \"The new entry overwrites the old entry automatically\", \"The entries are stored in a linked list (or tree) at that specific index\", \"The HashMap resizes immediately to avoid the collision\"], \"correctAnswer\": \"The entries are stored in a linked list (or tree) at that specific index\", \"explanation\": \"Java HashMaps handle collisions by chaining elements in a list or tree at the same bucket.\"}, {\"id\": 3, \"text\": \"Which interface does HashMap implement?\", \"options\": [\"List\", \"Set\", \"Collection\", \"Map\"], \"correctAnswer\": \"Map\", \"explanation\": \"HashMap implements the Map interface, which maps keys to values.\"}]");
            item3.setModule(m1);
            
            ItemConcept ic3 = new ItemConcept();
            ic3.setLearningItem(item3);
            ic3.setConcept(cCollections);
            ic3.setWeight(0.8);
            item3.setItemConcepts(Arrays.asList(ic3));

            m1.setLearningItems(Arrays.asList(item1, item2, item3));
            javaCourse.setModules(Arrays.asList(m1));

            courseRepository.save(javaCourse);
            
            System.out.println("Seeded Java Backend Course with Concept mastery links!");
        }
    }
}
