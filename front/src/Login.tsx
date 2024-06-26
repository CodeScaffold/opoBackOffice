import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import { useAuth } from "./hooks/auth";
import { useNavigate } from "react-router-dom";

interface Props {}

const Login: React.FC<Props> = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, error, isAuth } = useAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await login({
      email: username,
      password,
    });
  };

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack sx={{ width: "25%", mx: "auto" }} spacing={2}>
        <h2>Login</h2>
        <Input
          fullWidth
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          fullWidth
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">
          Login
        </Button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Stack>
    </form>
  );
};

export default Login;
