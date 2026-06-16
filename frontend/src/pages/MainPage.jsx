import { useNavigate } from "react-router-dom";
import bgImage from "../assets/Bacjground_img.jpg";

export default function MainPage() {
  const navigate = useNavigate();

  const cardStyle = (color) => ({
    width: "220px",
    height: "220px",
    borderRadius: "24px",
    background: `${color}bf`, 
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    color: "white",
    cursor: "pointer",

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
    border: "1px solid rgba(255, 255, 255, 0.25)"
  });

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        overflow: "auto",
      }}
    >
      <div
        style={{
          padding: "24px",
          paddingBottom: "40px",
          backgroundColor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(4px)",
          borderRadius: "20px",
          margin: "25px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, color: "black"}}>
          🗺️ Shape Runner ✨
        </h1>

        <p
          style={{
            marginTop: "20px",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          나만의 러닝 루트를 그리고, 달리고, 분석하세요.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "40px",
            flexWrap: "wrap",
          }}
        >
          {/* 경로 생성 */}
          <div
            onClick={() => navigate("/generator")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
            }}
            style={cardStyle("#189b81")}
          >
            <div style={{ fontSize: "44px" }}>🗺️</div>

            <h2 style={{ margin: "16px 0 8px", color: "#ffffff"}}>
              경로 생성
            </h2>

            <p style={{ margin: 0 }}>
              새로운 루트 만들기
            </p>
          </div>

          {/* 최근 경로 */}
          <div
            onClick={() => navigate("/history")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
            }}
            style={cardStyle("#6a71f7")}
          >
            <div style={{ fontSize: "44px" }}>📂</div>

            <h2 style={{ margin: "16px 0 8px", color: "white"}}>
            최근 경로
            </h2>

            <p style={{ margin: 0 }}>
              생성된 경로 확인
            </p>
          </div>

          {/* 러닝 분석 */}
          <div
            onClick={() => navigate("/analysis")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
            }}
            style={cardStyle("#f4710e")}
          >
            <div style={{ fontSize: "44px" }}>📊</div>

            <h2 style={{ margin: "16px 0 8px", color: "white"}}>
              러닝 분석
            </h2>

            <p style={{ margin: 0 }}>
              페이스 · 칼로리 분석
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}