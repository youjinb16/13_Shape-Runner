import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import MainPage from "./pages/MainPage"
import RouteGeneratorPage from "./pages/RouteGeneratorPage"
import RouteHistoryPage from "./pages/RouteHistoryPage"
import AnalysisPage from "./pages/AnalysisPage"

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

        <Route
          path="/analysis"
          element={<AnalysisPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}