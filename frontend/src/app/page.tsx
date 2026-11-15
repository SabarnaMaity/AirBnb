"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Typography,
  Input,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Badge,
  Spin,
  Empty,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
  SafetyCertificateFilled,
  WalletFilled,
  RotateLeftOutlined,
  CustomerServiceFilled,
  ArrowRightOutlined,
  CompassOutlined,
} from "@ant-design/icons";
import { api } from "@/lib/api";
import { Room } from "@/types";
import { useAuth } from "@/context/AuthContext";

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Stays");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [likedRooms, setLikedRooms] = useState<string[]>([]);

  // Fetch rooms live from backend
  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      try {
        const res = await api.getAllRooms();
        if (res.success && Array.isArray(res.data)) {
          setRooms(res.data);
        } else {
          setRooms([]);
        }
      } catch (e) {
        console.error("Failed to load rooms", e);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  const toggleWishlist = (id: string) => {
    if (likedRooms.includes(id)) {
      setLikedRooms(likedRooms.filter((roomId) => roomId !== id));
    } else {
      setLikedRooms([...likedRooms, id]);
    }
  };

  const categories = [
    { label: "All Stays", icon: "✨" },
    { label: "Mountain View", icon: "🏔️" },
    { label: "Beachfront", icon: "🏖️" },
    { label: "Cozy Attic", icon: "🏡" },
    { label: "Luxe Suites", icon: "💎" },
    { label: "Nature & Eco", icon: "🌿" },
    { label: "Iconic Cities", icon: "🏙️" },
  ];

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesCategory =
      selectedCategory === "All Stays" ||
      r.tag?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      r.roomName?.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesLocation =
      !searchLocation ||
      r.mapLocation?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      r.roomName?.toLowerCase().includes(searchLocation.toLowerCase());

    return matchesCategory && matchesLocation;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 54 }}>
      {/* 1. Hero Section & Interactive Search Widget */}
      <section style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ maxWidth: 780, margin: "0 auto 36px" }}>
          <Title
            level={1}
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: "-0.8px",
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            Find places to stay on{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #ff385c, #e11d48)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Go-Went-Gone
            </span>
          </Title>
          <Paragraph style={{ fontSize: 17, color: "#64748b", margin: 0 }}>
            Discover verified mountain cabins, beachfront villas, cozy attics, and unique stays.
          </Paragraph>
        </div>

        {/* Clean Airbnb-Style Search Box */}
        <div
          style={{
            maxWidth: 840,
            margin: "0 auto",
            background: "#ffffff",
            padding: "8px 12px 8px 20px",
            borderRadius: 40,
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 180, textAlign: "left" }}>
            <Text
              strong
              style={{ fontSize: 11, color: "#0f172a", textTransform: "uppercase", display: "block" }}
            >
              Where
            </Text>
            <Input
              variant="borderless"
              placeholder="Search destinations (e.g. Darjeeling, Goa...)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              prefix={<EnvironmentOutlined style={{ color: "#94a3b8", marginRight: 4 }} />}
              style={{ padding: 0, fontSize: 13 }}
            />
          </div>

          <Divider orientation="horizontal" type="vertical" style={{ height: 32, margin: 0 }} />

          <div style={{ flex: 1, minWidth: 160, textAlign: "left" }}>
            <Text
              strong
              style={{ fontSize: 11, color: "#0f172a", textTransform: "uppercase", display: "block" }}
            >
              Check in – Check out
            </Text>
            <DatePicker.RangePicker
              variant="borderless"
              style={{ padding: 0, fontSize: 13, width: "100%" }}
              placeholder={["Add dates", "Add dates"]}
            />
          </div>

          <Divider orientation="horizontal" type="vertical" style={{ height: 32, margin: 0 }} />

          <div style={{ minWidth: 120, textAlign: "left" }}>
            <Text
              strong
              style={{ fontSize: 11, color: "#0f172a", textTransform: "uppercase", display: "block" }}
            >
              Who
            </Text>
            <Select
              variant="borderless"
              defaultValue="2 Guests"
              style={{ width: "100%", padding: 0 }}
              options={[
                { value: "1 Guest", label: "1 Guest" },
                { value: "2 Guests", label: "2 Guests" },
                { value: "3+ Guests", label: "3+ Guests" },
              ]}
            />
          </div>

          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SearchOutlined style={{ fontSize: 18 }} />}
            style={{
              backgroundColor: "#ff385c",
              borderColor: "#ff385c",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255, 56, 92, 0.4)",
            }}
          />
        </div>
      </section>

      {/* 2. Category Filter Tabs */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            overflowX: "auto",
            padding: "8px 4px",
          }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 24,
                  border: isActive ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                  background: isActive ? "#0f172a" : "#ffffff",
                  color: isActive ? "#ffffff" : "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 2px 6px rgba(15, 23, 42, 0.15)" : "none",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Live Stays Showcase */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: 26 }}>
              Popular Stays & Vacation Homes
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Verified properties available for instant reservation
            </Text>
          </div>
          <Link href="/user">
            <Button type="link" style={{ fontWeight: 600, color: "#ff385c" }}>
              View all stays <ArrowRightOutlined />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" tip="Discovering exceptional stays..." />
          </div>
        ) : filteredRooms.length === 0 ? (
          <Card style={{ borderRadius: 20, textAlign: "center", padding: 48, border: "1px solid #e2e8f0" }}>
            <Empty
              description={
                <div style={{ maxWidth: 420, margin: "0 auto" }}>
                  <Text strong style={{ fontSize: 16, color: "#0f172a", display: "block", marginBottom: 6 }}>
                    {rooms.length === 0 ? "No active listings in database yet" : "No stays match your search"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {rooms.length === 0
                      ? "Be the first host to list an apartment, suite, or vacation villa."
                      : "Try clearing search keywords or selecting 'All Stays'."}
                  </Text>
                </div>
              }
            >
              {rooms.length === 0 ? (
                <Link href="/merchant">
                  <Button
                    type="primary"
                    style={{ backgroundColor: "#ff385c", borderColor: "#ff385c", borderRadius: 8, marginTop: 12 }}
                  >
                    List a Stay on Go-Went-Gone
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedCategory("All Stays");
                    setSearchLocation("");
                  }}
                  style={{ borderRadius: 8, marginTop: 12 }}
                >
                  Clear Filters
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 28]}>
            {filteredRooms.map((room) => {
              const isLiked = likedRooms.includes(room._id);
              const roomImage =
                room.images?.[0] ||
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

              return (
                <Col xs={24} sm={12} lg={6} key={room._id}>
                  <Link href="/user" style={{ display: "block" }}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 18,
                        overflow: "hidden",
                        border: "none",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                        transition: "transform 0.25s, box-shadow 0.25s",
                      }}
                      styles={{ body: { padding: "14px 4px 4px 4px" } }}
                      cover={
                        <div style={{ position: "relative", height: 230, overflow: "hidden" }}>
                          <img
                            alt={room.roomName}
                            src={roomImage}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s",
                            }}
                          />
                          <Tag
                            style={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              background: "rgba(255, 255, 255, 0.9)",
                              backdropFilter: "blur(6px)",
                              color: "#0f172a",
                              fontWeight: 700,
                              borderRadius: 16,
                              padding: "2px 10px",
                              border: "none",
                              fontSize: 11,
                            }}
                          >
                            Guest Favorite
                          </Tag>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(room._id);
                            }}
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              background: "rgba(0, 0, 0, 0.3)",
                              backdropFilter: "blur(4px)",
                              border: "none",
                              borderRadius: "50%",
                              width: 34,
                              height: 34,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: isLiked ? "#ff385c" : "#ffffff",
                              fontSize: 16,
                              transition: "transform 0.2s",
                            }}
                          >
                            {isLiked ? <HeartFilled /> : <HeartOutlined />}
                          </button>
                        </div>
                      }
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Text strong style={{ fontSize: 14, color: "#0f172a" }} ellipsis>
                          {room.mapLocation || "Darjeeling, India"}
                        </Text>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}>
                          <StarFilled style={{ color: "#f59e0b" }} />
                          <Text strong>4.94</Text>
                        </div>
                      </div>

                      <Text type="secondary" style={{ fontSize: 12, display: "block" }} ellipsis>
                        {room.roomName}
                      </Text>

                      <Text type="secondary" style={{ fontSize: 12, display: "block", color: "#64748b" }}>
                        {room.tag || "Mountain View"}
                      </Text>

                      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 4 }}>
                        <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
                          ₹{room.price?.toLocaleString()}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          night
                        </Text>
                      </div>
                    </Card>
                  </Link>
                </Col>
              );
            })}
          </Row>
        )}
      </section>

      {/* 4. Why Choose Go-Went-Gone (Consumer Features) */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: 24,
          padding: "44px 32px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
          <Title level={2} style={{ fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
            Why Travelers Choose Go-Went-Gone
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Peace of mind, zero hidden fees, and transparent booking protection.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: "left", padding: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#fee2e2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                <SafetyCertificateFilled />
              </div>
              <Title level={5} style={{ fontWeight: 700, marginBottom: 6 }}>
                Verified Stays & Hosts
              </Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: "block" }}>
                Every single property listing is individually reviewed and verified before appearing.
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: "left", padding: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#dcfce7",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                <WalletFilled />
              </div>
              <Title level={5} style={{ fontWeight: 700, marginBottom: 6 }}>
                Integrated Digital Wallet
              </Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: "block" }}>
                Deposit funds once and book stays in a single click with instant transaction receipts.
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: "left", padding: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                <RotateLeftOutlined />
              </div>
              <Title level={5} style={{ fontWeight: 700, marginBottom: 6 }}>
                100% Instant Refund
              </Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: "block" }}>
                Plans changed? Cancel any reservation before checkout for immediate wallet credit.
              </Text>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div style={{ textAlign: "left", padding: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#fef3c7",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                <CustomerServiceFilled />
              </div>
              <Title level={5} style={{ fontWeight: 700, marginBottom: 6 }}>
                24/7 Dedicated Support
              </Title>
              <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: "block" }}>
                Direct communication with hosts and round-the-clock customer assistance.
              </Text>
            </div>
          </Col>
        </Row>
      </section>

      {/* 5. Host Call-To-Action Banner */}
      <section
        style={{
          borderRadius: 24,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "48px 40px",
          color: "#ffffff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
        }}
      >
        <Row align="middle" gutter={[32, 24]}>
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: "#ffffff", fontWeight: 800, margin: "0 0 10px" }}>
              Earn money by hosting on Go-Went-Gone
            </Title>
            <Paragraph style={{ color: "#cbd5e1", fontSize: 15, margin: 0, maxWidth: 620 }}>
              Join thousands of hospitable hosts. List your extra room, suite, or vacation home, enjoy
              automated 85% net payouts directly to your bank account, and welcome verified travelers.
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Link href="/merchant">
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: "#ff385c",
                  borderColor: "#ff385c",
                  fontWeight: 700,
                  height: 48,
                  padding: "0 28px",
                  borderRadius: 12,
                  fontSize: 15,
                  boxShadow: "0 4px 14px rgba(255, 56, 92, 0.4)",
                }}
              >
                Start Hosting Today
              </Button>
            </Link>
          </Col>
        </Row>
      </section>

      {/* 6. Popular Destinations Grid */}
      <section>
        <div style={{ marginBottom: 18 }}>
          <Title level={3} style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>
            Trending Destinations in India
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Click any destination to find available stays
          </Text>
        </div>
        <Row gutter={[20, 20]}>
          {[
            {
              name: "Darjeeling",
              state: "West Bengal",
              image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
            },
            {
              name: "Goa",
              state: "West Coast",
              image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
            },
            {
              name: "Manali",
              state: "Himachal Pradesh",
              image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
            },
            {
              name: "Munnar",
              state: "Kerala",
              image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
            },
          ].map((dest) => (
            <Col xs={12} sm={6} key={dest.name}>
              <div
                onClick={() => {
                  setSearchLocation(dest.name);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                style={{ cursor: "pointer" }}
              >
                <Card
                  hoverable
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                  }}
                  styles={{ body: { padding: "10px 6px" } }}
                  cover={
                    <div style={{ height: 160, overflow: "hidden" }}>
                      <img
                        alt={dest.name}
                        src={dest.image}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  }
                >
                  <Text strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>
                    {dest.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dest.state}
                  </Text>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}
