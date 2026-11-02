package com.moviebooking.service;

public class UserAccountUnavailableException extends RuntimeException {

    public UserAccountUnavailableException() {
        super("The account associated with this session is no longer available.");
    }
}
