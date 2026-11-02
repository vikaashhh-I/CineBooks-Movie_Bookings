
package com.moviebooking.model;

public class Movie {

    private int movieId;
    private String title;
    private String genre;
    private String language;
    private int duration;
    private String description;

    public Movie(int movieId, String title, String genre,
                 String language, int duration, String description) {
        this.movieId = movieId;
        this.title = title;
        this.genre = genre;
        this.language = language;
        this.duration = duration;
        this.description = description;
    }

    public int getMovieId() {
        return movieId;
    }

    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genre;
    }

    public String getLanguage() {
        return language;
    }

    public int getDuration() {
        return duration;
    }

    public String getDescription() {
        return description;
    }
}

