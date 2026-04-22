import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  isPro: boolean;
  createdAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

// Ensure data dir exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initialize db
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

function readDB(): User[] {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeDB(data: User[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  getUserByEmail: (email: string): User | undefined => {
    return readDB().find(u => u.email === email);
  },
  getUserById: (id: string): User | undefined => {
    return readDB().find(u => u.id === id);
  },
  createUser: (email: string): User => {
    const users = readDB();
    const existing = users.find(u => u.email === email);
    if (existing) return existing;

    const newUser: User = {
      id: uuidv4(),
      email,
      isPro: false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeDB(users);
    return newUser;
  },
  updateUserProStatus: (email: string, isPro: boolean, stripeCustomerId?: string) => {
    const users = readDB();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].isPro = isPro;
      if (stripeCustomerId) users[index].stripeCustomerId = stripeCustomerId;
      writeDB(users);
    }
  }
};
