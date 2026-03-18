import { NavigatorScreenParams } from '@react-navigation/native';

export type CardsStackParamList = {
  CardsList: undefined;
  CardDetails: { cardId: string };
};

export type SubscriptionStackParamList = {
  SubscriptionsList: undefined;
  AddSubscription: undefined;
  EditSubscription: { subscriptionId: string };
  SubscriptionDetails: { subscriptionId: string };
};

export type RootTabParamList = {
  Overview: undefined;
  Cards: NavigatorScreenParams<CardsStackParamList>;
  Subscriptions: NavigatorScreenParams<SubscriptionStackParamList>;
  Profile: undefined;
  EmailAccounts: undefined;
  DetectedSubscriptions: undefined;
};
