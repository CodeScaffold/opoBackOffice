import React, { useState } from "react";
import { Button } from "@mui/material";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";

interface User {
  username: string;
  password: string;
}

const Login = ({ onSuccessfulLogin }: { onSuccessfulLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccessfulLogin(); // This signals the App component to update its state to loggedIn
        setError(""); // Clear any previous error
      } else {
        setError(data.message || "Invalid username or password"); // Show error message from the server
      }
    } catch (error) {
      setError("Failed to connect to the server. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack sx={{ width: "25%", mx: "auto" }} spacing={2}>
        <h2>Technical Panel</h2>
        <Input
          size="md"
          placeholder="Username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          margin="normal"
        />
        <Input
          size="md"
          placeholder="Password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Login
        </Button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Stack>
    </form>
  );
};

export default Login;
