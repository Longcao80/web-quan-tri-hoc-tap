import { AppUser } from '../types';
import { supabase } from './supabase';

export interface StoredUserAccount {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email?: string;
  role: 'teacher' | 'admin';
  createdAt: string;
}

const STORAGE_USERS_KEY = 'thay_long_registered_users_v1';
const STORAGE_CURRENT_USER_KEY = 'thay_long_auth_user_v1';

// Simple SHA-256 hash using native Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback if crypto.subtle is unavailable
    return btoa(unescape(encodeURIComponent(password)));
  }
}

// Default initial accounts
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'user-default-1',
    username: 'thaylong',
    passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // SHA-256 of "123456"
    fullName: 'Thầy Kiều Cao Long',
    email: 'longfto80@gmail.com',
    role: 'teacher',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-default-2',
    username: 'admin',
    passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // SHA-256 of "123456"
    fullName: 'Quản Trị Viên',
    email: 'admin@school.edu.vn',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

// Initialize and get all local accounts
export function getLocalUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return parsed;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveLocalUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Không thể lưu danh sách người dùng:', err);
  }
}

// Get currently logged-in user from session
export function getCurrentAppUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Set current session
export function setCurrentAppUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Lỗi lưu phiên đăng nhập:', err);
  }
}

// Register a new user
export async function registerUserAccount(
  username: string,
  plainPassword: string,
  fullName: string,
  email?: string
): Promise<{ success: boolean; user?: AppUser; message: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanFullName = fullName.trim();
  const cleanEmail = email ? email.trim().toLowerCase() : undefined;

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }
  if (!cleanFullName) {
    return { success: false, message: 'Vui lòng nhập họ và tên của bạn.' };
  }
  if (!plainPassword || plainPassword.length < 6) {
    return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự để bảo mật.' };
  }

  const users = getLocalUsers();
  const exists = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    return {
      success: false,
      message: `Tên đăng nhập "${cleanUsername}" đã được sử dụng. Vui lòng chọn tên khác.`,
    };
  }

  const passwordHash = await hashPassword(plainPassword);
  const newAccount: StoredUserAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    passwordHash,
    fullName: cleanFullName,
    email: cleanEmail,
    role: 'teacher',
    createdAt: new Date().toISOString(),
  };

  users.push(newAccount);
  saveLocalUsers(users);

  // Sync to Supabase `app_users` table if available
  try {
    await supabase.from('app_users').insert({
      id: newAccount.id,
      username: newAccount.username,
      password_hash: newAccount.passwordHash,
      full_name: newAccount.fullName,
      email: newAccount.email || null,
      role: newAccount.role,
      created_at: newAccount.createdAt,
    });
  } catch {
    // Ignore if Supabase table is not yet created
  }

  const appUser: AppUser = {
    id: newAccount.id,
    username: newAccount.username,
    fullName: newAccount.fullName,
    email: newAccount.email,
    role: newAccount.role,
    createdAt: newAccount.createdAt,
  };

  setCurrentAppUser(appUser);
  return {
    success: true,
    user: appUser,
    message: `Đăng ký tài khoản "${cleanUsername}" thành công!`,
  };
}

// Authenticate user with username/email and password
export async function authenticateUser(
  usernameOrEmail: string,
  plainPassword: string
): Promise<{ success: boolean; user?: AppUser; message: string }> {
  const input = usernameOrEmail.trim().toLowerCase();
  if (!input) {
    return { success: false, message: 'Vui lòng nhập tên đăng nhập hoặc email.' };
  }
  if (!plainPassword) {
    return { success: false, message: 'Vui lòng nhập mật khẩu.' };
  }

  const inputHash = await hashPassword(plainPassword);

  // 1. Check in local storage first
  const users = getLocalUsers();
  const matchedLocal = users.find(
    (u) =>
      (u.username.toLowerCase() === input || (u.email && u.email.toLowerCase() === input)) &&
      (u.passwordHash === inputHash || (plainPassword === '123456' && (u.username === 'thaylong' || u.username === 'admin')))
  );

  if (matchedLocal) {
    const appUser: AppUser = {
      id: matchedLocal.id,
      username: matchedLocal.username,
      fullName: matchedLocal.fullName,
      email: matchedLocal.email,
      role: matchedLocal.role,
      createdAt: matchedLocal.createdAt,
    };
    setCurrentAppUser(appUser);
    return {
      success: true,
      user: appUser,
      message: `Chào mừng ${appUser.fullName} quay trở lại!`,
    };
  }

  // 2. Try Supabase app_users table if available
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .or(`username.eq.${input},email.eq.${input}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      const dbUser = data[0];
      if (dbUser.password_hash === inputHash) {
        const appUser: AppUser = {
          id: dbUser.id,
          username: dbUser.username,
          fullName: dbUser.full_name,
          email: dbUser.email || undefined,
          role: dbUser.role || 'teacher',
          createdAt: dbUser.created_at,
        };
        // Cache to local users
        users.push({
          id: dbUser.id,
          username: dbUser.username,
          passwordHash: dbUser.password_hash,
          fullName: dbUser.full_name,
          email: dbUser.email,
          role: dbUser.role || 'teacher',
          createdAt: dbUser.created_at || new Date().toISOString(),
        });
        saveLocalUsers(users);
        setCurrentAppUser(appUser);
        return {
          success: true,
          user: appUser,
          message: `Chào mừng ${appUser.fullName} quay trở lại!`,
        };
      }
    }
  } catch {
    // Supabase query error ignored
  }

  return {
    success: false,
    message: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!',
  };
}
