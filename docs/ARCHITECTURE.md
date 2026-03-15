# ARCHITECTURE

## Overview
The MVP consists of:
- mobile frontend
- backend API
- PostgreSQL database

## Frontend
React Native + TypeScript

Responsibilities:
- render app screens
- show charts and lists
- display subscription summaries
- allow user navigation between overview, cards, subscriptions and profile

## Backend
Node.js + TypeScript

Responsibilities:
- provide API endpoints
- aggregate subscription data
- calculate monthly totals
- calculate card totals
- prepare chart data
- detect recurring payment patterns in MVP logic

## Database
PostgreSQL

## Main entities
- User
- Card
- Subscription
- Charge
- Merchant
- RecurringPattern

## Entity logic
### User
Represents the app account owner.

### Card
Represents a linked bank card or account source used for subscription charges.

### Subscription
Represents a recurring service such as Netflix, Spotify, Adobe, YouTube Premium.

### Charge
Represents a specific payment event tied to a card and possibly to a subscription.

### Merchant
Represents normalized service/provider identity behind charges.

### RecurringPattern
Represents logic that groups repeated charges into likely subscriptions.

## Data flow
1. User links cards or transaction sources
2. Charges are stored
3. Backend groups recurring charges
4. Backend maps charges to subscriptions/merchants
5. Frontend shows summaries, trends, card totals and subscription lists

## MVP technical principles
- keep architecture simple
- avoid unnecessary services
- use clear entity boundaries
- prefer predictable aggregation logic over heavy AI logic in first version
