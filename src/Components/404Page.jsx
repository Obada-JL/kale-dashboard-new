import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <i className="bi bi-signpost-2" style={styles.icon}></i>
      </div>
      <h1 style={styles.heading}>404</h1>
      <p style={styles.message}>
        عذراً! الصفحة التي تبحث عنها غير موجودة.
      </p>
      <button
        style={styles.button}
        onClick={() => navigate("/")}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 20px rgba(107, 66, 38, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(107, 66, 38, 0.15)';
        }}
      >
        <i className="bi bi-house-door me-2"></i>
        العودة للرئيسية
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#F5EDE3",
    fontFamily: "'Cairo', 'Arial', sans-serif",
    textAlign: "center",
    padding: "2rem",
  },
  iconWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(107, 66, 38, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  icon: {
    fontSize: '2.5rem',
    color: '#6B4226',
  },
  heading: {
    fontSize: "8rem",
    fontWeight: "bold",
    margin: 0,
    color: "#6B4226",
    lineHeight: 1,
  },
  message: {
    fontSize: "1.25rem",
    color: "#8B5E3C",
    margin: "1rem 0 2rem 0",
  },
  button: {
    padding: "12px 28px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #6B4226 0%, #CD853F 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(107, 66, 38, 0.15)",
  },
};

export default NotFound;
