"use client";

import Link from "next/link";
import { useRegisterMutation } from "@/hooks/useAuthMutations";
import { USERROLE } from "@/types";
import {
  Card,
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

export default function SignupPage() {
  const registerMutation = useRegisterMutation();

  const onFinish = (values: any) => {
    registerMutation.mutate({
      name: {
        firstName: values.firstName,
        lastName: values.lastName,
      },
      email: values.email,
      password: values.password,
      role: values.role || USERROLE.USER,
      wallet: values.role === USERROLE.USER ? 1000 : 0,
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
            Create Your Account
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Join Go-Went-Gone as a Guest or Property Host
          </Text>
        </div>

        {registerMutation.isError && (
          <Alert
            type="error"
            message={registerMutation.error.message || "Registration failed"}
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={onFinish}
          disabled={registerMutation.isPending}
          initialValues={{ role: USERROLE.USER }}
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
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
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
            rules={[{ required: true, message: "Please enter your password" }]}
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
            {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
          </Button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#ff385c", fontWeight: 600 }}>
                Sign In
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
