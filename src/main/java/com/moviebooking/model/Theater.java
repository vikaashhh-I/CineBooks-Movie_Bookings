package com.moviebooking.model;

public class Theater {
    private int theaterId;
    private String theaterName;
    private String location;

    public Theater(int theaterId, String theaterName, String location) {
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.location = location;
    }

    public int getTheaterId() { return theaterId; }
    public String getTheaterName() { return theaterName; }
    public String getLocation() { return location; }
}
