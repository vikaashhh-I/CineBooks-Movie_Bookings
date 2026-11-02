-- Update existing theater records without changing their IDs or showtime links.
UPDATE theaters
SET theater_name = 'PVR Cinemas - Brookefields',
    location = '4th Floor, Brookefields Mall, Dr. Krishnasamy Mudaliyar Road, R.S. Puram - 641001, Coimbatore'
WHERE theater_name = 'PVR Cinemas';

UPDATE theaters
SET theater_name = 'Cinépolis - Fun Republic',
    location = '4th Floor, Fun Republic Mall, Avinashi Road, Peelamedu - 641004, Coimbatore'
WHERE theater_name = 'INOX Cinemas';

UPDATE theaters
SET theater_name = 'PVR Sathyam Cinemas',
    location = '8, Thiru Vi Ka Road, Royapettah - 600014, Chennai'
WHERE theater_name = 'CineBooks Central';

UPDATE theaters
SET theater_name = 'INOX Luxe - Phoenix MarketCity',
    location = '2nd Floor, Phoenix MarketCity, Velachery Main Road - 600042, Chennai'
WHERE theater_name = 'CineBooks Riverside';

UPDATE theaters
SET theater_name = 'Rohini Silver Screens',
    location = '141/2, Poonamallee High Road, Koyambedu - 600107, Chennai'
WHERE theater_name = 'CineBooks Northstar';
