'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { LoginSchema } from '@/Schemas/LoginSchema';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  login: (dataCred: z.infer<typeof LoginSchema>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  decodedToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [decodedToken, setDecodedToken] = useState<any>('');
  const { toast } = useToast();
  const router = useRouter();

  // Fetch token from local storage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken: any = jwt.decode(token);
      console.log("Decoded Token: ", decodedToken); // Check the structure of the decoded token

      if (decodedToken) {
        setUser(decodedToken.sub);
        setDecodedToken(decodedToken);
        setIsAuthenticated(true);
        console.log("User Set: ", decodedToken.sub); // Check what is being set
      } else {
        console.error("Decoded token is null or invalid");
      }
    }
  }, []);

  // Update user and authentication status based on decodedToken
  useEffect(() => {
    if (decodedToken) {
      setUser(decodedToken.sub);
      setIsAuthenticated(true);
      console.log(isAuthenticated, user);
    }
  }, [decodedToken]); // Removed setDecodedToken from dependencies

  // Function to handle login and store token
  const login = async (dataCred: z.infer<typeof LoginSchema>) => {
    console.log(dataCred);
    try {
      const response = await fetch("http://43.205.184.7:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: dataCred.Username,
          password: dataCred.password
        }),
      });

      const data = await response.json();
      console.log(data, 'testting..');
      const { access_token } = data;

      // Store access token in localStorage
      localStorage.setItem("access_token", access_token);

      // Show success toast
      console.log(response);
      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "You have logged in successfully.",
        });

        // Redirect to dashboard or desired route after successful login
        router.push("/Dashboard");
      } else {
        toast({
          title: "Failure while login",
        });
      }
    } catch (err: any) {
      console.log(err.message);

      // Show error toast
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive", // For error messages
      });
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, decodedToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
