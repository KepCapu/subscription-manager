UPDATE subscriptions AS s
SET card_id = c.id
FROM cards AS c
WHERE s.card_id IS NULL
  AND s.billing_card_name = (c.name || ' ending ' || c.last4);
