package com.sep.sep_backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String wordDE;
    private String wordEN;
    private String wordType; // Nomen, Verb, Adjektiv, etc.
    private String theme;    // Grundlagen, Tiere, Essen, etc.

    public Vocabulary() {
    }

    // Konstruktor für die Datenbank
    public Vocabulary(String wordDE, String wordEN, String wordType, String theme) {
        this.wordDE = wordDE;
        this.wordEN = wordEN;
        this.wordType = wordType;
        this.theme = theme;
    }


    // Getter und Setter
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getWordDE() {
        return wordDE;
    }
    public void setWordDE(String wordDE) {
        this.wordDE = wordDE;
    }
    public String getWordEN() {
        return wordEN;
    }
    public void setWordEN(String wordEN) {
        this.wordEN = wordEN;
    }
    public String getWordType() {
        return wordType;
    }
    public void setWordType(String wordType) {
        this.wordType = wordType;
    }
    public String getTheme() {
        return theme;
    }
    public void setTheme(String theme) {
        this.theme = theme;
    }
}
