import { Subscription } from '../types/subscription';

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_netflix',
    name: 'Netflix',
    monthlyPrice: 15.99,
    billingCardName: 'Visa ending 4421',
    status: 'Active',
  },
  {
    id: 'sub_spotify',
    name: 'Spotify',
    monthlyPrice: 9.99,
    billingCardName: 'Visa ending 4421',
    status: 'Active',
  },
  {
    id: 'sub_adobe',
    name: 'Adobe',
    monthlyPrice: 24.99,
    billingCardName: 'Mastercard ending 7710',
    status: 'Active',
  },
  {
    id: 'sub_youtube',
    name: 'YouTube Premium',
    monthlyPrice: 8.5,
    billingCardName: 'Visa ending 4421',
    status: 'Active',
  },
  {
    id: 'sub_apple_one',
    name: 'Apple One',
    monthlyPrice: 16.95,
    billingCardName: 'Mastercard ending 7710',
    status: 'Active',
  },
  {
    id: 'sub_canva',
    name: 'Canva',
    monthlyPrice: 11.99,
    billingCardName: 'Revolut ending 0023',
    status: 'Active',
  },
];
