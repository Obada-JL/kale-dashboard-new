import { Outlet } from "react-router-dom";
import NavBar from "./Components/NavBar";

export default function PageLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: 'var(--bs-kale-cream, #F5EDE3)' }}>
        <NavBar />
      </div>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <footer style={{
        textAlign: 'center',
        padding: '16px 0',
        color: '#8B5E3C',
        fontSize: '0.85rem',
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: 'var(--bs-kale-cream, #F5EDE3)',
        borderTop: '1px solid rgba(107, 66, 38, 0.08)'
      }}>
        © {new Date().getFullYear()} Kale Cafe — نظام الإدارة
      </footer>
    </div>
  );
}
