import "./App.css";
import { SnackbarProvider } from "notistack";
import MainPage from "./components/MainPage";
import ThemeComponent from "./ThemeComponent";
import { Routes, Route } from "react-router-dom";
import Login from "./Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const App = () => {
  return (
    <ThemeComponent>
      <SnackbarProvider maxSnack={3}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/kir" element={<div>KIR</div>} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </SnackbarProvider>
    </ThemeComponent>
  );
};

export default App;
