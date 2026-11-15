"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { USERROLE, User } from "@/types";
import { message } from "antd";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  password: string;
  role: USERROLE;
  wallet: number;
}

export function useLoginMutation() {
  const router = useRouter();
  const { setUserManually } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await api.login(credentials);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Invalid email or password credentials.");
      }
      return res.data as User;
    },
    onSuccess: (user: User) => {
      setUserManually(user);
      queryClient.setQueryData(["currentUser"], user);
      message.success(`Welcome back, ${user.name?.firstName || "User"}!`);

      // Role-based redirect
      if (user.role === USERROLE.ADMIN) {
        router.push("/admin");
      } else if (user.role === USERROLE.MERCHANT) {
        router.push("/merchant");
      } else {
        router.push("/user");
      }
    },
    onError: (error: Error) => {
      message.error(error.message || "Failed to log in.");
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const { setUserManually } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (payload: RegisterPayload) => {
      const res = await api.register(payload);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Registration failed. Please check details.");
      }
      return res.data as User;
    },
    onSuccess: (user: User) => {
      setUserManually(user);
      queryClient.setQueryData(["currentUser"], user);
      message.success("Account created successfully!");

      // Role-based redirect
      if (user.role === USERROLE.MERCHANT) {
        router.push("/merchant");
      } else if (user.role === USERROLE.ADMIN) {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    },
    onError: (error: Error) => {
      message.error(error.message || "Registration failed. Try again.");
    },
  });
}
