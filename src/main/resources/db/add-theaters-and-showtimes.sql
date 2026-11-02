-- Run after setup-screening-formats-and-seats.sql.
-- Seeds only the five requested cinemas and idempotently schedules all movies.
UPDATE theaters
SET theater_name = 'PVR Cinemas - Brookefields',
    location = '4th Floor, Brookefields Mall, Dr. Krishnasamy Mudaliyar Road, R.S. Puram - 641001, Coimbatore'
WHERE theater_name = 'PVR Cinemas';

UPDATE theaters
SET theater_name = 'Cinépolis - Fun Republic',
    location = '4th Floor, Fun Republic Mall, Avinashi Road, Peelamedu - 641004, Coimbatore'
WHERE theater_name = 'INOX Cinemas';

INSERT INTO theaters (theater_name, location)
SELECT requested.theater_name, requested.location
FROM (
    SELECT 'PVR Cinemas - Brookefields' AS theater_name,
           '4th Floor, Brookefields Mall, Dr. Krishnasamy Mudaliar Road, R.S. Puram - 641001, Coimbatore' AS location
    UNION ALL SELECT 'Cinépolis - Fun Republic',
           '4th Floor, Fun Republic Mall, Avinashi Road, Peelamedu - 641004, Coimbatore'
    UNION ALL SELECT 'PVR Sathyam Cinemas',
           '8, Thiru Vi Ka Road, Royapettah - 600014, Chennai'
    UNION ALL SELECT 'INOX Luxe - Phoenix MarketCity',
           '2nd Floor, Phoenix MarketCity, Velachery Main Road - 600042, Chennai'
    UNION ALL SELECT 'Rohini Silver Screens',
           '141/2, Poonamallee High Road, Koyambedu - 600107, Chennai'
) AS requested
LEFT JOIN theaters existing
    ON existing.theater_name = requested.theater_name
WHERE existing.theater_id IS NULL;

-- Ensure each requested cinema has the same 150-seat layout.
INSERT INTO seats (theater_id, seat_number, seat_type, price)
SELECT theaters.theater_id,
       CONCAT(CHAR(64 + row_numbers.row_num), column_numbers.column_num),
       CASE
           WHEN row_numbers.row_num = 2 OR row_numbers.row_num >= 9
               THEN 'Premium'
           ELSE 'Regular'
       END,
       CASE
           WHEN row_numbers.row_num = 2 OR row_numbers.row_num >= 9
               THEN 220.00
           ELSE 150.00
       END
FROM theaters
CROSS JOIN (
    SELECT 1 AS row_num UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
) AS row_numbers
CROSS JOIN (
    SELECT 1 AS column_num UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10
) AS column_numbers
LEFT JOIN seats existing
    ON existing.theater_id = theaters.theater_id
   AND existing.seat_number = CONCAT(
       CHAR(64 + row_numbers.row_num), column_numbers.column_num
   )
WHERE existing.seat_id IS NULL
  AND theaters.theater_name IN (
      'PVR Cinemas - Brookefields',
      'Cinépolis - Fun Republic',
      'PVR Sathyam Cinemas',
      'INOX Luxe - Phoenix MarketCity',
      'Rohini Silver Screens'
  );

-- Schedule morning, evening, and night shows for the next 12 full days.
INSERT INTO showtimes (movie_id, theater_id, show_date, show_time, show_type)
SELECT movies.movie_id, theaters.theater_id, dates.show_date,
       time_slots.show_time, formats.show_type
FROM movies
CROSS JOIN theaters
CROSS JOIN (
    SELECT DATE_ADD(CURDATE(), INTERVAL 1 DAY) AS show_date
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 4 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 5 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 6 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 8 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 9 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 10 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 11 DAY)
    UNION ALL SELECT DATE_ADD(CURDATE(), INTERVAL 12 DAY)
) AS dates
CROSS JOIN (
    SELECT '10:00:00' AS show_time
    UNION ALL SELECT '18:00:00'
    UNION ALL SELECT '21:00:00'
) AS time_slots
CROSS JOIN (
    SELECT '2D' AS show_type
    UNION ALL SELECT '3D'
    UNION ALL SELECT 'IMAX'
) AS formats
WHERE theaters.theater_name IN (
      'PVR Cinemas - Brookefields',
      'Cinépolis - Fun Republic',
      'PVR Sathyam Cinemas',
      'INOX Luxe - Phoenix MarketCity',
      'Rohini Silver Screens'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM showtimes existing
      WHERE existing.movie_id = movies.movie_id
        AND existing.theater_id = theaters.theater_id
        AND existing.show_date = dates.show_date
        AND existing.show_time = time_slots.show_time
        AND existing.show_type = formats.show_type
  );

-- Create available seat records for every requested-cinema screening.
INSERT INTO show_seats (showtime_id, seat_id, status)
SELECT showtimes.showtime_id, seats.seat_id, 'AVAILABLE'
FROM showtimes
JOIN seats ON seats.theater_id = showtimes.theater_id
JOIN theaters ON theaters.theater_id = showtimes.theater_id
LEFT JOIN show_seats existing
    ON existing.showtime_id = showtimes.showtime_id
   AND existing.seat_id = seats.seat_id
WHERE existing.show_seat_id IS NULL
  AND theaters.theater_name IN (
      'PVR Cinemas - Brookefields',
      'Cinépolis - Fun Republic',
      'PVR Sathyam Cinemas',
      'INOX Luxe - Phoenix MarketCity',
      'Rohini Silver Screens'
  );
