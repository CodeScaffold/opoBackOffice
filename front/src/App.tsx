import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./hooks/auth";
import MainPage from "./components/MainPage";
import ThemeComponent from "./ThemeComponent";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <ThemeComponent>
      <AuthProvider>
        <SnackbarProvider maxSnack={3}>
          <QueryClientProvider client={queryClient}>
            <MainPage />
          </QueryClientProvider>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeComponent>
  );
};

export default App;
