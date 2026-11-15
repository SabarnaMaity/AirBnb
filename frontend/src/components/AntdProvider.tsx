"use client";

import React from "react";
import { ConfigProvider, Layout } from "antd";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/components/QueryProvider";

const { Content, Footer } = Layout;

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff385c",
          borderRadius: 10,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorBgContainer: "#ffffff",
        },
      }}
    >
      <QueryProvider>
        <AuthProvider>
          <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <Content
              style={{
                maxWidth: 1240,
                width: "100%",
                margin: "0 auto",
                padding: "24px 20px 48px",
              }}
            >
              {children}
            </Content>
            <Footer
              style={{
                textAlign: "center",
                background: "#ffffff",
                borderTop: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: 13,
                padding: "20px 24px",
              }}
            >
              Go-Went-Gone Multi-Panel System • Built with Next.js & Ant Design
            </Footer>
          </Layout>
        </AuthProvider>
      </QueryProvider>
    </ConfigProvider>
  );
}
