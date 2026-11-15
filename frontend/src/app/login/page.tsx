"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { USERROLE } from "@/types";
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  Tag,
  Radio,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CompassOutlined,
  ThunderboltFilled,
  ShopOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loading, setLoading] = useState<boolean>(false);

  // Quick One-Click Demo Login
  const handleQuickLogin = async (email: string, role: string) => {
    setLoading(true);
    const res = await login({ email, password: "password123" });
    setLoading(false);

    if (res.success) {
      message.success(`Logged in as ${role}!`);
      if (role === "admin") router.push("/admin");
      else if (role === "merchant") router.push("/merchant");
      else router.push("/user");
    } else {
      message.error(res.message || "Failed to log in. Please check backend.");
    }
  };

  // Submit Login Form
  const onFinishLogin = async (values: any) => {
    setLoading(true);
    const res = await login({ email: values.email, password: values.password });
    setLoading(false);

    if (res.success) {
      message.success("Login successful!");
      router.push("/user");
    } else {
      message.error(res.message || "Invalid email or password credentials.");
    }
  };

  // Submit Register Form
  const onFinishRegister = async (values: any) => {
    setLoading(true);
    const payload = {
      name: {
        firstName: values.firstName,
        lastName: values.lastName,
      },
      email: values.email,
      password: values.password,
      role: values.role || USERROLE.USER,
      wallet: values.role === USERROLE.USER ? 1000 : 0, // Welcome credit for users
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      message.success("Account created successfully!");
      if (values.role === USERROLE.MERCHANT) router.push("/merchant");
      else if (values.role === USERROLE.ADMIN) router.push("/admin");
      else router.push("/user");
    } else {
      message.error(res.message || "Registration failed. Try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0",
      }}
    >
      <Card
        style={{
          maxWidth: 460,
          width: "100%",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0",
        }}
        styles={{ body: { padding: "32px 28px" } }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 12px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #ff385c 0%, #e11d48 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 24,
              boxShadow: "0 4px 12px rgba(255, 56, 92, 0.3)",
            }}
          >
            <CompassOutlined />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
            Go-Went-Gone Portal
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Sign in to access your User, Host, or Admin dashboard
          </Text>
        </div>

        {/* Quick Demo Credentials */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 14,
            padding: 12,
            marginBottom: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            <ThunderboltFilled style={{ color: "#f59e0b" }} />
            <span>One-Click Quick Login (Demo)</span>
          </div>
          <Space size={6} wrap style={{ width: "100%" }}>
            <Button
              size="small"
              icon={<UserOutlined />}
              onClick={() => handleQuickLogin("rahul@example.com", "user")}
              loading={loading}
              style={{ fontSize: 11, fontWeight: 600, borderRadius: 8 }}
            >
              Guest (Rahul)
            </Button>
            <Button
              size="small"
              icon={<ShopOutlined />}
              onClick={() => handleQuickLogin("host@example.com", "merchant")}
              loading={loading}
              style={{ fontSize: 11, fontWeight: 600, borderRadius: 8 }}
            >
              Host (Anisur)
            </Button>
            <Button
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handleQuickLogin("admin@example.com", "admin")}
              loading={loading}
              style={{ fontSize: 11, fontWeight: 600, borderRadius: 8 }}
            >
              Super Admin
            </Button>
          </Space>
        </div>

        {/* Form Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "login",
              label: "Sign In",
              children: (
                <Form layout="vertical" onFinish={onFinishLogin} style={{ marginTop: 12 }}>
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="name@example.com"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter your password" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="••••••••"
                      size="large"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={{
                      backgroundColor: "#ff385c",
                      borderColor: "#ff385c",
                      fontWeight: 700,
                      borderRadius: 10,
                      marginTop: 8,
                    }}
                  >
                    Sign In
                  </Button>
                </Form>
              ),
            },
            {
              key: "register",
              label: "Create Account",
              children: (
                <Form
                  layout="vertical"
                  onFinish={onFinishRegister}
                  initialValues={{ role: USERROLE.USER }}
                  style={{ marginTop: 12 }}
                >
                  <Space style={{ display: "flex" }} align="start">
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ flex: 1 }}
                    >
                      <Input placeholder="John" />
                    </Form.Item>
                    <Form.Item
                      label="Last Name"
                      name="lastName"
                      rules={[{ required: true, message: "Required" }]}
                      style={{ flex: 1 }}
                    >
                      <Input placeholder="Doe" />
                    </Form.Item>
                  </Space>

                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: "Please enter email" },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="john@example.com"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter password" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="••••••••"
                    />
                  </Form.Item>

                  <Form.Item label="Account Type (Role)" name="role">
                    <Radio.Group style={{ width: "100%" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Radio value={USERROLE.USER}>
                          <Text strong>Guest / Traveler</Text>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                            Browse and reserve room stays
                          </Text>
                        </Radio>
                        <Radio value={USERROLE.MERCHANT}>
                          <Text strong>Property Host (Merchant)</Text>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                            List properties and receive guest bookings
                          </Text>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={{
                      backgroundColor: "#ff385c",
                      borderColor: "#ff385c",
                      fontWeight: 700,
                      borderRadius: 10,
                      marginTop: 8,
                    }}
                  >
                    Register Account
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
