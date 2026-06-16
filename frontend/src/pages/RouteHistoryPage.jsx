import { useNavigate } from "react-router-dom"
import RouteListPage from "../components/RouteListPage"

export default function RouteHistoryPage() {
  const navigate = useNavigate()

  return (
    <RouteListPage
      onBack={() => navigate(-1)}
    />
  )
}