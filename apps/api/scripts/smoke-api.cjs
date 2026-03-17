const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:4000';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${path}`);
  }

  return response.json();
}

async function main() {
  console.log(`Smoke check base URL: ${BASE_URL}`);

  const health = await getJson('/health');
  assert(health.status === 'ok', 'health.status must be ok');
  console.log('OK /health');

  const healthDb = await getJson('/health/db');
  assert(healthDb.status === 'ok', 'health/db.status must be ok');
  assert(healthDb.database === 'connected', 'health/db.database must be connected');
  console.log('OK /health/db');

  const cards = await getJson('/cards');
  assert(Array.isArray(cards.items), '/cards.items must be an array');
  assert(typeof cards.total === 'number', '/cards.total must be a number');
  assert(cards.items.length === cards.total, '/cards total must match items length');
  for (const item of cards.items) {
    assert(typeof item.id === 'string' && item.id.length > 0, 'card.id must be a non-empty string');
    assert(typeof item.name === 'string' && item.name.length > 0, 'card.name must be a non-empty string');
    assert(typeof item.last4 === 'string' && item.last4.length > 0, 'card.last4 must be a non-empty string');
    assert(typeof item.monthlyTotal === 'number', 'card.monthlyTotal must be a number');
    assert(typeof item.activeSubscriptionsCount === 'number', 'card.activeSubscriptionsCount must be a number');
  }
  console.log('OK /cards');

  const subscriptions = await getJson('/subscriptions');
  assert(Array.isArray(subscriptions.items), '/subscriptions.items must be an array');
  assert(typeof subscriptions.total === 'number', '/subscriptions.total must be a number');
  assert(subscriptions.items.length === subscriptions.total, '/subscriptions total must match items length');
  for (const item of subscriptions.items) {
    assert(typeof item.id === 'string' && item.id.length > 0, 'subscription.id must be a non-empty string');
    assert(typeof item.name === 'string' && item.name.length > 0, 'subscription.name must be a non-empty string');
    assert(typeof item.monthlyPrice === 'number', 'subscription.monthlyPrice must be a number');
    assert(typeof item.billingCardName === 'string' && item.billingCardName.length > 0, 'subscription.billingCardName must be a non-empty string');
    assert(typeof item.cardId === 'string' && item.cardId.length > 0, 'subscription.cardId must be a non-empty string');
    assert(typeof item.status === 'string' && item.status.length > 0, 'subscription.status must be a non-empty string');
    assert(item.renewalDate === null || isIsoDate(item.renewalDate), 'subscription.renewalDate must be null or YYYY-MM-DD');
  }
  console.log('OK /subscriptions');

  const overview = await getJson('/overview');
  assert(typeof overview.totalMonthlyCost === 'number', '/overview.totalMonthlyCost must be a number');
  assert(typeof overview.activeSubscriptions === 'number', '/overview.activeSubscriptions must be a number');
  assert(typeof overview.upcomingRenewals === 'number', '/overview.upcomingRenewals must be a number');
  assert(typeof overview.possibleRecurring === 'number', '/overview.possibleRecurring must be a number');
  console.log('OK /overview');

  console.log('Smoke checks passed');
}

main().catch((error) => {
  console.error('Smoke checks failed');
  console.error(error.message || error);
  process.exit(1);
});
