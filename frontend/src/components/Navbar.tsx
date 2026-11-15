"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Button, Tag, Space, Typography, Avatar, Dropdown, MenuProps } from "antd";
import {
  CompassOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  WalletOutlined,
  HomeOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { USERROLE } from "@/types";

const { Header } = Layout;
const { Text } = Typography;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Profile dropdown menu
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile-header",
      disabled: true,
      label: (
        <div style={{ padding: "4px 0" }}>
          <Text strong style={{ color: "#0f172a", fontSize: 13, display: "block" }}>
            {user?.name?.firstName} {user?.name?.lastName}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {user?.email}
          </Text>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "my-stays",
      icon: <HomeOutlined />,
      label: <Link href="/user">My Bookings & Stays</Link>,
    },
    ...(user?.role === USERROLE.MERCHANT || user?.role === USERROLE.ADMIN
      ? [
          {
            key: "host-dashboard",
            icon: <ShopOutlined />,
            label: <Link href="/merchant">Host Dashboard</Link>,
          },
        ]
      : []),
    ...(user?.role === USERROLE.ADMIN
      ? [
          {
            key: "admin-console",
            icon: <SafetyCertificateOutlined />,
            label: <Link href="/admin">Admin Console</Link>,
          },
        ]
      : []),
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Log Out",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        height: 70,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Brand Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "linear-gradient(135deg, #ff385c 0%, #e11d48 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: 22,
            boxShadow: "0 3px 10px rgba(255, 56, 92, 0.35)",
          }}
        >
          <CompassOutlined />
        </div>
        <div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              background: "linear-gradient(135deg, #ff385c, #e11d48)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Go-Went-Gone
          </span>
        </div>
      </Link>

      {/* Center Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="hidden sm:flex">
        <Link
          href="/"
          style={{
            fontSize: 14,
            fontWeight: pathname === "/" ? 700 : 500,
            color: pathname === "/" ? "#ff385c" : "#475569",
            transition: "color 0.2s",
          }}
        >
          Explore Stays
        </Link>
        <Link
          href="/user"
          style={{
            fontSize: 14,
            fontWeight: pathname === "/user" ? 700 : 500,
            color: pathname === "/user" ? "#ff385c" : "#475569",
            transition: "color 0.2s",
          }}
        >
          Trips & Bookings
        </Link>
        {/* Role-based Center Links */}
        {user?.role === USERROLE.MERCHANT && (
          <Link
            href="/merchant"
            style={{
              fontSize: 14,
              fontWeight: pathname === "/merchant" ? 700 : 500,
              color: pathname === "/merchant" ? "#2563eb" : "#475569",
              transition: "color 0.2s",
            }}
          >
            Host Dashboard
          </Link>
        )}
        {user?.role === USERROLE.ADMIN && (
          <Link
            href="/admin"
            style={{
              fontSize: 14,
              fontWeight: pathname === "/admin" ? 700 : 500,
              color: pathname === "/admin" ? "#d97706" : "#475569",
              transition: "color 0.2s",
            }}
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right User Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {!user && (
          <Link href="/merchant" style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
            Become a Host
          </Link>
        )}

        {user ? (
          <Space orientation="horizontal" size={10}>
            {user.role === USERROLE.USER && (
              <Tag
                icon={<WalletOutlined />}
                color="cyan"
                style={{
                  fontWeight: 700,
                  borderRadius: 16,
                  fontSize: 12,
                  padding: "3px 10px",
                }}
              >
                ₹{user.wallet?.toLocaleString() || 0}
              </Tag>
            )}

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px 4px 6px",
                  borderRadius: 24,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  background: "#ffffff",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Avatar
                  size={32}
                  style={{
                    backgroundColor:
                      user.role === USERROLE.ADMIN
                        ? "#d97706"
                        : user.role === USERROLE.MERCHANT
                        ? "#2563eb"
                        : "#ff385c",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {user.name?.firstName?.[0] || "U"}
                </Avatar>
                <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
                  {user.name?.firstName}
                </Text>
              </div>
            </Dropdown>
          </Space>
        ) : (
          <Space orientation="horizontal" size={8}>
            <Link href="/login">
              <Button
                type="text"
                style={{ fontWeight: 600, color: "#475569", borderRadius: 8 }}
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                type="primary"
                style={{
                  backgroundColor: "#ff385c",
                  borderColor: "#ff385c",
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Sign Up
              </Button>
            </Link>
          </Space>
        )}
      </div>
    </Header>
  );
}
