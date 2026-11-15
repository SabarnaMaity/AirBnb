"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLoginMutation, useRegisterMutation } from "@/hooks/useAuthMutations";
import { USERROLE } from "@/types";
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Radio,
  Alert,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  CompassOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function LoginContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  // Submit Login Form
  const onFinishLogin = (values: any) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  // Submit Register Form
  const onFinishRegister = (values: any) => {
    registerMutation.mutate({
      name: {
        firstName: values.firstName,
        lastName: values.lastName,
      },
      email: values.email,
      password: values.password,
      role: values.role || USERROLE.USER,
      wallet: values.role === USERROLE.USER ? 1000 : 0, // Welcome credit for guests
    });
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
            Welcome to Go-Went-Gone
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Sign in to manage bookings, host listings, and explore stays
          </Text>
        </div>

        {/* Mutation Errors */}
        {loginMutation.isError && activeTab === "login" && (
          <Alert
            type="error"
            message={loginMutation.error.message || "Login failed"}
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}
        {registerMutation.isError && activeTab === "register" && (
          <Alert
            type="error"
            message={registerMutation.error.message || "Registration failed"}
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

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
                <Form
                  layout="vertical"
                  onFinish={onFinishLogin}
                  disabled={isSubmitting}
                  style={{ marginTop: 12 }}
                >
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
                    loading={loginMutation.isPending}
                    style={{
                      backgroundColor: "#ff385c",
                      borderColor: "#ff385c",
                      fontWeight: 700,
                      borderRadius: 10,
                      marginTop: 8,
                    }}
                  >
                    {loginMutation.isPending ? "Authenticating..." : "Sign In"}
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
                  disabled={isSubmitting}
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
                    loading={registerMutation.isPending}
                    style={{
                      backgroundColor: "#ff385c",
                      borderColor: "#ff385c",
                      fontWeight: 700,
                      borderRadius: 10,
                      marginTop: 8,
                    }}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Register Account"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}>Loading Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
