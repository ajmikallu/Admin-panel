import "./App.css";
import AppRoutes from "@/routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { LoaderProvider } from "@/context/LoaderContext";
function App() {
  return (
    <AuthProvider>
      <LoaderProvider>
        <BrowserRouter>
          <ThemeProvider>
            <Toaster position="top-right" />
            <AppRoutes />
          </ThemeProvider>
        </BrowserRouter>
      </LoaderProvider>
    </AuthProvider>
  );
}

export default App;
