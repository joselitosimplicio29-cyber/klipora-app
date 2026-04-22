export interface UploadSession {
  token: string;
  status: "waiting" | "uploading" | "done" | "expired";
  progress: number;
  videoPath?: string;
  filename?: string;
  createdAt: number;
  expiresAt: number;
}

// Armazenamento em memória (persiste entre requests no mesmo processo)
const sessions = new Map<string, UploadSession>();

export function createSession(token: string): UploadSession {
  const session: UploadSession = {
    token,
    status: "waiting",
    progress: 0,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutos
  };
  sessions.set(token, session);
  return session;
}

export function getSession(token: string): UploadSession | undefined {
  const session = sessions.get(token);
  if (!session) return undefined;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return undefined;
  }
  return session;
}

export function updateSession(token: string, update: Partial<UploadSession>): void {
  const session = sessions.get(token);
  if (session) sessions.set(token, { ...session, ...update });
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
