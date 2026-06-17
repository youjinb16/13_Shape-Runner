import { useNavigate } from "react-router-dom"
import { useState } from "react"

import PaceEstimator from "../components/PaceEstimator"
import CalorieEstimator from "../components/CalorieEstimator"
import Zone2HeartRate from "../components/Zone2HeartRate"

import { getLRURoutes } from "../utils/routeModule"

import bgImage from "../assets/Bacjground_img.jpg"


export default function AnalysisPage() {

  const navigate = useNavigate()


  const routes = getLRURoutes()

    const [selectedRouteId, setSelectedRouteId] =
    useState(routes[0]?.id ?? null)

    const selectedRoute =
    routes.find(
        route => route.id === selectedRouteId
    )

    const distance =
    selectedRoute?.distance ?? 0
    

  return (
    <div
          style={{
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh',
            width: '100%',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(4px)',
              borderRadius: '20px',
              margin: '25px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
        <button
            onClick={() =>
                navigate("/")
            }
            style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1.5px solid #189b81',
            background: 'white',
            color: '#189b81',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            marginBottom: '20px',
            marginRight: '5px',
            position: 'absolute',
            top: '10px',
            left: '10px',
          }}
            >
            ← 🏠메인 화면
        </button>

      <h1
        style={{
          marginBottom: "8px",
        }}
      >
        📊 러닝 분석 📊
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "24px",
          marginTop:'22px',
        }}
      >
        생성된 경로를 기준으로 러닝 정보를 분석합니다.
      </p>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: '4px' }}>
        📍 분석 경로
        </h3>
        <h5 style={{ margin: 0 }}>
        최근 생성한 경로를 분석하세요
        </h5>

    {routes.length === 0 ? (
    <p>
        저장된 경로가 없습니다.
    </p>
    ) : (
    <>
        <select
        value={selectedRouteId}
        onChange={(e) =>
            setSelectedRouteId(e.target.value)
        }
        style={{
            padding: "8px",
            borderRadius: "8px",
            minWidth: "250px",
            marginBottom: "12px",
        }}
        >
        {routes.map(route => (
            <option
            key={route.id}
            value={route.id}
            >
            {route.name}
            </option>
        ))}
        </select>

        <p>
        현재 선택 경로 거리 :
        <strong>
            {" "}
            {distance?.toFixed(2)} km
        </strong>
        </p>

        <p>
        도형 :
        <strong>
            {" "}
            {selectedRoute?.shape}
        </strong>
        </p>
    </>
    )}
      </div>

      {distance > 0 && (
  <>
            <PaceEstimator
            distance={distance}
            />

            <CalorieEstimator
            distance={distance}
            />
        </>
        )}

        <Zone2HeartRate />
    </div>
</div>
  )
}