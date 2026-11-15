"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Button, Tag, Space, Typography, Badge, Avatar, Dropdown } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  CompassOutlined,
  ApiOutlined,
  LogoutOutlined,
  LoginOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { USERROLE } from "@/types";

const { Header } = Layout;
const { Text } = Typography;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link href="/">Home</Link>,
    },
    {
      key: "/user",
      icon: <UserOutlined />,
      label: <Link href="/user">User Panel</Link>,
    },
    {
      key: "/merchant",
      icon: <ShopOutlined />,
      label: <Link href="/merchant">Merchant Panel</Link>,
    },
    {
      key: "/admin",
      icon: <SafetyCertificateOutlined />,
      label: <Link href="/admin">Admin Panel</Link>,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        height: 64,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Brand Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #ff385c 0%, #e11d48 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: 20,
            boxShadow: "0 2px 6px rgba(255, 56, 92, 0.35)",
          }}
        >
          <CompassOutlined />
        </div>
        <div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              background: "linear-gradient(135deg, #ff385c, #e11d48)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Go-Went-Gone
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#94a3b8",
              marginLeft: 8,
              fontWeight: 500,
            }}
          >
            Portal
          </span>
        </div>
      </Link>

      {/* Nav Menu */}
      <Menu
        mode="horizontal"
        selectedKeys={[pathname]}
        items={menuItems}
        style={{
          borderBottom: "none",
          flex: 1,
          justifyContent: "center",
          fontWeight: 600,
          background: "transparent",
        }}
      />

      {/* User Auth Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {user ? (
          <Space orientation="horizontal" size={12}>
            {user.role === USERROLE.USER && (
              <Tag
                icon={<WalletOutlined />}
                color="cyan"
                style={{
                  fontWeight: 700,
                  borderRadius: 12,
                  fontSize: 12,
                  padding: "2px 8px",
                }}
              >
                ₹{user.wallet?.toLocaleString() || 0}
              </Tag>
            )}

            <div style={{ textAlign: "right", lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 13, display: "block" }}>
                {user.name?.firstName} {user.name?.lastName}
              </Text>
              <Tag
                color={
                  user.role === USERROLE.ADMIN
                    ? "gold"
                    : user.role === USERROLE.MERCHANT
                    ? "blue"
                    : "magenta"
                }
                style={{ fontSize: 10, padding: "0 4px", margin: 0, textTransform: "uppercase" }}
              >
                {user.role}
              </Tag>
            </div>

            <Button
              size="small"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Logout
            </Button>
          </Space>
        ) : (
          <Link href="/login">
            <Button
              type="primary"
              icon={<LoginOutlined />}
              style={{
                backgroundColor: "#ff385c",
                borderColor: "#ff385c",
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </Header>
  );
}
