"use client";
import {
  QueryClientProvider,
  QueryClient,
  useMutation,
} from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Login />
    </QueryClientProvider>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useMutation({
    mutationFn: (loginData) => {
      return axios.post("http://localhost:3001/auths/login", loginData);
    },
  });

  const handleLogin = () => {
    const loginData = { email, password };
    loginMutation.mutate(loginData);
  };
  return (
    <div className="login-wrapper">
      <p>welcome to login page</p>
      <div className="form-wrapper">
        <input
          type="text"
          name="email"
          placeholder="username"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>login</button>
      </div>
    </div>
  );
}
