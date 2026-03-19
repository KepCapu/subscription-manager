export type EmailSyncRun = {
  id: string;
  emailAccountId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  candidatesFound: number;
  errorMessage: string | null;
  createdAt: string;
};
