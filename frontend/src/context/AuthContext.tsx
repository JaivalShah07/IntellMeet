import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../lib/api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("intellmeet_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("intellmeet_token")
  );
  const [loading, setLoading] = useState(!!localStorage.getItem("intellmeet_token"));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("intellmeet_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("intellmeet_token");
        localStorage.removeItem("intellmeet_user");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const persistSession = (newToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem("intellmeet_token", newToken);
    if (newRefreshToken) localStorage.setItem("intellmeet_refresh_token", newRefreshToken);
    localStorage.setItem("intellmeet_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data.token, data.refreshToken, data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistSession(data.token, data.refreshToken, data.user);
  };

  const googleLogin = async (credential: string) => {
    const { data } = await api.post("/auth/google", { credential });
    persistSession(data.token, data.refreshToken, data.user);
  };

  const logout = () => {
    localStorage.removeItem("intellmeet_token");
    localStorage.removeItem("intellmeet_refresh_token");
    localStorage.removeItem("intellmeet_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUser: User) => {
    localStorage.setItem("intellmeet_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm font-medium text-gray-500">Loading IntellMeet...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
