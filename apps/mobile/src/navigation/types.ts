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

export type DetectedSubscriptionsStackParamList = {
  DetectedSubscriptionsList: undefined;
  DetectedSubscriptionDetails: { candidateId: string };
};

export type EmailAccountsStackParamList = {
  EmailAccountsList: undefined;
  EmailAccountDetails: { emailAccountId: string };
};

export type RootTabParamList = {
  Overview: undefined;
  Cards: NavigatorScreenParams<CardsStackParamList>;
  Subscriptions: NavigatorScreenParams<SubscriptionStackParamList>;
  Profile: undefined;
  EmailAccounts: NavigatorScreenParams<EmailAccountsStackParamList>;
  DetectedSubscriptions: NavigatorScreenParams<DetectedSubscriptionsStackParamList>;
};
