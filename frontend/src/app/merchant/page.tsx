"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Property, PROPERTYSTATUS, Room, ServiceProvided, PaymentStatus, USERROLE } from "@/types";
import { api } from "@/lib/api";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Badge,
  Statistic,
  message,
  Divider,
  Switch,
  Spin,
  Empty,
  Avatar,
  Alert,
  Upload,
  Tabs,
  Popconfirm,
  Descriptions,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  ShopOutlined,
  PlusOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  BankOutlined,
  CheckOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  LoginOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowDownOutlined,
  SettingOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function MerchantPanel() {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("wallet");

  // Modals
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isMerchantWithdrawOpen, setIsMerchantWithdrawOpen] = useState(false);
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [selectedRoomForPhoto, setSelectedRoomForPhoto] = useState<Room | null>(null);
  const [selectedRoomGallery, setSelectedRoomGallery] = useState<Room | null>(null);

  // Ant Design Upload states
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [addPhotoFileList, setAddPhotoFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Merchant withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  // Bank Form state
  const [bankForm, setBankForm] = useState({
    bankName: "HDFC Bank",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "HDFC0001234",
  });

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.response as any)?.url || (file.thumbUrl as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || "Photo Preview");
  };

  // New Room Form
  const [newRoomForm, setNewRoomForm] = useState({
    roomName: "",
    title: "",
    roomNo: "",
    description: "",
    price: 1500,
    tag: "Deluxe",
    mapLocation: "27.0410, 88.2663",
    services: [ServiceProvided.WIFI, ServiceProvided.AC],
    images: [] as string[],
  });

  // New Property Form
  const [newPropForm, setNewPropForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Fetch real data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all properties
      const propsRes = await api.getAllProperties();
      if (propsRes.success && Array.isArray(propsRes.data) && propsRes.data.length > 0) {
        setProperties(propsRes.data);
        const myProp = user
          ? propsRes.data.find(
              (p: any) => p.owner === user._id || p.owner?._id === user._id
            ) || propsRes.data[0]
          : propsRes.data[0];
        setSelectedProperty(myProp);

        if (myProp?.BankDetails) {
          setBankForm({
            bankName: myProp.BankDetails.bankName || "HDFC Bank",
            accountHolderName:
              (myProp.BankDetails as any).accountHolderName ||
              myProp.BankDetails.AccountHoldername ||
              `${user?.name?.firstName || "Host"} ${user?.name?.lastName || ""}`.trim(),
            accountNumber: String(myProp.BankDetails.accountNumber || "5010023456789"),
            ifscCode: (myProp.BankDetails as any).ifscCode || myProp.BankDetails.IFSC || "HDFC0001234",
          });
        }
      }

      // 2. Fetch all rooms
      const roomsRes = await api.getAllRooms();
      if (roomsRes.success && Array.isArray(roomsRes.data)) {
        setRooms(roomsRes.data);
      }

      // 3. Fetch all payments (checkouts)
      const payRes = await api.getAllPayments();
      if (payRes.success && Array.isArray(payRes.data)) {
        setPayouts(payRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load merchant data", err);
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
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <Card style={{ maxWidth: 480, margin: "0 auto", borderRadius: 20, border: "1px solid #e2e8f0" }}>
          <Space direction="vertical" size={16} align="center">
            <Avatar size={64} icon={<ShopOutlined />} style={{ background: "#2563eb" }} />
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              Host Sign-In Required
            </Title>
            <Paragraph type="secondary">
              Please sign in with a Host/Merchant account to access your property earnings, payout wallet, and manage room listings.
            </Paragraph>
            <Link href="/login">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", borderRadius: 10, fontWeight: 700 }}
              >
                Sign In as Host
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    );
  }

  // Toggle Property Status
  const togglePropertyStatus = async (checked: boolean) => {
    if (!selectedProperty) return;
    const nextStatus = checked ? PROPERTYSTATUS.OPEN : PROPERTYSTATUS.CLOSE;
    const res = await api.updateProperty(selectedProperty._id, { status: nextStatus });
    if (res.success) {
      setSelectedProperty({ ...selectedProperty, status: nextStatus });
      setProperties(
        properties.map((p) =>
          p._id === selectedProperty._id ? { ...p, status: nextStatus } : p
        )
      );
      message.success(`Property is now ${nextStatus === PROPERTYSTATUS.OPEN ? "OPEN for bookings" : "CLOSED"}`);
    } else {
      message.error("Failed to update status");
    }
  };

  // Toggle Room Availability
  const toggleRoomAvailability = async (room: Room) => {
    const nextAvailable = !room.isAvalabile;
    const res = await api.updateRoom(room._id, { isAvalabile: nextAvailable });
    if (res.success) {
      setRooms(rooms.map((r) => (r._id === room._id ? { ...r, isAvalabile: nextAvailable } : r)));
      message.success(`Room #${room.roomNo} marked as ${nextAvailable ? "Available" : "Occupied"}`);
    } else {
      message.error("Failed to update room availability");
    }
  };

  // Handle Merchant Bank Withdrawal
  const handleProcessMerchantWithdraw = async () => {
    if (!selectedProperty) {
      message.error("No active property selected");
      return;
    }
    const currentWallet = selectedProperty.wallet || 0;
    if (!withdrawAmount || withdrawAmount <= 0) {
      message.error("Please enter a valid payout amount");
      return;
    }
    if (withdrawAmount > currentWallet) {
      message.error(`Insufficient earnings balance! Available: ₹${currentWallet.toLocaleString()}`);
      return;
    }

    setIsProcessingWithdraw(true);
    try {
      const res = await api.merchantWithdraw({
        propertyId: selectedProperty._id,
        amount: withdrawAmount,
        userId: user._id,
        bankDetails: {
          bankName: bankForm.bankName,
          accountHolderName: bankForm.accountHolderName,
          AccountHoldername: bankForm.accountHolderName,
          accountNumber: Number(bankForm.accountNumber),
          ifscCode: bankForm.ifscCode,
          IFSC: bankForm.ifscCode,
        },
      });

      if (res.success) {
        message.success(
          `Payout of ₹${withdrawAmount.toLocaleString()} initiated to ${bankForm.bankName}!`
        );
        setIsMerchantWithdrawOpen(false);
        setWithdrawAmount(0);
        await fetchData();
      } else {
        message.error(res.message || "Withdrawal failed");
      }
    } catch (err: any) {
      message.error("Failed to process payout");
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  // Update Bank Details
  const handleSaveBankDetails = async () => {
    if (!selectedProperty) return;
    try {
      const updatedBank = {
        bankName: bankForm.bankName,
        AccountHoldername: bankForm.accountHolderName,
        accountHolderName: bankForm.accountHolderName,
        accountNumber: Number(bankForm.accountNumber) || 5010023456789,
        IFSC: bankForm.ifscCode,
        ifscCode: bankForm.ifscCode,
        verfication: true,
      };

      const res = await api.updateProperty(selectedProperty._id, {
        BankDetails: updatedBank,
      });

      if (res.success) {
        message.success("Payout bank account updated successfully!");
        setIsEditBankOpen(false);
        await fetchData();
      } else {
        message.error(res.message || "Failed to update bank account");
      }
    } catch (err: any) {
      message.error("Failed to update bank details");
    }
  };

  // Create Property
  const handleCreateProperty = async () => {
    if (!newPropForm.name) {
      message.error("Please enter a property name");
      return;
    }

    const hostFullName = `${user.name?.firstName || "Host"} ${user.name?.lastName || ""}`.trim();
    const payload = {
      name: newPropForm.name,
      address: {
        street: newPropForm.street || "Mall Road",
        city: newPropForm.city || "Darjeeling",
        state: newPropForm.state || "West Bengal",
        country: newPropForm.country || "India",
      },
      owner: user._id,
      status: PROPERTYSTATUS.OPEN,
      verification: true,
      wallet: 0,
      BankDetails: {
        bankName: newPropForm.bankName || "HDFC Bank",
        AccountHoldername: hostFullName || "Host Account",
        accountHolderName: hostFullName || "Host Account",
        accountNumber: Number(newPropForm.accountNumber) || 5010023456789,
        IFSC: newPropForm.ifscCode || "HDFC0001234",
        ifscCode: newPropForm.ifscCode || "HDFC0001234",
      },
    };

    const res = await api.createProperty(payload);
    if (res.success) {
      message.success("New property registered successfully!");
      setIsAddPropertyOpen(false);
      await fetchData();
    } else {
      message.error(res.message || "Failed to create property");
    }
  };

  // Create Room
  const handleCreateRoom = async () => {
    if (!newRoomForm.roomName || !newRoomForm.roomNo) {
      message.error("Please enter Room Name and Room Number");
      return;
    }

    let targetProp = selectedProperty;

    // If no property is currently selected, find or auto-create one
    if (!targetProp) {
      if (properties.length > 0) {
        targetProp = properties[0];
        setSelectedProperty(properties[0]);
      } else {
        const hostFullName = `${user.name?.firstName || "Host"} ${user.name?.lastName || ""}`.trim();
        const autoPropPayload = {
          name: `${user.name?.firstName || "Host"}'s Suites & Resort`,
          address: {
            street: "Mall Road",
            city: "Darjeeling",
            state: "West Bengal",
            country: "India",
          },
          owner: user._id,
          status: PROPERTYSTATUS.OPEN,
          verification: true,
          wallet: 0,
          BankDetails: {
            bankName: "HDFC Bank",
            AccountHoldername: hostFullName || "Host Account",
            accountHolderName: hostFullName || "Host Account",
            accountNumber: 5010023456789,
            IFSC: "HDFC0001234",
            ifscCode: "HDFC0001234",
          },
        };

        const propRes = await api.createProperty(autoPropPayload);
        if (propRes.success && propRes.data) {
          targetProp = propRes.data as Property;
          setSelectedProperty(propRes.data as Property);
          setProperties([propRes.data as Property]);
        } else {
          message.error(propRes.message || "Please register your property first.");
          return;
        }
      }
    }

    const payload = {
      ...newRoomForm,
      property: targetProp!._id,
      images:
        newRoomForm.images.length > 0
          ? newRoomForm.images
          : [
              "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
            ],
      isAvalabile: true,
    };

    const res = await api.createRoom(payload);
    if (res.success) {
      message.success(`Room '${newRoomForm.roomName}' created with ${payload.images.length} photo(s)!`);
      setIsAddRoomOpen(false);
      setFileList([]);
      setNewRoomForm({
        roomName: "",
        title: "",
        roomNo: "",
        description: "",
        price: 1500,
        tag: "Deluxe",
        mapLocation: "27.0410, 88.2663",
        services: [ServiceProvided.WIFI, ServiceProvided.AC],
        images: [],
      });
      await fetchData();
    } else {
      message.error(res.message || "Failed to create room");
    }
  };

  // Save batch photos to existing room
  const handleSavePhotosToRoom = async () => {
    if (!selectedRoomForPhoto) return;
    const urlsToAdd = addPhotoFileList
      .map((f) => (f.response as any)?.url || f.url)
      .filter(Boolean) as string[];

    if (urlsToAdd.length === 0) {
      message.error("Please upload at least one photo");
      return;
    }

    const res = await api.addRoomImages(selectedRoomForPhoto._id, urlsToAdd);
    if (res.success) {
      message.success(`Added ${urlsToAdd.length} photo(s) to ${selectedRoomForPhoto.roomName}!`);
      setAddPhotoFileList([]);
      setIsAddPhotoOpen(false);
      await fetchData();
    } else {
      message.error(res.message || "Failed to add photos to room");
    }
  };

  // Complete Checkout & Release 85% to Property Wallet
  const handleProcessCheckout = async (payoutId: string) => {
    const res = await api.checkOutPayment(payoutId);
    if (res.success) {
      message.success("Guest departure confirmed! 85% net earnings credited to Property Wallet.");
      await fetchData();
    } else {
      message.error(res.message || "Checkout failed");
    }
  };

  const propertyRooms = selectedProperty
    ? rooms.filter((r) => r.property === selectedProperty._id || (r.property as any)?._id === selectedProperty._id)
    : rooms;

  const pendingCheckoutsCount = payouts.filter((p) => p.status === PaymentStatus.RECIVED).length;
  const propertyWalletBalance = selectedProperty?.wallet || 0;

  // Checkout / Settlement Table Columns
  const payoutColumns = [
    {
      title: "Reservation Ref",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          #RES-{id ? id.slice(-6).toUpperCase() : "PAID"}
        </Tag>
      ),
    },
    {
      title: "Room Unit",
      key: "room",
      render: (_: any, r: any) => {
        const found = rooms.find((rm) => rm._id === r.room || rm._id === r.room?._id);
        return (
          <div>
            <Text strong style={{ fontSize: 13, display: "block" }}>
              {found?.roomName || "Deluxe Suite"}
            </Text>
            {found?.roomNo && <Text type="secondary" style={{ fontSize: 11 }}>Room #{found.roomNo}</Text>}
          </div>
        );
      },
    },
    {
      title: "Gross Bill",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => <Text strong>₹{val?.toLocaleString()}</Text>,
    },
    {
      title: "Platform Fee (15%)",
      key: "fee",
      render: (_: any, r: any) => (
        <Text style={{ color: "#e11d48", fontWeight: 600 }}>
          -₹{r.amount ? (r.amount * 0.15).toFixed(0) : 0}
        </Text>
      ),
    },
    {
      title: "Host Net (85%)",
      dataIndex: "payableAmount",
      key: "payableAmount",
      render: (val: number) => (
        <Text strong style={{ color: "#059669", fontSize: 15 }}>
          ₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PaymentStatus) => (
        <Badge
          status={status === PaymentStatus.RECIVED ? "processing" : "success"}
          text={
            status === PaymentStatus.RECIVED ? (
              <span style={{ color: "#d97706", fontWeight: 600 }}>Awaiting Checkout</span>
            ) : (
              <span style={{ color: "#059669", fontWeight: 600 }}>Settled to Wallet</span>
            )
          }
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div>
          {record.status === PaymentStatus.RECIVED ? (
            <Popconfirm
              title="Complete Guest Checkout?"
              description="This will release 85% net earnings directly to your Property Wallet and set the room back to Available."
              onConfirm={() => handleProcessCheckout(record._id)}
              okText="Yes, Settle Funds"
              cancelText="Later"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                style={{ backgroundColor: "#059669", borderColor: "#059669", fontWeight: 600, borderRadius: 6 }}
              >
                Complete Checkout
              </Button>
            </Popconfirm>
          ) : (
            <Tag color="success" style={{ fontWeight: 600 }}>
              ✓ Paid Out
            </Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* 1. Host Property Header Card */}
      <Card
        style={{
          borderRadius: 20,
          boxShadow: "0 2px 14px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
        styles={{ body: { padding: "24px 28px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[20, 20]}>
          <Col xs={24} md={14}>
            <Space orientation="horizontal" size={16} align="center">
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 26,
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                }}
              >
                <ShopOutlined />
              </div>
              <div>
                <Space size={8} wrap align="center">
                  <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
                    {selectedProperty?.name || "Sabarna's Suites & Resort"}
                  </Title>
                  <Tag
                    icon={<SafetyCertificateFilled />}
                    color="success"
                    style={{ fontWeight: 600, borderRadius: 12, padding: "2px 8px" }}
                  >
                    Verified Host Property
                  </Tag>
                </Space>
                <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap", fontSize: 13, color: "#64748b" }}>
                  <span>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    {selectedProperty?.address?.city || "Darjeeling"}, {selectedProperty?.address?.state || "West Bengal"}
                  </span>
                  <span>• Host: {user.name?.firstName} {user.name?.lastName}</span>
                  <span>• {propertyRooms.length} Room Unit{propertyRooms.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {selectedProperty && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "8px 14px",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    BOOKINGS STATUS
                  </Text>
                  <Switch
                    checked={selectedProperty.status === PROPERTYSTATUS.OPEN}
                    onChange={togglePropertyStatus}
                  />
                  <Text strong style={{ fontSize: 12, color: selectedProperty.status === PROPERTYSTATUS.OPEN ? "#059669" : "#64748b" }}>
                    {selectedProperty.status === PROPERTYSTATUS.OPEN ? "OPEN" : "CLOSED"}
                  </Text>
                </div>
              )}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setIsAddPropertyOpen(true)}
                style={{ borderRadius: 10, fontWeight: 600, height: 40 }}
              >
                + Register Property
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                style={{ borderRadius: 10, height: 40 }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* 2. Structured Airbnb Host Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: "wallet",
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                💰 Host Wallet & Bank Payouts
              </span>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
                {/* Wallet Balance Hero Card */}
                <Row gutter={[20, 20]}>
                  {/* Property Wallet Balance */}
                  <Col xs={24} lg={14}>
                    <Card
                      style={{
                        borderRadius: 20,
                        border: "1px solid #e2e8f0",
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        color: "#ffffff",
                        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.12)",
                      }}
                      styles={{ body: { padding: 28 } }}
                    >
                      <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col xs={24} sm={14}>
                          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
                            Available Property Earnings
                          </Text>
                          <Title level={1} style={{ color: "#10b981", margin: "6px 0 12px", fontWeight: 800, fontSize: 38 }}>
                            ₹{propertyWalletBalance.toLocaleString()}
                          </Title>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                            <span>✓ 85% Net Guest Payouts</span>
                            <span>•</span>
                            <span>Ready for Instant Bank Transfer</span>
                          </div>
                        </Col>

                        <Col xs={24} sm={10} style={{ textAlign: "right" }}>
                          <Button
                            type="primary"
                            size="large"
                            icon={<ArrowDownOutlined />}
                            onClick={() => {
                              setWithdrawAmount(propertyWalletBalance);
                              setIsMerchantWithdrawOpen(true);
                            }}
                            disabled={propertyWalletBalance <= 0}
                            style={{
                              backgroundColor: "#10b981",
                              borderColor: "#10b981",
                              fontWeight: 700,
                              borderRadius: 12,
                              height: 48,
                              padding: "0 24px",
                              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                            }}
                          >
                            Withdraw to Bank
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Linked Payout Bank Account Card */}
                  <Col xs={24} lg={10}>
                    <Card
                      style={{ borderRadius: 20, border: "1px solid #e2e8f0", height: "100%" }}
                      styles={{ body: { padding: 24 } }}
                      title={
                        <Space align="center" size={8}>
                          <BankOutlined style={{ color: "#2563eb", fontSize: 18 }} />
                          <span style={{ fontWeight: 700, fontSize: 14 }}>Linked Payout Bank Account</span>
                        </Space>
                      }
                      extra={
                        <Button
                          type="link"
                          onClick={() => setIsEditBankOpen(true)}
                          style={{ fontWeight: 600, padding: 0 }}
                        >
                          Edit Details
                        </Button>
                      }
                    >
                      <Space orientation="vertical" size={10} style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Bank Name</Text>
                          <Text strong style={{ fontSize: 13 }}>{bankForm.bankName || "HDFC Bank"}</Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Account Holder</Text>
                          <Text strong style={{ fontSize: 13 }}>{bankForm.accountHolderName || `${user.name?.firstName} ${user.name?.lastName}`}</Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Account Number</Text>
                          <Text strong code style={{ fontSize: 13 }}>
                            •••• {bankForm.accountNumber ? bankForm.accountNumber.slice(-4) : "6789"}
                          </Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>IFSC Code</Text>
                          <Text strong code style={{ fontSize: 13 }}>{bankForm.ifscCode || "HDFC0001234"}</Text>
                        </div>

                        <Divider style={{ margin: "6px 0" }} />

                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#059669" }}>
                          <CheckCircleOutlined />
                          <span>Direct Deposit Verified (IMPS / NEFT)</span>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                {/* Earnings & Settlement History Table */}
                <Card
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                          Guest Checkouts & Payout Settlement Ledger
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Automated 85% net earnings credited to your property wallet upon departure
                        </Text>
                      </div>
                      <Tag color="cyan" style={{ fontWeight: 600, padding: "3px 10px", borderRadius: 8 }}>
                        {payouts.length} Total Records
                      </Tag>
                    </div>
                  }
                  style={{ borderRadius: 18, border: "1px solid #e2e8f0" }}
                >
                  <Table
                    dataSource={payouts.map((p) => ({ ...p, key: p._id }))}
                    columns={payoutColumns}
                    pagination={{ pageSize: 6 }}
                    locale={{ emptyText: "No checkout or settlement records found yet." }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: "rooms",
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                🛏️ Room Units & Gallery ({propertyRooms.length})
              </span>
            ),
            children: (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      Property Room Listings
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Manage room details, live availability status, and Cloudinary photo galleries
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddRoomOpen(true)}
                    style={{
                      backgroundColor: "#2563eb",
                      borderColor: "#2563eb",
                      fontWeight: 700,
                      borderRadius: 10,
                      height: 40,
                      padding: "0 20px",
                    }}
                  >
                    + Add New Room
                  </Button>
                </div>

                {propertyRooms.length === 0 ? (
                  <Card style={{ borderRadius: 18, textAlign: "center", padding: 48, border: "1px solid #e2e8f0" }}>
                    <Empty
                      description={
                        <div style={{ maxWidth: 400, margin: "0 auto" }}>
                          <Title level={4} style={{ margin: "8px 0 4px", fontWeight: 700 }}>
                            No room units registered yet
                          </Title>
                          <Text type="secondary">
                            Add your first guest suite or bedroom with multiple room photos to start hosting.
                          </Text>
                        </div>
                      }
                    >
                      <Button
                        type="primary"
                        onClick={() => setIsAddRoomOpen(true)}
                        style={{
                          backgroundColor: "#2563eb",
                          borderColor: "#2563eb",
                          borderRadius: 10,
                          fontWeight: 700,
                          marginTop: 16,
                        }}
                      >
                        Create First Room
                      </Button>
                    </Empty>
                  </Card>
                ) : (
                  <Row gutter={[20, 20]}>
                    {propertyRooms.map((room) => (
                      <Col xs={24} sm={12} lg={8} key={room._id}>
                        <Card
                          hoverable
                          style={{
                            borderRadius: 18,
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          styles={{
                            body: {
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              flex: 1,
                              padding: 18,
                            },
                          }}
                          cover={
                            <div style={{ position: "relative", height: 200, overflow: "hidden", background: "#f1f5f9" }}>
                              <img
                                alt={room.roomName}
                                src={
                                  room.images?.[0] ||
                                  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                                }
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <Tag
                                color="rgba(0, 0, 0, 0.75)"
                                style={{
                                  position: "absolute",
                                  top: 12,
                                  left: 12,
                                  color: "#fff",
                                  fontWeight: 700,
                                  borderRadius: 6,
                                  border: "none",
                                  fontSize: 11,
                                }}
                              >
                                Room #{room.roomNo}
                              </Tag>

                              <Tag
                                color={room.isAvalabile ? "success" : "error"}
                                style={{
                                  position: "absolute",
                                  top: 12,
                                  right: 12,
                                  fontWeight: 700,
                                  borderRadius: 6,
                                }}
                              >
                                {room.isAvalabile ? "Available" : "Occupied"}
                              </Tag>

                              {room.images && room.images.length > 1 && (
                                <Tag
                                  color="rgba(0,0,0,0.6)"
                                  style={{
                                    position: "absolute",
                                    bottom: 10,
                                    right: 12,
                                    color: "#fff",
                                    borderRadius: 6,
                                    fontSize: 11,
                                  }}
                                >
                                  📷 {room.images.length} Photos
                                </Tag>
                              )}
                            </div>
                          }
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <Title level={5} style={{ margin: "0 0 2px", fontWeight: 700 }}>
                                  {room.roomName}
                                </Title>
                                <Tag color="blue" style={{ fontSize: 10, fontWeight: 600, borderRadius: 4 }}>
                                  {room.tag || "Deluxe"}
                                </Tag>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <Text strong style={{ fontSize: 17, color: "#0f172a" }}>
                                  ₹{room.price?.toLocaleString()}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                                  / night
                                </Text>
                              </div>
                            </div>

                            <Paragraph
                              type="secondary"
                              style={{ fontSize: 12, margin: "10px 0" }}
                              ellipsis={{ rows: 2 }}
                            >
                              {room.description || "Comfortable guest suite with modern amenities."}
                            </Paragraph>

                            {room.services && (
                              <Space orientation="horizontal" size={[4, 4]} wrap style={{ marginBottom: 10 }}>
                                {room.services.map((srv, idx) => (
                                  <Tag key={idx} style={{ fontSize: 10, textTransform: "uppercase", borderRadius: 4 }}>
                                    {srv}
                                  </Tag>
                                ))}
                              </Space>
                            )}
                          </div>

                          <div
                            style={{
                              paddingTop: 12,
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Space size={6} align="center">
                              <Text type="secondary" style={{ fontSize: 12 }}>Status:</Text>
                              <Switch
                                size="small"
                                checked={room.isAvalabile}
                                onChange={() => toggleRoomAvailability(room)}
                              />
                            </Space>

                            <Space size={8}>
                              {room.images && room.images.length > 0 && (
                                <Button
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => setSelectedRoomGallery(room)}
                                  style={{ borderRadius: 6, fontWeight: 600 }}
                                >
                                  Gallery
                                </Button>
                              )}

                              <Button
                                size="small"
                                type="primary"
                                icon={<PictureOutlined />}
                                onClick={() => {
                                  setSelectedRoomForPhoto(room);
                                  setIsAddPhotoOpen(true);
                                }}
                                style={{
                                  backgroundColor: "#2563eb",
                                  borderColor: "#2563eb",
                                  borderRadius: 6,
                                  fontWeight: 600,
                                }}
                              >
                                + Photos
                              </Button>
                            </Space>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ),
          },
          {
            key: "checkouts",
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                🛎️ Pending Checkouts {pendingCheckoutsCount > 0 && `(${pendingCheckoutsCount})`}
              </span>
            ),
            children: (
              <Card
                title={
                  <div>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      Guest Departures & Checkout Settle
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Click Complete Checkout when a guest checks out to receive 85% net earnings into your Property Wallet.
                    </Text>
                  </div>
                }
                style={{ borderRadius: 18, border: "1px solid #e2e8f0", marginTop: 8 }}
              >
                <Table
                  dataSource={payouts.map((p) => ({ ...p, key: p._id }))}
                  columns={payoutColumns}
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: "No guest checkouts awaiting settlement." }}
                />
              </Card>
            ),
          },
          {
            key: "settings",
            label: <span style={{ fontWeight: 700, fontSize: 15 }}>⚙️ Property & Payout Settings</span>,
            children: (
              <div style={{ marginTop: 8 }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card style={{ borderRadius: 18, border: "1px solid #e2e8f0" }} title={<span style={{ fontWeight: 700 }}>Property Information</span>}>
                      <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Property Name</Text>
                          <Title level={5} style={{ margin: 0 }}>{selectedProperty?.name}</Title>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Address</Text>
                          <Text strong style={{ display: "block" }}>
                            {selectedProperty?.address?.street || "Mall Road"}, {selectedProperty?.address?.city || "Darjeeling"}, {selectedProperty?.address?.state || "West Bengal"}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>Verification Status</Text>
                          <div>
                            <Tag color="success" style={{ fontWeight: 600 }}>Verified Listing</Tag>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card
                      style={{ borderRadius: 18, border: "1px solid #e2e8f0" }}
                      title={<span style={{ fontWeight: 700 }}>Payout Destination Bank</span>}
                      extra={<Button type="link" onClick={() => setIsEditBankOpen(true)}>Edit Bank</Button>}
                    >
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Bank Name">{bankForm.bankName}</Descriptions.Item>
                        <Descriptions.Item label="Account Holder">{bankForm.accountHolderName}</Descriptions.Item>
                        <Descriptions.Item label="Account Number">{bankForm.accountNumber}</Descriptions.Item>
                        <Descriptions.Item label="IFSC Code">{bankForm.ifscCode}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
        ]}
      />

      {/* Modal: Request Payout / Withdraw from Property Wallet */}
      <Modal
        title={
          <Space align="center" size={8}>
            <DollarCircleOutlined style={{ color: "#10b981", fontSize: 20 }} />
            <span style={{ fontWeight: 700 }}>Request Earnings Payout to Bank</span>
          </Space>
        }
        open={isMerchantWithdrawOpen}
        onOk={handleProcessMerchantWithdraw}
        onCancel={() => setIsMerchantWithdrawOpen(false)}
        confirmLoading={isProcessingWithdraw}
        okText="Transfer Funds Now"
        okButtonProps={{
          style: { backgroundColor: "#10b981", borderColor: "#10b981", fontWeight: 700, borderRadius: 8 },
        }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 12 }}>
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text type="secondary">Available Wallet Balance:</Text>
              <Text strong style={{ color: "#059669", fontSize: 18 }}>
                ₹{propertyWalletBalance.toLocaleString()}
              </Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <Text type="secondary">Destination Bank:</Text>
              <Text strong>{bankForm.bankName} (•••• {bankForm.accountNumber.slice(-4) || "6789"})</Text>
            </div>
          </div>

          <div>
            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
              Payout Amount (₹)
            </Text>
            <InputNumber
              style={{ width: "100%" }}
              min={100}
              max={propertyWalletBalance}
              value={withdrawAmount}
              onChange={(val) => setWithdrawAmount(val || 0)}
              prefix="₹"
              size="large"
            />
          </div>

          {/* Quick Amount Shortcuts */}
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
              Quick Selection:
            </Text>
            <Space size={8} wrap>
              {propertyWalletBalance >= 500 && (
                <Button size="small" onClick={() => setWithdrawAmount(500)}>
                  ₹500
                </Button>
              )}
              {propertyWalletBalance >= 1000 && (
                <Button size="small" onClick={() => setWithdrawAmount(1000)}>
                  ₹1,000
                </Button>
              )}
              <Button size="small" type="dashed" onClick={() => setWithdrawAmount(propertyWalletBalance)}>
                All Available (₹{propertyWalletBalance.toLocaleString()})
              </Button>
            </Space>
          </div>

          <Alert
            type="info"
            showIcon
            message="Transfers are processed via Direct Bank Transfer (NEFT/IMPS) with zero platform deduction fee."
            style={{ fontSize: 12 }}
          />
        </Space>
      </Modal>

      {/* Modal: Edit Bank Account Details */}
      <Modal
        title={
          <Space align="center" size={8}>
            <BankOutlined style={{ color: "#2563eb" }} />
            <span style={{ fontWeight: 700 }}>Edit Payout Bank Account Details</span>
          </Space>
        }
        open={isEditBankOpen}
        onOk={handleSaveBankDetails}
        onCancel={() => setIsEditBankOpen(false)}
        okText="Save Bank Details"
        okButtonProps={{
          style: { backgroundColor: "#2563eb", borderColor: "#2563eb", fontWeight: 700, borderRadius: 8 },
        }}
      >
        <Space direction="vertical" size={14} style={{ width: "100%", marginTop: 12 }}>
          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Bank Name
            </Text>
            <Input
              placeholder="e.g. HDFC Bank, State Bank of India"
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
            />
          </div>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Account Holder Name
            </Text>
            <Input
              placeholder="Name as printed on Passbook / Cheque"
              value={bankForm.accountHolderName}
              onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
            />
          </div>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Bank Account Number
            </Text>
            <Input
              placeholder="e.g. 5010023456789"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            />
          </div>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              IFSC Code
            </Text>
            <Input
              placeholder="e.g. HDFC0001234"
              value={bankForm.ifscCode}
              onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
            />
          </div>
        </Space>
      </Modal>

      {/* Modal: View Room Gallery Lightbox */}
      {selectedRoomGallery && (
        <Modal
          title={
            <Space align="center" size={8}>
              <PictureOutlined style={{ color: "#2563eb" }} />
              <span>{selectedRoomGallery.roomName} — Photo Gallery</span>
            </Space>
          }
          open={!!selectedRoomGallery}
          onCancel={() => setSelectedRoomGallery(null)}
          footer={[
            <Button key="close" onClick={() => setSelectedRoomGallery(null)}>
              Close
            </Button>,
          ]}
          width={720}
        >
          <div style={{ marginTop: 12 }}>
            <Row gutter={[12, 12]}>
              {(selectedRoomGallery.images || []).map((img, idx) => (
                <Col span={12} key={idx}>
                  <div style={{ height: 200, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <img src={img} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Modal>
      )}

      {/* Modal: Create Room */}
      <Modal
        title={`Add Room to ${selectedProperty?.name || "Property"}`}
        open={isAddRoomOpen}
        onOk={handleCreateRoom}
        onCancel={() => setIsAddRoomOpen(false)}
        okText="Save Room to Listings"
        okButtonProps={{ style: { backgroundColor: "#2563eb", borderColor: "#2563eb", fontWeight: 700 } }}
      >
        <Space orientation="vertical" size={14} style={{ width: "100%", marginTop: 10 }}>
          <Row gutter={12}>
            <Col span={14}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Room Name
              </Text>
              <Input
                placeholder="e.g. Deluxe Balcony Suite"
                value={newRoomForm.roomName}
                onChange={(e) => setNewRoomForm({ ...newRoomForm, roomName: e.target.value })}
              />
            </Col>
            <Col span={10}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Room No.
              </Text>
              <Input
                placeholder="e.g. 102"
                value={newRoomForm.roomNo}
                onChange={(e) => setNewRoomForm({ ...newRoomForm, roomNo: e.target.value })}
              />
            </Col>
          </Row>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Short Title
            </Text>
            <Input
              placeholder="e.g. Mountain View Suite"
              value={newRoomForm.title}
              onChange={(e) => setNewRoomForm({ ...newRoomForm, title: e.target.value })}
            />
          </div>

          <Row gutter={12}>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Price per Night (₹)
              </Text>
              <InputNumber
                style={{ width: "100%" }}
                min={200}
                value={newRoomForm.price}
                onChange={(val) => setNewRoomForm({ ...newRoomForm, price: val || 1000 })}
                prefix="₹"
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Category Tag
              </Text>
              <Input
                placeholder="e.g. Deluxe, Suite"
                value={newRoomForm.tag}
                onChange={(e) => setNewRoomForm({ ...newRoomForm, tag: e.target.value })}
              />
            </Col>
          </Row>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Description
            </Text>
            <Input.TextArea
              rows={2}
              placeholder="Room features, amenities and views..."
              value={newRoomForm.description}
              onChange={(e) => setNewRoomForm({ ...newRoomForm, description: e.target.value })}
            />
          </div>

          {/* Ant Design Picture-Card Multi-Upload */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
                Room Photos ({fileList.length} uploaded)
              </Text>
              {fileList.length > 0 && (
                <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                  Cover: Photo #1
                </Tag>
              )}
            </div>

            <Upload
              listType="picture-card"
              multiple={true}
              fileList={fileList}
              accept="image/*"
              customRequest={async (options) => {
                const { file, onSuccess, onError } = options;
                try {
                  const res = await api.uploadImage(file as File);
                  if (res.success && res.data?.url) {
                    onSuccess?.(res.data);
                    const uploadedUrl = res.data.url;
                    setNewRoomForm((prev) => ({
                      ...prev,
                      images: [...prev.images, uploadedUrl],
                    }));
                    message.success(`${(file as File).name} uploaded to Cloudinary!`);
                  } else {
                    onError?.(new Error(res.message || "Upload failed"));
                    message.error(res.message || "Failed to upload image");
                  }
                } catch (err: any) {
                  onError?.(err);
                  message.error("Failed to upload image to Cloudinary");
                }
              }}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              onRemove={(file) => {
                const urlToRemove = (file.response as any)?.url || file.url;
                if (urlToRemove) {
                  setNewRoomForm((prev) => ({
                    ...prev,
                    images: prev.images.filter((img) => img !== urlToRemove),
                  }));
                }
              }}
              onPreview={handlePreview}
            >
              {fileList.length >= 10 ? null : (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <PlusOutlined style={{ fontSize: 20, color: "#2563eb" }} />
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    Add Photos
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Multiple OK</div>
                </div>
              )}
            </Upload>
          </div>
        </Space>
      </Modal>

      {/* Modal: Add More Photos to Existing Room */}
      <Modal
        title={`Add Photos to ${selectedRoomForPhoto?.roomName || "Room"}`}
        open={isAddPhotoOpen}
        onOk={handleSavePhotosToRoom}
        onCancel={() => {
          setIsAddPhotoOpen(false);
          setAddPhotoFileList([]);
        }}
        okText="Save Photos to Gallery"
        okButtonProps={{ style: { backgroundColor: "#2563eb", borderColor: "#2563eb", fontWeight: 700 } }}
      >
        <Space direction="vertical" size={14} style={{ width: "100%", marginTop: 10 }}>
          <Upload
            listType="picture-card"
            multiple={true}
            fileList={addPhotoFileList}
            accept="image/*"
            customRequest={async (options) => {
              const { file, onSuccess, onError } = options;
              try {
                const res = await api.uploadImage(file as File);
                if (res.success && res.data?.url) {
                  onSuccess?.(res.data);
                  message.success(`${(file as File).name} uploaded to Cloudinary!`);
                } else {
                  onError?.(new Error(res.message || "Upload failed"));
                }
              } catch (err: any) {
                onError?.(err);
              }
            }}
            onChange={({ fileList: newFileList }) => setAddPhotoFileList(newFileList)}
            onPreview={handlePreview}
          >
            {addPhotoFileList.length >= 10 ? null : (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <PlusOutlined style={{ fontSize: 20, color: "#2563eb" }} />
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Space>
      </Modal>

      {/* Modal: Register New Property */}
      <Modal
        title="Register New Host Property"
        open={isAddPropertyOpen}
        onOk={handleCreateProperty}
        onCancel={() => setIsAddPropertyOpen(false)}
        okText="Register Property"
        okButtonProps={{ style: { backgroundColor: "#2563eb", borderColor: "#2563eb", fontWeight: 700 } }}
      >
        <Space direction="vertical" size={14} style={{ width: "100%", marginTop: 10 }}>
          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Property Name
            </Text>
            <Input
              placeholder="e.g. Himalayan Pine Retreat"
              value={newPropForm.name}
              onChange={(e) => setNewPropForm({ ...newPropForm, name: e.target.value })}
            />
          </div>

          <Row gutter={12}>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>City</Text>
              <Input
                placeholder="e.g. Darjeeling"
                value={newPropForm.city}
                onChange={(e) => setNewPropForm({ ...newPropForm, city: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>State</Text>
              <Input
                placeholder="e.g. West Bengal"
                value={newPropForm.state}
                onChange={(e) => setNewPropForm({ ...newPropForm, state: e.target.value })}
              />
            </Col>
          </Row>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Street Address</Text>
            <Input
              placeholder="e.g. Mall Road, Near Clock Tower"
              value={newPropForm.street}
              onChange={(e) => setNewPropForm({ ...newPropForm, street: e.target.value })}
            />
          </div>

          <Divider style={{ margin: "10px 0" }} />

          <Title level={5} style={{ margin: 0, fontWeight: 700 }}>
            Payout Bank Account
          </Title>

          <Row gutter={12}>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Bank Name</Text>
              <Input
                placeholder="e.g. HDFC Bank"
                value={newPropForm.bankName}
                onChange={(e) => setNewPropForm({ ...newPropForm, bankName: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>IFSC Code</Text>
              <Input
                placeholder="e.g. HDFC0001234"
                value={newPropForm.ifscCode}
                onChange={(e) => setNewPropForm({ ...newPropForm, ifscCode: e.target.value })}
              />
            </Col>
          </Row>

          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Account Number</Text>
            <Input
              placeholder="e.g. 5010023456789"
              value={newPropForm.accountNumber}
              onChange={(e) => setNewPropForm({ ...newPropForm, accountNumber: e.target.value })}
            />
          </div>
        </Space>
      </Modal>

      {/* Lightbox Preview Modal */}
      {previewOpen && (
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      )}
    </div>
  );
}