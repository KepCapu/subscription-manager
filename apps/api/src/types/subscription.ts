export type Subscription = {
  id: string;
  name: string;
  monthlyPrice: number;
  billingCardName: string;
  cardId: string | null;
  status: string;
  renewalDate: string | null;
};
