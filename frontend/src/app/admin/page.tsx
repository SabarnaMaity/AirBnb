"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Property, PROPERTYSTATUS, User, USERROLE } from "@/types";
import { api } from "@/lib/api";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Table,
  Badge,
  Statistic,
  message,
  Popconfirm,
  Tabs,
  Spin,
  Avatar,
  Empty,
} from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function AdminPanel() {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Fetch real data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await api.getAllUsers();
      if (usersRes.success && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      }

      // 2. Fetch Properties
      const propsRes = await api.getAllProperties();
      if (propsRes.success && Array.isArray(propsRes.data)) {
        setProperties(propsRes.data);
      }

      // 3. Fetch Commissions
      const commRes = await api.getAllCommissions();
      if (commRes.success && Array.isArray(commRes.data)) {
        setCommissions(commRes.data);
      }

      // 4. Fetch Withdrawals
      const withRes = await api.getAllWithdraws();
      if (withRes.success && Array.isArray(withRes.data)) {
        setWithdrawals(withRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  // Auth gate
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Card style={{ maxWidth: 480, margin: "0 auto", borderRadius: 16 }}>
          <Space direction="vertical" size={16} align="center">
            <Avatar size={64} icon={<SafetyCertificateOutlined />} style={{ background: "#d97706" }} />
            <Title level={3} style={{ margin: 0 }}>
              Administrator Sign-In Required
            </Title>
            <Paragraph type="secondary">
              Please sign in with your Administrator credentials to review merchant property verifications, inspect user wallets, and audit commission ledgers.
            </Paragraph>
            <Link href="/login">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                style={{ backgroundColor: "#d97706", borderColor: "#d97706", borderRadius: 10 }}
              >
                Sign In as Admin
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    );
  }

  // Toggle Property Verification
  const togglePropertyVerification = async (propId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const res = await api.updateProperty(propId, { verification: nextStatus });
    if (res.success) {
      setProperties(
        properties.map((p) =>
          p._id === propId ? { ...p, verification: nextStatus } : p
        )
      );
      message.success(
        nextStatus
          ? "Property successfully verified & approved!"
          : "Property verification revoked."
      );
    } else {
      message.error("Failed to update verification status");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    const res = await api.deleteUser(userId);
    if (res.success) {
      setUsers(users.filter((u) => u._id !== userId));
      message.success("User account removed from database.");
    } else {
      message.error(res.message || "Failed to remove user");
    }
  };

  // Computed metrics
  const totalCommissionEarned = commissions.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );

  // Property Table Columns
  const propertyColumns = [
    {
      title: "Property Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, r: Property) => `${r.address?.city || ""}, ${r.address?.state || ""}`,
    },
    {
      title: "Owner ID",
      key: "owner",
      render: (_: any, r: Property) => (
        <Text code style={{ fontSize: 11 }}>
          {typeof r.owner === "string" ? r.owner.substring(0, 10) + "..." : r.owner?._id}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PROPERTYSTATUS) => (
        <Badge
          status={status === PROPERTYSTATUS.OPEN ? "success" : "default"}
          text={status ? status.toUpperCase() : "OPEN"}
        />
      ),
    },
    {
      title: "Verification",
      dataIndex: "verification",
      key: "verification",
      render: (verified: boolean) =>
        verified ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Verified
          </Tag>
        ) : (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Pending Review
          </Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, r: Property) => (
        <Button
          size="small"
          type={r.verification ? "default" : "primary"}
          danger={r.verification}
          onClick={() => togglePropertyVerification(r._id, r.verification)}
          style={{
            fontWeight: 600,
            backgroundColor: r.verification ? undefined : "#059669",
            borderColor: r.verification ? undefined : "#059669",
          }}
        >
          {r.verification ? "Revoke Verification" : "Approve & Verify"}
        </Button>
      ),
    },
  ];

  // Commission Columns
  const commissionColumns = [
    {
      title: "Commission ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id?.substring(0, 10)}...</Text>,
    },
    {
      title: "Type",
      dataIndex: "commission",
      key: "commission",
      render: (t: string) => <Tag color="gold">{t || "RENT"}</Tag>,
    },
    {
      title: "Platform Revenue",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => (
        <Text strong style={{ color: "#059669", fontSize: 14 }}>
          +₹{val?.toLocaleString()}
        </Text>
      ),
    },
  ];

  // User Columns
  const userColumns = [
    {
      title: "Full Name",
      key: "name",
      render: (_: any, u: User) => (
        <Text strong>
          {u.name?.firstName} {u.name?.lastName}
        </Text>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: USERROLE) => {
        let color = "default";
        if (role === USERROLE.ADMIN) color = "gold";
        else if (role === USERROLE.MERCHANT) color = "blue";
        else color = "magenta";
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Wallet Balance",
      dataIndex: "wallet",
      key: "wallet",
      render: (val: number) => (
        <Text strong style={{ color: "#0f172a" }}>
          ₹{(val || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, u: User) =>
        u.role !== USERROLE.ADMIN && (
          <Popconfirm
            title="Remove User Account"
            description="Are you sure you want to remove this user from MongoDB?"
            onConfirm={() => handleDeleteUser(u._id)}
            okText="Yes, Remove"
            cancelText="Cancel"
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Popconfirm>
        ),
    },
  ];

  // Withdrawals Columns
  const withdrawalColumns = [
    {
      title: "Withdrawal ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id?.substring(0, 10)}...</Text>,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (u: any) => (
        <Text strong>{typeof u === "object" ? `${u?.name?.firstName || ""} ${u?.name?.lastName || ""}` : u}</Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => <Text strong>₹{val?.toLocaleString()}</Text>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space orientation="horizontal" size={16} align="center">
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #d97706, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                }}
              >
                <SafetyCertificateOutlined />
              </div>
              <div>
                <Space size={8}>
                  <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                    System Super Administrator Center
                  </Title>
                  <Tag color="gold" style={{ fontWeight: 600 }}>
                    ROLE: ADMIN
                  </Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
                  Admin: {user.name?.firstName} {user.name?.lastName} ({user.email}) • Real-time MongoDB synchronization
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                  COMMISSION REVENUE (15%)
                </span>
              }
              value={totalCommissionEarned}
              prefix="₹"
              valueStyle={{ color: "#d97706", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              Total 15% platform cut retained
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                  REGISTERED PROPERTIES
                </span>
              }
              value={properties.length}
              valueStyle={{ color: "#2563eb", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              Verified: {properties.filter((p) => p.verification).length} • Pending:{" "}
              {properties.filter((p) => !p.verification).length}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                  TOTAL PLATFORM USERS
                </span>
              }
              value={users.length}
              valueStyle={{ color: "#059669", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              Guests, Hosts & Admins
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                  WITHDRAWAL REQUESTS
                </span>
              }
              value={withdrawals.length}
              valueStyle={{ color: "#0f172a", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              Logged in WithdawModel
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Tabs
          defaultActiveKey="properties"
          items={[
            {
              key: "properties",
              label: "Property Listings & Verification",
              children: (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      Merchant Property Listings & Verifications
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Approve or revoke verification badges for merchant properties (API: `/api/merchant/update/:_id`)
                    </Text>
                  </div>
                  <Table
                    dataSource={properties.map((p) => ({ ...p, key: p._id }))}
                    columns={propertyColumns}
                    pagination={false}
                    locale={{ emptyText: "No properties found in MongoDB." }}
                  />
                </div>
              ),
            },
            {
              key: "commissions",
              label: "Platform 15% Commission Ledger",
              children: (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      Platform Commission Earnings (15% Cut)
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Live records from CommissionModel (API: `/api/user/commission/getall`)
                    </Text>
                  </div>
                  <Table
                    dataSource={commissions.map((c) => ({ ...c, key: c._id }))}
                    columns={commissionColumns}
                    pagination={false}
                    locale={{ emptyText: "No commission records recorded yet." }}
                  />
                </div>
              ),
            },
            {
              key: "users",
              label: "Users & Roles Directory",
              children: (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      User Accounts & Digital Wallets Directory
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Audit all registered accounts, roles, and balances in MongoDB (API: `/api/user/get`)
                    </Text>
                  </div>
                  <Table
                    dataSource={users.map((u) => ({ ...u, key: u._id }))}
                    columns={userColumns}
                    pagination={false}
                    locale={{ emptyText: "No users found in MongoDB." }}
                  />
                </div>
              ),
            },
            {
              key: "withdrawals",
              label: "Withdrawals Audit",
              children: (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      Bank Payouts & Withdrawal Requests
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Audit user withdrawal records from WithdawModel (API: `/api/user/withdraw/getall`)
                    </Text>
                  </div>
                  <Table
                    dataSource={withdrawals.map((w) => ({ ...w, key: w._id }))}
                    columns={withdrawalColumns}
                    pagination={false}
                    locale={{ emptyText: "No withdrawal requests found." }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
