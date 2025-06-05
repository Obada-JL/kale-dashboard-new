import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/homelogo.png";
import "./NavBar.css";
import Swal from "sweetalert2";
import { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم تسجيل خروجك من النظام!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، تسجيل الخروج",
      cancelButtonText: "إلغاء"
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <Navbar
      expanded={expanded}
      expand="lg"
      className="navbar ms-lg-5 me-lg-5 mt-2 shadow-sm bg-white"
      dir="rtl"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={Logo}
            alt="Kale Cafe"
            className="navbar__logo me-2"
            style={{ maxHeight: '45px' }}
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
          className="border-0"
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              onClick={() => setExpanded(false)}
              className="fw-semibold nav-link-custom"
            >
              <i className="bi bi-house-door me-2"></i>
              الرئيسية
            </Nav.Link>

            {/* Menu Management Dropdown */}
            <NavDropdown
              title={
                <span className="fw-semibold">
                  <i className="bi bi-menu-button-wide me-2"></i>
                  إدارة القائمة
                </span>
              }
              id="menu-dropdown"
              className="nav-dropdown-custom"
            >
              <NavDropdown.Item
                as={Link}
                to="/foods"
                onClick={() => setExpanded(false)}
                className="dropdown-item-custom"
              >
                <i className="bi bi-egg-fried me-2 text-primary"></i>
                الأطعمة
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/drinks"
                onClick={() => setExpanded(false)}
                className="dropdown-item-custom"
              >
                <i className="bi bi-cup-straw me-2 text-info"></i>
                المشروبات
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/desserts"
                onClick={() => setExpanded(false)}
                className="dropdown-item-custom"
              >
                <i className="bi bi-cake2 me-2 text-warning"></i>
                الحلويات
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/hookah"
                onClick={() => setExpanded(false)}
                className="dropdown-item-custom"
              >
                <i className="bi bi-cloud me-2 text-secondary"></i>
                الأراكيل
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                as={Link}
                to="/special-images"
                onClick={() => setExpanded(false)}
                className="dropdown-item-custom"
              >
                <i className="bi bi-images me-2 text-success"></i>
                الصور الخاصة
              </NavDropdown.Item>
            </NavDropdown>

            {user?.role === 'admin' && (
              <Nav.Link
                as={Link}
                to="/users"
                onClick={() => setExpanded(false)}
                className="fw-semibold nav-link-custom"
              >
                <i className="bi bi-people me-2"></i>
                إدارة المستخدمين
              </Nav.Link>
            )}
          </Nav>

          {/* User info and logout */}
          <div className="d-flex align-items-center me-3">
            <div className="d-flex align-items-center me-3 p-2 bg-light rounded-pill">
              <div className="text-end me-2">
                <div className="fw-semibold text-dark small">{user?.username}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {user?.role === 'admin' ? 'مدير' : user?.role === 'manager' ? 'مشرف' : 'موظف'}
                </div>
              </div>
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '35px', height: '35px' }}>
                <i className="bi bi-person-fill text-white"></i>
              </div>
            </div>

            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center"
              onClick={handleLogout}
              title="تسجيل الخروج"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              <span className="d-none d-md-inline">خروج</span>
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
