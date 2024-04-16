import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./hooks/auth";
import MainPage from "./components/MainPage.tsx";

function App() {
  const queryClient = new QueryClient();
  return (
    <AuthProvider>
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <MainPage />
        </QueryClientProvider>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
