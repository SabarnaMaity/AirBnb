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
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function MerchantPanel() {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  // Modals
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [selectedRoomForPhoto, setSelectedRoomForPhoto] = useState<Room | null>(null);

  // Ant Design Upload states
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [addPhotoFileList, setAddPhotoFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

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
        // Find property owned by current user, or select first
        const myProp = user
          ? propsRes.data.find(
              (p: any) => p.owner === user._id || p.owner?._id === user._id
            ) || propsRes.data[0]
          : propsRes.data[0];
        setSelectedProperty(myProp);
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
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Card style={{ maxWidth: 480, margin: "0 auto", borderRadius: 16 }}>
          <Space direction="vertical" size={16} align="center">
            <Avatar size={64} icon={<ShopOutlined />} style={{ background: "#2563eb" }} />
            <Title level={3} style={{ margin: 0 }}>
              Host Sign-In Required
            </Title>
            <Paragraph type="secondary">
              Please sign in with a Host/Merchant account to manage listings, create room units, and process checkout settlements.
            </Paragraph>
            <Link href="/login">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", borderRadius: 10 }}
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
      message.success(`Property status set to ${nextStatus.toUpperCase()}`);
    } else {
      message.error("Failed to update status");
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
      verification: false,
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
        // Auto-create a property for this host on-the-fly
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
          verification: false,
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
      message.error(res.message || "Failed to create room in database");
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
      message.success("Checkout processed! 85% credited to property wallet and room freed up.");
      await fetchData();
    } else {
      message.error(res.message || "Checkout failed");
    }
  };

  const propertyRooms = selectedProperty
    ? rooms.filter((r) => r.property === selectedProperty._id || (r.property as any)?._id === selectedProperty._id)
    : rooms;

  // Table Columns
  const payoutColumns = [
    {
      title: "Payment ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id?.substring(0, 10)}...</Text>,
    },
    {
      title: "Gross Bill",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `₹${val?.toLocaleString()}`,
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
        <Text strong style={{ color: "#059669", fontSize: 14 }}>
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
          text={status === PaymentStatus.RECIVED ? "Awaiting Checkout" : status}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div>
          {record.status === PaymentStatus.RECIVED ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleProcessCheckout(record._id)}
              style={{ backgroundColor: "#059669", borderColor: "#059669" }}
            >
              Complete Checkout
            </Button>
          ) : (
            <Tag color="success">Settled</Tag>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Property Overview Header Card */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space orientation="horizontal" size={16} align="center">
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                }}
              >
                <ShopOutlined />
              </div>
              <div>
                <Space size={8} wrap>
                  <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                    {selectedProperty?.name || "No Property Registered Yet"}
                  </Title>
                  {selectedProperty && (
                    <Tag
                      color={selectedProperty.verification ? "success" : "warning"}
                      style={{ fontWeight: 600 }}
                    >
                      {selectedProperty.verification
                        ? "Verified Property"
                        : "Pending Verification"}
                    </Tag>
                  )}
                </Space>
                {selectedProperty && (
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    {selectedProperty.address?.city}, {selectedProperty.address?.state} • Host: {user.name?.firstName} {user.name?.lastName}
                  </Text>
                )}
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
                <div style={{ textAlign: "right", marginRight: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                    BOOKINGS STATUS
                  </Text>
                  <Space size={6} style={{ marginTop: 2 }}>
                    <Switch
                      checked={selectedProperty.status === PROPERTYSTATUS.OPEN}
                      onChange={togglePropertyStatus}
                    />
                    <Text strong>{selectedProperty.status === PROPERTYSTATUS.OPEN ? "OPEN" : "CLOSED"}</Text>
                  </Space>
                </div>
              )}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setIsAddPropertyOpen(true)}
              >
                Register Property
              </Button>

              <Button icon={<ReloadOutlined />} onClick={fetchData} />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Snapshot Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                  PROPERTY WALLET EARNINGS
                </span>
              }
              value={selectedProperty?.wallet || 0}
              prefix="₹"
              valueStyle={{ color: "#059669", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              Total 85% net earnings received after guest checkouts
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                  HOST RETENTION RATE
                </span>
              }
              value={85}
              suffix="%"
              valueStyle={{ color: "#2563eb", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              15% platform commission automatically deducted
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 20 } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BankOutlined style={{ color: "#2563eb", fontSize: 16 }} />
              <Text strong style={{ fontSize: 13 }}>
                Linked Payout Bank Account
              </Text>
            </div>
            <Text strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>
              {selectedProperty?.BankDetails?.bankName || "HDFC Bank"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              A/C: {selectedProperty?.BankDetails?.accountNumber || "XXXX-XXXX-8921"} • IFSC:{" "}
              {selectedProperty?.BankDetails?.ifscCode || "HDFC0001234"}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Guest Checkouts & Settlements */}
      <Card
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Guest Checkouts & Payout Settlement
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Release 85% net earnings to your property wallet upon departure (API: `/api/user/payment-send`)
            </Text>
          </div>
        }
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Table
          dataSource={payouts.map((p) => ({ ...p, key: p._id }))}
          columns={payoutColumns}
          pagination={false}
          locale={{ emptyText: "No pending checkouts found in database." }}
        />
      </Card>

      {/* Room Inventory */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Room Units & Gallery
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Create room listings directly into MongoDB (API: `/api/merchant/room/create`)
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddRoomOpen(true)}
            style={{ backgroundColor: "#2563eb", borderColor: "#2563eb", fontWeight: 600 }}
          >
            Add New Room
          </Button>
        </div>

        {propertyRooms.length === 0 ? (
          <Card style={{ borderRadius: 16, textAlign: "center", padding: 32 }}>
            <Empty description="No room units found for this property in MongoDB." />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {propertyRooms.map((room) => (
              <Col xs={24} sm={12} lg={8} key={room._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
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
                      padding: 16,
                    },
                  }}
                  cover={
                    <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
                      <img
                        alt={room.roomName}
                        src={
                          room.images?.[0] ||
                          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Tag
                        color="rgba(0, 0, 0, 0.65)"
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: 6,
                          border: "none",
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
                    </div>
                  }
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <Title level={5} style={{ margin: "0 0 2px", fontWeight: 700 }}>
                          {room.roomName}
                        </Title>
                        <Tag color="blue" style={{ fontSize: 10, fontWeight: 600 }}>
                          {room.tag}
                        </Tag>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
                          ₹{room.price}
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
                      {room.description}
                    </Paragraph>

                    {room.services && (
                      <Space orientation="horizontal" size={[4, 4]} wrap style={{ marginBottom: 10 }}>
                        {room.services.map((srv, idx) => (
                          <Tag key={idx} style={{ fontSize: 10, textTransform: "uppercase" }}>
                            {srv}
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </div>

                  <div
                    style={{
                      paddingTop: 10,
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Photos: {room.images?.length || 0}
                    </Text>
                    <Button
                      type="link"
                      icon={<PictureOutlined />}
                      onClick={() => {
                        setSelectedRoomForPhoto(room);
                        setIsAddPhotoOpen(true);
                      }}
                      style={{ padding: 0, fontWeight: 600 }}
                    >
                      + Add Photo
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modal: Create Room */}
      <Modal
        title={`Add Room to ${selectedProperty?.name || "Property"}`}
        open={isAddRoomOpen}
        onOk={handleCreateRoom}
        onCancel={() => setIsAddRoomOpen(false)}
        okText="Save to Database"
        okButtonProps={{ style: { backgroundColor: "#2563eb", borderColor: "#2563eb" } }}
      >
        <Space orientation="vertical" size={14} style={{ width: "100%", marginTop: 10 }}>
          {properties.length > 0 ? (
            <div>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Target Property
              </Text>
              <Select
                style={{ width: "100%" }}
                value={selectedProperty?._id || properties[0]._id}
                onChange={(val) => {
                  const found = properties.find((p) => p._id === val);
                  if (found) setSelectedProperty(found);
                }}
                options={properties.map((p) => ({
                  value: p._id,
                  label: `${p.name} (${p.address?.city || "Stay"})`,
                }))}
              />
            </div>
          ) : (
            <Alert
              type="info"
              showIcon
              message="A default property will be automatically created and assigned to this room."
              style={{ fontSize: 12 }}
            />
          )}

          <Row gutter={12}>
            <Col span={14}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Room Name
              </Text>
              <Input
                placeholder="e.g. Deluxe Balcony Suite"
                value={newRoomForm.roomName}
                onChange={(e) =>
                  setNewRoomForm({ ...newRoomForm, roomName: e.target.value })
                }
              />
            </Col>
            <Col span={10}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Room No.
              </Text>
              <Input
                placeholder="e.g. 102"
                value={newRoomForm.roomNo}
                onChange={(e) =>
                  setNewRoomForm({ ...newRoomForm, roomNo: e.target.value })
                }
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
              onChange={(e) =>
                setNewRoomForm({ ...newRoomForm, title: e.target.value })
              }
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
                onChange={(val) =>
                  setNewRoomForm({ ...newRoomForm, price: val || 1000 })
                }
                prefix="₹"
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Category Tag
              </Text>
              <Input
                placeholder="e.g. Deluxe, Beachfront"
                value={newRoomForm.tag}
                onChange={(e) =>
                  setNewRoomForm({ ...newRoomForm, tag: e.target.value })
                }
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
              onChange={(e) =>
                setNewRoomForm({ ...newRoomForm, description: e.target.value })
              }
            />
          </div>

          {/* Ant Design Official Picture-Card Multi-Upload */}
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
              onChange={({ fileList: newFileList }) => {
                setFileList(newFileList);
              }}
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
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
              Select multiple photos at once (PNG, JPG, WEBP). Stored directly on Cloudinary CDN.
            </Text>
          </div>
        </Space>
      </Modal>

      {/* Modal: Add Photo using Ant Design Upload */}
      {selectedRoomForPhoto && (
        <Modal
          title={`Add Photos to ${selectedRoomForPhoto.roomName}`}
          open={isAddPhotoOpen}
          onOk={handleSavePhotosToRoom}
          onCancel={() => {
            setIsAddPhotoOpen(false);
            setAddPhotoFileList([]);
          }}
          okText={`Save ${addPhotoFileList.filter((f) => f.status === "done").length} Photo(s) to Room`}
          okButtonProps={{
            style: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
            disabled: addPhotoFileList.filter((f) => f.status === "done").length === 0,
          }}
        >
          <Space direction="vertical" size={14} style={{ width: "100%", marginTop: 12 }}>
            <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
              Upload Room Photos to Cloudinary
            </Text>

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
                    message.error(res.message || "Failed to upload image");
                  }
                } catch (err: any) {
                  onError?.(err);
                  message.error("Failed to upload image to Cloudinary");
                }
              }}
              onChange={({ fileList: newFileList }) => {
                setAddPhotoFileList(newFileList);
              }}
              onPreview={handlePreview}
            >
              {addPhotoFileList.length >= 10 ? null : (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <PlusOutlined style={{ fontSize: 20, color: "#2563eb" }} />
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    Add Photos
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Select Multiple</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
              Select multiple photos at once. Click 'Save' when uploads complete.
            </Text>
          </Space>
        </Modal>
      )}

      {/* Lightbox Preview Modal */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%", borderRadius: 8 }} src={previewImage} />
      </Modal>

      {/* Modal: Register Property */}
      <Modal
        title="Register New Hotel or Resort Property"
        open={isAddPropertyOpen}
        onOk={handleCreateProperty}
        onCancel={() => setIsAddPropertyOpen(false)}
        okText="Register Property"
      >
        <Space orientation="vertical" size={12} style={{ width: "100%", marginTop: 10 }}>
          <div>
            <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Property Name
            </Text>
            <Input
              placeholder="e.g. Darjeeling Hill Resort"
              value={newPropForm.name}
              onChange={(e) => setNewPropForm({ ...newPropForm, name: e.target.value })}
            />
          </div>

          <Row gutter={8}>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Street Address
              </Text>
              <Input
                placeholder="Mall Road"
                value={newPropForm.street}
                onChange={(e) => setNewPropForm({ ...newPropForm, street: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                City
              </Text>
              <Input
                placeholder="Darjeeling"
                value={newPropForm.city}
                onChange={(e) => setNewPropForm({ ...newPropForm, city: e.target.value })}
              />
            </Col>
          </Row>

          <Row gutter={8}>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Bank Name
              </Text>
              <Input
                value={newPropForm.bankName}
                onChange={(e) => setNewPropForm({ ...newPropForm, bankName: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Account Number
              </Text>
              <Input
                value={newPropForm.accountNumber}
                onChange={(e) => setNewPropForm({ ...newPropForm, accountNumber: e.target.value })}
              />
            </Col>
          </Row>
        </Space>
      </Modal>
    </div>
  );
}
