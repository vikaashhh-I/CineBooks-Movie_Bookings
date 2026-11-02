
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api";
const SHOW_FORMATS = ["2D", "3D", "IMAX"];

function getNextShowDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  });
}

function formatShowTime(showTime) {
  const [hours, minutes] = showTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatBookingDate(showDate) {
  const [year, month, day] = String(showDate).slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const monthName = date.toLocaleDateString(undefined, { month: "short" });
  const daySuffix = day % 10 === 1 && day !== 11
    ? "st"
    : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

  return `${weekday}, ${day}${daySuffix} ${monthName}`;
}

function formatBookingTime(showTime) {
  const [hours, minutes] = String(showTime).split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = String(hours % 12 || 12).padStart(2, "0");

  return `${displayHours}.${String(minutes).padStart(2, "0")} ${period}`;
}

function CineBooksLogo({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="CineBooks logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cinebooks-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d7a3" />
          <stop offset="1" stopColor="#b77945" />
        </linearGradient>
      </defs>
      <path
        d="M32 2.5 58.5 17.25v29.5L32 61.5 5.5 46.75v-29.5L32 2.5Z"
        fill="#140b0e"
        stroke="url(#cinebooks-gold)"
        strokeWidth="1.5"
      />
      <path
        d="M14 20.5 31.7 12l18.3 8.5v23L32 53l-18-9.5v-23Z"
        fill="none"
        stroke="#8f3945"
        strokeWidth="1"
      />
      <path
        d="M39 22.5a12 12 0 1 0 0 19"
        fill="none"
        stroke="url(#cinebooks-gold)"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="m31 25 12 7-12 7V25Z"
        fill="#e9d8d0"
        stroke="#e9d8d0"
        strokeLinejoin="round"
        strokeWidth="1"
      />
      <path d="M17 18v5m30-5v5M17 41v5m30-5v5" stroke="#d4ae7b" strokeWidth="1.5" />
    </svg>
  );
}

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cinebooksUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [movies, setMovies] = useState([]);
  const [featuredMovieIndex, setFeaturedMovieIndex] = useState(0);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowDate, setSelectedShowDate] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [confirmation, setConfirmation] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (page !== "movies" || movies.length < 2) return undefined;

    const slideInterval = window.setInterval(() => {
      setFeaturedMovieIndex(index => (index + 1) % movies.length);
    }, 3000);

    return () => window.clearInterval(slideInterval);
  }, [movies.length, page]);

  async function apiRequest(url, options = {}) {
    const response = await fetch(API + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.error || data.message || "Something went wrong."
      );
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async function loadMovies() {
    const data = await apiRequest("/movies");
    setMovies(data);
  }

  async function loadTheaters() {
    const data = await apiRequest("/theaters");
    setTheaters(data);
  }

  async function loadBookings(userId = user?.userId) {
    if (!userId) return;
    const data = await apiRequest(`/bookings/user/${userId}`);
    setBookings(data);
  }

  useEffect(() => {
    loadMovies().catch(err => setError(err.message));
    loadTheaters().catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("cinebooksUser", JSON.stringify(user));
      setPage("movies");
    }
  }, [user]);

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function register(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/users/register", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase()
        })
      });

      alert("Registration successful! Please log in.");
      setPage("login");
      setForm({ ...form, password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: form.email.trim(),
          password: form.password
        })
      });

      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("cinebooksUser");
    setUser(null);
    setSelectedMovie(null);
    setSelectedTheater(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setPage("login");
  }

  const featuredMovie = movies.length
    ? movies[featuredMovieIndex % movies.length]
    : null;
  const currentFeaturedIndex = featuredMovie
    ? featuredMovieIndex % movies.length
    : 0;

  async function openMovie(movie) {
    setSelectedMovie(movie);
    setSelectedShowDate("");
    setSelectedLanguage("");
    setSelectedFormat("");
    setSelectedTheater(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setError("");

    try {
      const data = await apiRequest(
        `/showtimes/movie/${movie.movieId}`
      );
      setShowtimes(data);
      setPage("showtimes");
    } catch (err) {
      setError(err.message);
    }
  }

  async function openTheater(theater) {
    setSelectedTheater(theater);
    setSelectedShowtime(null);
    setSelectedSeats([]);
  }

  async function openSeats(showtime) {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setPaymentStep(false);
    setError("");

    try {
      const data = await apiRequest(
        `/bookings/showtime/${showtime.showtimeId}/seats`
      );
      setSeats(data);
      setPage("seats");
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleSeat(seat) {
    if (seat.status !== "AVAILABLE") return;

    setSelectedSeats(previous =>
      previous.includes(seat.show_seat_id)
        ? previous.filter(id => id !== seat.show_seat_id)
        : [...previous, seat.show_seat_id]
    );
  }

  const totalAmount = seats
    .filter(seat => selectedSeats.includes(seat.show_seat_id))
    .reduce((sum, seat) => sum + Number(seat.price), 0);
  const seatSections = [...new Set(seats.map(seat => seat.seat_type))]
    .map(seatType => {
      const sectionSeats = seats.filter(seat => seat.seat_type === seatType);
      const rows = [...new Set(
        sectionSeats.map(seat => seat.seat_number.slice(0, 1))
      )].sort();

      return {
        seatType,
        price: Math.min(...sectionSeats.map(seat => Number(seat.price))),
        rows: rows.map(row => {
          const rowSeats = sectionSeats
            .filter(seat => seat.seat_number.startsWith(row))
            .sort((first, second) =>
              Number(first.seat_number.slice(1)) - Number(second.seat_number.slice(1))
            );

          return {
            row,
            left: rowSeats.filter(seat => Number(seat.seat_number.slice(1)) <= 5),
            right: rowSeats.filter(seat => Number(seat.seat_number.slice(1)) > 5)
          };
        })
      };
    })
    .sort((first, second) => first.price - second.price);
  const availableShowDates = getNextShowDates();
  const availableLanguages = selectedMovie?.language
    ? [selectedMovie.language]
    : [];
  const filteredShowtimes = showtimes.filter(
    show => show.showDate === selectedShowDate
      && show.showType === selectedFormat
  );
  const availableSeatCount = seats.filter(
    seat => seat.status === "AVAILABLE"
  ).length;

  async function confirmBooking() {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/bookings/create", {
        method: "POST",
        body: JSON.stringify({
          userId: user.userId,
          showtimeId: selectedShowtime.showtimeId,
          showSeatIds: selectedSeats,
          paymentMethod
        })
      });

      setConfirmation(result);
      setSelectedSeats([]);
      setPaymentStep(false);
      setPage("confirmation");

      try {
        await loadBookings();
      } catch (refreshError) {
        setError(
          `Booking confirmed, but your booking history could not be refreshed: ${refreshError.message}`
        );
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        setError("Your saved session is no longer valid. Please log in or register again.");
        return;
      }

      setError(err.message);
      try {
        const data = await apiRequest(
          `/bookings/showtime/${selectedShowtime.showtimeId}/seats`
        );
        setSeats(data);
      } catch {
        // Keep the original booking error visible.
      }
    } finally {
      setLoading(false);
    }
  }

  async function openBookings() {
    setError("");
    try {
      await loadBookings();
      setPage("bookings");
    } catch (err) {
      setError(err.message);
    }
  }

  function goBack() {
    setError("");

    if (page === "showtimes") setPage("movies");
    else if (page === "seats") setPage("showtimes");
    else if (page === "confirmation") setPage("movies");
    else setPage("movies");
  }

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1><CineBooksLogo className="auth-monogram" />CineBooks</h1>
          <p className="subtitle">Your movie. Your seats. Your experience.</p>

          <div className="auth-tabs">
            <button
              className={page === "login" ? "active" : ""}
              onClick={() => {
                setPage("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={page === "register" ? "active" : ""}
              onClick={() => {
                setPage("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={page === "login" ? login : register}>
            {page === "register" && (
              <>
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={updateForm}
                  required
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={updateForm}
                />
              </>
            )}

            <input
              name="email"
              type={page === "login" ? "text" : "email"}
              placeholder={
                page === "login"
                  ? "Email Address or Phone Number"
                  : "Email Address"
              }
              autoComplete={page === "login" ? "username" : "email"}
              value={form.email}
              onChange={updateForm}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={updateForm}
              required
            />

            {error && <p className="error">{error}</p>}

            <button className="primary-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : page === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>
          <CineBooksLogo className="brand-mark" />
          <span>CINEBOOKS</span>
          <span className="brand-note">THE CINEMA CLUB</span>
        </h2>

        <div className="nav-right">
          <span>Hi, {user.name}</span>
          <button onClick={() => setPage("movies")}>Movies</button>
          <button
            className={page === "bookings" ? "active-nav" : ""}
            aria-current={page === "bookings" ? "page" : undefined}
            onClick={openBookings}
          >
            My Bookings
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {error && <p className="error">{error}</p>}

        {page === "movies" && (
          <>
            <section className="hero">
              <div
                className="hero-copy"
                key={featuredMovie?.movieId ?? "featured-movie-empty"}
              >
                <p className="eyebrow">CINEBOOKS PRESENTS</p>
                <p className="hero-kicker">A feature presentation</p>
                <div className="hero-title-slot" aria-live="polite">
                  {featuredMovie ? (
                    <h1 className="hero-title">
                      {featuredMovie.title}
                    </h1>
                  ) : (
                    <h1>A night at the movies</h1>
                  )}
                </div>
                <p className="hero-description">
                  {featuredMovie?.description
                    || "Discover the stories worth seeing on the big screen. Choose your film, find your showtime, and take your seat."}
                </p>
                <button
                  className="primary-btn hero-cta"
                  disabled={movies.length === 0}
                  onClick={() => featuredMovie && openMovie(featuredMovie)}
                >
                  Explore showtimes
                </button>
                <div className="hero-featured-controls">
                  <span className="hero-index">
                    {String(currentFeaturedIndex + 1).padStart(2, "0")} / {String(movies.length).padStart(2, "0")} FEATURED FILM
                  </span>
                  {movies.length > 1 && (
                    <div className="hero-slide-controls" aria-label="Featured movies">
                      <button
                        type="button"
                        aria-label="Previous featured movie"
                        onClick={() => setFeaturedMovieIndex(index =>
                          (index - 1 + movies.length) % movies.length
                        )}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label="Next featured movie"
                        onClick={() => setFeaturedMovieIndex(index =>
                          (index + 1) % movies.length
                        )}
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <p className="section-kicker">On the marquee</p>
                <h2 className="section-title">Now showing</h2>
              </div>
              <span className="section-note">Your next great night out</span>
            </div>

            {movies.length === 0 ? (
              <p>No movies available.</p>
            ) : (
              <div className="movie-grid">
                {movies.map((movie, index) => (
                  <div className="movie-card" key={movie.movieId}>
                    <div className={`movie-poster poster-art-${index % 4}`}>
                      <div className="poster-topline">
                        <span>CineBooks selection</span>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <div>
                        <div className="poster-title">{movie.title}</div>
                        <div className="poster-meta">
                          {movie.genre || "Feature presentation"}
                        </div>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      {movie.description && <p>{movie.description}</p>}
                      <p>{movie.genre}</p>
                      <p>{movie.language} · {movie.duration} min</p>
                      <button
                        className="primary-btn"
                        onClick={() => openMovie(movie)}
                      >
                        Book Tickets
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {page === "showtimes" && (
          <>
            <button className="back-btn" onClick={goBack}>
              ← Back to Movies
            </button>

            <h2>{selectedMovie?.title}</h2>
            <p>Choose a date, language, and screening format.</p>

            <section className="showtime-filters" aria-label="Showtime options">
              <div className="showtime-date">
                <span>Select date</span>
                <div className="date-options" role="group" aria-label="Screening date">
                  {availableShowDates.map((date, index) => {
                    const localDate = new Date(`${date}T00:00:00`);
                    const dayLabel = index === 0
                      ? "Today"
                      : index === 1
                      ? "Tomorrow"
                      : localDate.toLocaleDateString(undefined, { weekday: "short" });

                    return (
                      <button
                        type="button"
                        key={date}
                        className={`date-option ${selectedShowDate === date ? "active" : ""}`}
                        aria-pressed={selectedShowDate === date}
                        onClick={() => {
                          setSelectedShowDate(date);
                          setSelectedLanguage("");
                          setSelectedFormat("");
                        }}
                      >
                        <span className="date-day">{dayLabel}</span>
                        <span className="date-month-day">
                          {localDate.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedShowDate && (
                <div className="showtime-choice-groups">
                  <div className="showtime-format">
                    <span>Select language</span>
                    <div className="format-options">
                      {availableLanguages.map(language => (
                        <button
                          type="button"
                          key={language}
                          className={selectedLanguage === language ? "active" : ""}
                          aria-pressed={selectedLanguage === language}
                          onClick={() => setSelectedLanguage(language)}
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="showtime-format showtime-format-buttons">
                    <div className="format-options">
                      {SHOW_FORMATS.map(format => (
                        <button
                          type="button"
                          key={format}
                          className={selectedFormat === format ? "active" : ""}
                          aria-pressed={selectedFormat === format}
                          onClick={() => setSelectedFormat(format)}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {selectedLanguage && selectedFormat && filteredShowtimes.length > 0 ? theaters.map(theater => {
              const theaterShows = filteredShowtimes.filter(
                show => show.theaterId === theater.theaterId
              );

              if (theaterShows.length === 0) return null;

              return (
                <div className="theater-card" key={theater.theaterId}>
                  <div className="theater-heading">
                    <h3>{theater.theaterName}</h3>
                    <span>{theater.location}</span>
                  </div>

                  <div className="showtime-list">
                    {theaterShows.map(show => (
                      <button
                        key={show.showtimeId}
                        className="showtime-btn"
                        onClick={() => {
                          openTheater(theater);
                          openSeats(show);
                        }}
                      >
                        {formatShowTime(show.showTime)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }) : selectedLanguage && selectedFormat ? (
              <p className="showtime-hint">No showtimes are available for this date and format.</p>
            ) : selectedShowDate ? (
              <p className="showtime-hint">Select a language and format to see showtimes.</p>
            ) : (
              <p className="showtime-hint">Select a date to choose a language and format.</p>
            )}
          </>
        )}

        {page === "seats" && (
          <>
            <button className="back-btn" onClick={goBack}>
              ← Back to Showtimes
            </button>

            <h2>Select Your Seats</h2>
            <p>{selectedMovie?.title} · {selectedTheater?.theaterName}</p>
            <p className="seat-capacity">
              {seats.length} seats · {availableSeatCount} available · {selectedShowDate} · {selectedFormat}
            </p>

            <div className="screen">SCREEN THIS WAY</div>

            <div className="seat-layout">
              {seatSections.map(section => (
                <section className="seat-section" key={section.seatType}>
                  <h3 className="seat-section-heading">
                    ₹{section.price.toFixed(2)} {section.seatType}
                  </h3>
                  <div className="seat-rows">
                    {section.rows.map(({ row, left, right }) => (
                      <div className="seat-row" key={`${section.seatType}-${row}`}>
                        <span className="seat-row-label">{row}</span>
                        <div className="seat-block">
                          {left.map(seat => (
                            <button
                              key={seat.show_seat_id}
                              disabled={seat.status !== "AVAILABLE"}
                              className={`seat ${
                                seat.status === "BOOKED"
                                  ? "booked"
                                  : selectedSeats.includes(seat.show_seat_id)
                                  ? "selected"
                                  : "available"
                              }`}
                              onClick={() => toggleSeat(seat)}
                              aria-label={`${seat.seat_number}, ${seat.seat_type}, ₹${seat.price}, ${seat.status.toLowerCase()}`}
                              title={`${seat.seat_number} · ${seat.seat_type} · ₹${seat.price}`}
                            >
                              {seat.seat_number.slice(1).padStart(2, "0")}
                            </button>
                          ))}
                        </div>
                        <span className="seat-aisle" aria-hidden="true" />
                        <div className="seat-block">
                          {right.map(seat => (
                            <button
                              key={seat.show_seat_id}
                              disabled={seat.status !== "AVAILABLE"}
                              className={`seat ${
                                seat.status === "BOOKED"
                                  ? "booked"
                                  : selectedSeats.includes(seat.show_seat_id)
                                  ? "selected"
                                  : "available"
                              }`}
                              onClick={() => toggleSeat(seat)}
                              aria-label={`${seat.seat_number}, ${seat.seat_type}, ₹${seat.price}, ${seat.status.toLowerCase()}`}
                              title={`${seat.seat_number} · ${seat.seat_type} · ₹${seat.price}`}
                            >
                              {seat.seat_number.slice(1).padStart(2, "0")}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="seat-legend">
              <span><i className="legend-seat available" /> Available</span>
              <span><i className="legend-seat booked" /> Sold</span>
              <span><i className="legend-seat selected" /> Selected</span>
            </div>

            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <p>Selected Seats: {selectedSeats.length}</p>
              <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>

              {paymentStep ? (
                <>
                  <label htmlFor="payment-method">Payment Method</label>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI (Demo)</option>
                    <option value="CARD">Card (Demo)</option>
                    <option value="CASH">Cash (Demo)</option>
                  </select>

                  <button
                    className="secondary-btn"
                    onClick={() => setPaymentStep(false)}
                    disabled={loading}
                  >
                    Back to Seats
                  </button>
                  <button
                    className="primary-btn"
                    onClick={confirmBooking}
                    disabled={loading || selectedSeats.length === 0}
                  >
                    {loading ? "Processing..." : "Pay & Confirm Booking"}
                  </button>
                </>
              ) : (
                <button
                  className="primary-btn"
                  onClick={() => setPaymentStep(true)}
                  disabled={selectedSeats.length === 0}
                >
                  Book Seats
                </button>
              )}
            </div>
          </>
        )}

        {page === "confirmation" && confirmation && (
          <div className="confirmation-card">
            <h1>✓ Booking Confirmed!</h1>
            <p>Your simulated payment was successful.</p>
            <h2>Booking ID: #{confirmation.bookingId}</h2>
            <h3>Amount Paid: ₹{Number(confirmation.totalAmount).toFixed(2)}</h3>
            <p>Status: {confirmation.bookingStatus}</p>
            <p>Payment: {confirmation.paymentStatus}</p>
            <button
              className="primary-btn"
              onClick={() => setPage("movies")}
            >
              Explore More Movies
            </button>
            <button className="secondary-btn" onClick={openBookings}>
              View My Bookings
            </button>
          </div>
        )}

        {page === "bookings" && (
          <>
            <h2 className="bookings-title">My Bookings</h2>
            <button className="back-btn" onClick={() => setPage("movies")}>
              ← Back to Movies
            </button>

            {bookings.length === 0 ? (
              <p>You haven't booked any tickets yet.</p>
            ) : (
              <div className="booking-list">
                {bookings.map(booking => {
                  const seatNumbers = booking.seat_numbers
                    ? String(booking.seat_numbers).split(",")
                    : [];

                  return (
                    <div className="booking-card" key={booking.booking_id}>
                      <h3>{booking.title}</h3>
                      <p className="booking-format">
                        {booking.language} · {booking.show_type}
                      </p>
                      <p>
                        {formatBookingDate(booking.show_date)} |{" "}
                        {formatBookingTime(booking.show_time)}
                      </p>
                      <p className="booking-theater">
                        <strong>{booking.theater_name}</strong>
                        <span>{booking.location}</span>
                      </p>
                      <p>No. of seats booked: {seatNumbers.length}</p>
                      <p>Seat numbers: {seatNumbers.join(", ") || "—"}</p>
                      <p className="booking-total">
                        Total amount: ₹{Number(booking.total_amount).toFixed(2)}
                      </p>
                      <p className="booking-meta">
                        Booking ID: #{booking.booking_id} · {booking.booking_status}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        <p>© 2026 CineBooks · Movie Ticket Booking System</p>
      </footer>
    </div>
  );
}

export default App;
