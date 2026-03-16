import { Card } from './card';
import { Subscription } from './subscription';

export type CardDetails = Card & {
  subscriptions: Subscription[];
};
