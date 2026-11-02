UPDATE movies
SET description = CASE
    WHEN title = 'Interstellar' THEN
        'A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.'
    WHEN title = 'Inception' THEN
        'A mind-bending thriller where dreams become reality and nothing is what it seems.'
    WHEN title = 'Vikram' THEN
        'A gripping action thriller about a mysterious black-ops agent taking on a dangerous drug cartel.'
    WHEN title = 'Leo' THEN
        'A seemingly ordinary café owner gets caught in a violent past that threatens to destroy his peaceful life.'
    WHEN title IN ('Avengers Endgame', 'Avengers: Endgame') THEN
        'After an unimaginable loss, Earth''s mightiest heroes unite for one final battle to restore the universe.'
    ELSE description
END
WHERE title IN (
    'Interstellar',
    'Inception',
    'Vikram',
    'Leo',
    'Avengers Endgame',
    'Avengers: Endgame'
);
