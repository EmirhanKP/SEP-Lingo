package com.sep.sep_backend.controller;


import com.sep.sep_backend.model.Vocabulary;
import com.sep.sep_backend.repository.VocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:4200")
public class ExerciseController {

    // Dependency Injection des VocabularyRepository
    @Autowired
    private VocabularyRepository vocabularyRepository;

    @GetMapping("/all")
    public List<Vocabulary> getAllVocabulary(){
        return vocabularyRepository.findAll();
    }

    @GetMapping("/random")
    public ResponseEntity<Vocabulary> getRandomVocabulary() {
        // alle Vokabeln aus Datenbank
        List<Vocabulary> allVocabulary = vocabularyRepository.findAll();

        // falls Datenbank leer ist, 404 zurückgeben
        if (allVocabulary.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // zufällige Vokabel auswählen
        Random rand = new Random();
        Vocabulary randomVocab = allVocabulary.get(rand.nextInt(allVocabulary.size()));

        //
        return ResponseEntity.ok(randomVocab);
    }

    // TODO: Weitere Endpunkte für Übungen hinzufügen
    // z.B. Multiple Choice, Lückentexte, etc.
    }



