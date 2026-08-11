import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./app/AppProviders";
import { AppRoutes } from "./app/Router";
import { SignInPage } from "./pages/SignInPage";
import { ChatWidget } from "./components/ui/ChatWidget";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders fallback={<SignInPage />}>
        <AppRoutes />
        <ChatWidget />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>
);
