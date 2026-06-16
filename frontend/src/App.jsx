import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import MainPage from "./pages/MainPage"
import RouteGeneratorPage from "./pages/RouteGeneratorPage"
import RouteHistoryPage from "./pages/RouteHistoryPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MainPage />}
        />

        <Route
          path="/generator"
          element={<RouteGeneratorPage />}
        />

        <Route
          path="/history"
          element={<RouteHistoryPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}