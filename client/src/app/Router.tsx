import { Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import { InventoryList } from "../pages/InventoryList";
import { ItemDetails } from "../pages/ItemDetails";
import { Scanner } from "../pages/Scanner";
import { NotFound } from "../pages/NotFound";
import { SignInPage } from "../pages/SignInPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventory" element={<InventoryList />} />
      <Route path="/items/:id" element={<ItemDetails />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
