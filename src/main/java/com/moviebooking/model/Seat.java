package com.moviebooking.model;

public class Seat {
    private int seatId;
    private int theaterId;
    private String seatNumber;
    private String seatType;
    private double price;

    public Seat(int seatId, int theaterId, String seatNumber, String seatType, double price) {
        this.seatId = seatId;
        this.theaterId = theaterId;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.price = price;
    }

    public int getSeatId() { return seatId; }
    public int getTheaterId() { return theaterId; }
    public String getSeatNumber() { return seatNumber; }
    public String getSeatType() { return seatType; }
    public double getPrice() { return price; }
}
