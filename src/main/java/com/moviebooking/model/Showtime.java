package com.moviebooking.model;

public class Showtime {
    private int showtimeId;
    private int movieId;
    private int theaterId;
    private String showDate;
    private String showTime;
    private String showType;

    public Showtime(
            int showtimeId, int movieId, int theaterId,
            String showDate, String showTime, String showType) {
        this.showtimeId = showtimeId;
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.showDate = showDate;
        this.showTime = showTime;
        this.showType = showType;
    }

    public int getShowtimeId() { return showtimeId; }
    public int getMovieId() { return movieId; }
    public int getTheaterId() { return theaterId; }
    public String getShowDate() { return showDate; }
    public String getShowTime() { return showTime; }
    public String getShowType() { return showType; }
}
