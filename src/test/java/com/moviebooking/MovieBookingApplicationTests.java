package com.moviebooking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import com.moviebooking.controller.BookingController;
import com.moviebooking.model.BookingRequest;
import com.moviebooking.service.BookingService;
import com.moviebooking.service.UserAccountUnavailableException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest
class MovieBookingApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void missingBookingAccountReturnsUnauthorizedResponse() {
		BookingService service = mock(BookingService.class);
		when(service.createBooking(org.mockito.ArgumentMatchers.any()))
			.thenThrow(new UserAccountUnavailableException());

		var response = new BookingController(service)
			.createBooking(new BookingRequest());

		assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
		assertEquals(
			"The account associated with this session is no longer available.",
			response.getBody().get("error")
		);
	}

}
