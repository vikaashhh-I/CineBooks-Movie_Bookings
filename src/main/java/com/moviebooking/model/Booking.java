package com.moviebooking.model;

public class Booking {
    private int bookingId;
    private int userId;
    private int showtimeId;
    private double totalAmount;
    private String bookingStatus;

    public Booking(int bookingId, int userId, int showtimeId, double totalAmount, String bookingStatus) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.totalAmount = totalAmount;
        this.bookingStatus = bookingStatus;
    }

    public int getBookingId() { return bookingId; }
    public int getUserId() { return userId; }
    public int getShowtimeId() { return showtimeId; }
    public double getTotalAmount() { return totalAmount; }
    public String getBookingStatus() { return bookingStatus; }
}
