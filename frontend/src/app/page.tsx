"use client";

import Link from "next/link";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Divider,
  Alert,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  CheckCircleTwoTone,
  ThunderboltFilled,
  WalletOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const panels = [
    {
      title: "User Panel",
      role: "Guest / Traveler",
      badge: "USER ROLE",
      badgeColor: "magenta",
      icon: <UserOutlined style={{ fontSize: 24, color: "#ff385c" }} />,
      href: "/user",
      description:
        "Explore and book verified rooms, manage digital wallet balance, save rooms to wishlist, and claim refunds.",
      features: [
        "Browse rooms with price, location, & services",
        "Instant room booking with automatic duration calculation",
        "Add money to digital wallet & withdraw to bank",
        "Heart/Like list wishlist management",
        "Instant booking cancellation & full wallet refund",
      ],
      apis: [
        "/api/user/booking",
        "/api/user/add-wallet",
        "/api/user/withdraw",
        "/api/user/like",
        "/api/user/refund",
      ],
      buttonText: "Open User Panel",
      accentColor: "#ff385c",
    },
    {
      title: "Merchant Panel",
      role: "Property Host / Merchant",
      badge: "MERCHANT ROLE",
      badgeColor: "blue",
      icon: <ShopOutlined style={{ fontSize: 24, color: "#2563eb" }} />,
      href: "/merchant",
      description:
        "Manage property profiles, create rooms, upload photo galleries, and process guest checkouts to receive net payouts.",
      features: [
        "Register property profile & toggle Open/Close status",
        "Create new rooms with custom amenities & pricing",
        "Add photo URLs to room galleries",
        "Complete guest checkout to release 85% net earnings",
        "Real-time property wallet & bank details monitoring",
      ],
      apis: [
        "/api/merchant/",
        "/api/merchant/room/create",
        "/api/merchant/room/add-image",
        "/api/user/payment-send",
      ],
      buttonText: "Open Merchant Panel",
      accentColor: "#2563eb",
    },
    {
      title: "Admin Panel",
      role: "System Super Administrator",
      badge: "ADMIN ROLE",
      badgeColor: "gold",
      icon: (
        <SafetyCertificateOutlined
          style={{ fontSize: 24, color: "#d97706" }}
        />
      ),
      href: "/admin",
      description:
        "Oversee the entire platform ecosystem, verify merchant properties, audit user accounts, and track 15% platform commission fees.",
      features: [
        "Track 15% platform commission revenue in real time",
        "Review and approve/verify merchant property listings",
        "Audit registered users, merchants, and wallet balances",
        "Monitor user withdrawal payout requests",
        "Total Gross Booking Volume (GBV) analytics",
      ],
      apis: [
        "CommissionModel (15% Cut)",
        "Property Verification",
        "/api/user/get",
        "WithdawModel Audit",
      ],
      buttonText: "Open Admin Panel",
      accentColor: "#d97706",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto", padding: "16px 0" }}>
        <Tag
          icon={<ThunderboltFilled />}
          color="volcano"
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 16,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Go-Went-Gone Architecture
        </Tag>
        <Title
          level={1}
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: 12,
            color: "#0f172a",
          }}
        >
          Unified Multi-Panel Control Center
        </Title>
        <Paragraph
          style={{
            fontSize: 16,
            color: "#64748b",
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          Connected directly to your Express.js and MongoDB backend. Switch
          seamlessly between the <strong>Guest (User)</strong>,{" "}
          <strong>Host (Merchant)</strong>, and <strong>Super Admin</strong>{" "}
          dashboards.
        </Paragraph>
      </div>

      {/* 3 Panels Grid */}
      <Row gutter={[24, 24]}>
        {panels.map((panel) => (
          <Col xs={24} md={8} key={panel.title}>
            <Card
              hoverable
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              }}
              styles={{
                body: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  flex: 1,
                  padding: 24,
                },
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {panel.icon}
                  </div>
                  <Tag
                    color={panel.badgeColor}
                    style={{ fontWeight: 700, borderRadius: 12, fontSize: 11 }}
                  >
                    {panel.badge}
                  </Tag>
                </div>

                <Title level={4} style={{ marginBottom: 4, fontWeight: 700 }}>
                  {panel.title}
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 12 }}
                >
                  {panel.role}
                </Text>

                <Paragraph
                  style={{
                    fontSize: 13,
                    color: "#475569",
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  {panel.description}
                </Paragraph>

                <Divider style={{ margin: "14px 0" }} />

                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Key Capabilities
                </Text>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {panel.features.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 12,
                        color: "#334155",
                      }}
                    >
                      <CheckCircleTwoTone
                        twoToneColor="#10b981"
                        style={{ marginTop: 2 }}
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "#94a3b8",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Connected API Endpoints
                  </Text>
                  <Space size={[4, 4]} wrap>
                    {panel.apis.map((api, idx) => (
                      <Tag
                        key={idx}
                        bordered={false}
                        style={{
                          fontSize: 10,
                          fontFamily: "monospace",
                          background: "#f1f5f9",
                          color: "#475569",
                        }}
                      >
                        {api}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                <Link href={panel.href} style={{ width: "100%", display: "block" }}>
                  <Button
                    type="primary"
                    block
                    icon={<ArrowRightOutlined />}
                    style={{
                      backgroundColor: panel.accentColor,
                      borderColor: panel.accentColor,
                      height: 40,
                      fontWeight: 600,
                      borderRadius: 10,
                    }}
                  >
                    {panel.buttonText}
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Financial Architecture Banner */}
      <Card
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DollarCircleOutlined style={{ fontSize: 24, color: "#fbbf24" }} />
            <Title level={3} style={{ color: "#ffffff", margin: 0, fontWeight: 700 }}>
              Platform 15% Commission & Settlement Lifecycle
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <Text style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13, display: "block" }}>
                  1. Room Booking
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, display: "block" }}>
                  Guest pays 100% via wallet. Record saved as RECIVED in MerchantPayment table.
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={6}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <Text style={{ color: "#38bdf8", fontWeight: 700, fontSize: 13, display: "block" }}>
                  2. 15% Platform Split
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, display: "block" }}>
                  15% is allocated as platform commission, while 85% is reserved for the host property.
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={6}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <Text style={{ color: "#34d399", fontWeight: 700, fontSize: 13, display: "block" }}>
                  3. Host Checkout
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, display: "block" }}>
                  Merchant checkout transfers 85% to property wallet and re-opens room availability.
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={6}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <Text style={{ color: "#f87171", fontWeight: 700, fontSize: 13, display: "block" }}>
                  4. Instant Refund
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, display: "block" }}>
                  Prior to checkout release, guests can cancel and receive a 100% instant wallet refund.
                </Text>
              </div>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
}
