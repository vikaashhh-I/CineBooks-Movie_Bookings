-- Run once against the cinebooks database before starting the updated backend.
ALTER TABLE showtimes
    ADD COLUMN show_type VARCHAR(16) NOT NULL DEFAULT '2D';

-- Existing theaters provide 2D and 3D sessions; add an IMAX session per movie.
UPDATE showtimes
SET show_type = CASE WHEN theater_id = 2 THEN '3D' ELSE '2D' END;

INSERT INTO showtimes (movie_id, theater_id, show_date, show_time, show_type)
SELECT source.movie_id,
       source.theater_id,
       source.show_date,
       ADDTIME(source.show_time, '06:00:00'),
       'IMAX'
FROM showtimes source
WHERE source.theater_id = 1
  AND source.show_type = '2D'
  AND NOT EXISTS (
      SELECT 1
      FROM showtimes existing
      WHERE existing.movie_id = source.movie_id
        AND existing.theater_id = source.theater_id
        AND existing.show_date = source.show_date
        AND existing.show_type = 'IMAX'
  );

-- Expand every theater to 150 seats while preserving existing seats and prices.
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
WHERE existing.seat_id IS NULL;

-- Link newly added seats to every existing and new screening.
INSERT INTO show_seats (showtime_id, seat_id, status)
SELECT showtimes.showtime_id, seats.seat_id, 'AVAILABLE'
FROM showtimes
JOIN seats ON seats.theater_id = showtimes.theater_id
LEFT JOIN show_seats existing
    ON existing.showtime_id = showtimes.showtime_id
   AND existing.seat_id = seats.seat_id
WHERE existing.show_seat_id IS NULL;
