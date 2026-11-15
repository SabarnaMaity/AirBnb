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
} from "antd";
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
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotosList, setNewPhotosList] = useState<string[]>([]);
  const [singleUrlInput, setSingleUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

    const payload = {
      name: newPropForm.name,
      address: {
        street: newPropForm.street,
        city: newPropForm.city,
        state: newPropForm.state,
        country: newPropForm.country,
      },
      owner: user._id,
      status: PROPERTYSTATUS.OPEN,
      verification: false,
      wallet: 0,
      BankDetails: {
        bankName: newPropForm.bankName,
        accountNumber: newPropForm.accountNumber,
        ifscCode: newPropForm.ifscCode,
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
            accountNumber: "5010023456789",
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

  // Multiple images upload to Cloudinary for new room
  const handleRoomImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadingImage(true);
    message.loading({ content: `Uploading ${files.length} photo(s) to Cloudinary...`, key: "cld_upload" });
    try {
      const res = await api.uploadMultipleImages(files);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const uploadedUrls = res.data.map((item) => item.url);
        setNewRoomForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        message.success({
          content: `Uploaded ${uploadedUrls.length} photo(s) to Cloudinary!`,
          key: "cld_upload",
        });
      } else {
        message.error({
          content: res.message || "Failed to upload images to Cloudinary",
          key: "cld_upload",
        });
      }
    } catch (err: any) {
      message.error({ content: "Cloudinary upload failed", key: "cld_upload" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveRoomImage = (indexToRemove: number) => {
    setNewRoomForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddImageUrl = () => {
    if (!singleUrlInput.trim()) return;
    setNewRoomForm((prev) => ({
      ...prev,
      images: [...prev.images, singleUrlInput.trim()],
    }));
    setSingleUrlInput("");
  };

  // Multiple photos upload for existing room
  const handleAddPhotosToRoomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadingImage(true);
    message.loading({ content: `Uploading ${files.length} photo(s) to Cloudinary...`, key: "cld_room_upload" });
    try {
      const res = await api.uploadMultipleImages(files);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const uploadedUrls = res.data.map((item) => item.url);
        setNewPhotosList((prev) => [...prev, ...uploadedUrls]);
        message.success({
          content: `Uploaded ${uploadedUrls.length} photo(s) to Cloudinary!`,
          key: "cld_room_upload",
        });
      } else {
        message.error({
          content: res.message || "Failed to upload photos",
          key: "cld_room_upload",
        });
      }
    } catch (err) {
      message.error({ content: "Cloudinary upload failed", key: "cld_room_upload" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Save batch photos to existing room
  const handleSavePhotosToRoom = async () => {
    if (!selectedRoomForPhoto || newPhotosList.length === 0) {
      message.error("Please upload or provide at least one photo");
      return;
    }

    const res = await api.addRoomImages(selectedRoomForPhoto._id, newPhotosList);
    if (res.success) {
      message.success(`Added ${newPhotosList.length} photo(s) to ${selectedRoomForPhoto.roomName}!`);
      setNewPhotosList([]);
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

          {/* Multi-Photo Cloudinary Upload */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
                Room Gallery & Photos ({newRoomForm.images.length} added)
              </Text>
              {newRoomForm.images.length > 0 && (
                <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                  Cover: Photo #1
                </Tag>
              )}
            </div>

            {/* Drag & Drop Multi-file Uploader */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 16px",
                border: "2px dashed #93c5fd",
                borderRadius: 12,
                background: "#f8fafc",
                cursor: uploadingImage ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                textAlign: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImage}
                onChange={handleRoomImagesUpload}
                style={{ display: "none" }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb",
                  fontSize: 22,
                  marginBottom: 8,
                }}
              >
                <CloudUploadOutlined />
              </div>
              <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
                Click to browse or drop multiple room photos
              </Text>
              <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>
                Select multiple photos at once • Auto-uploaded directly to Cloudinary
              </Text>
            </label>

            {uploadingImage && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <Spin size="small" />
                <Text style={{ fontSize: 12, marginLeft: 8, color: "#2563eb", fontWeight: 600 }}>
                  Uploading photos to Cloudinary...
                </Text>
              </div>
            )}

            {/* Quick URL Input as an alternative */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Input
                placeholder="Or paste an image URL here..."
                value={singleUrlInput}
                onChange={(e) => setSingleUrlInput(e.target.value)}
                onPressEnter={handleAddImageUrl}
                size="small"
              />
              <Button size="small" onClick={handleAddImageUrl} disabled={!singleUrlInput.trim()}>
                + Add URL
              </Button>
            </div>

            {/* Uploaded Gallery Grid */}
            {newRoomForm.images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 10,
                  marginTop: 12,
                  maxHeight: 220,
                  overflowY: "auto",
                  padding: "4px 2px",
                }}
              >
                {newRoomForm.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: idx === 0 ? "2px solid #2563eb" : "1px solid #e2e8f0",
                      height: 80,
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Room photo ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {idx === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 2,
                          left: 2,
                          background: "#2563eb",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: 4,
                        }}
                      >
                        COVER
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveRoomImage(idx)}
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        background: "rgba(0, 0, 0, 0.65)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Space>
      </Modal>

      {/* Modal: Add Photo */}
      {selectedRoomForPhoto && (
        <Modal
          title={`Add Photos to ${selectedRoomForPhoto.roomName}`}
          open={isAddPhotoOpen}
          onOk={handleSavePhotosToRoom}
          onCancel={() => {
            setIsAddPhotoOpen(false);
            setNewPhotosList([]);
          }}
          okText={`Save ${newPhotosList.length > 0 ? `${newPhotosList.length} ` : ""}Photo(s) to Room`}
          okButtonProps={{
            style: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
            loading: uploadingImage,
            disabled: newPhotosList.length === 0,
          }}
        >
          <Space direction="vertical" size={14} style={{ width: "100%", marginTop: 12 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 16px",
                border: "2px dashed #93c5fd",
                borderRadius: 12,
                background: "#f8fafc",
                cursor: uploadingImage ? "not-allowed" : "pointer",
                textAlign: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImage}
                onChange={handleAddPhotosToRoomUpload}
                style={{ display: "none" }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb",
                  fontSize: 22,
                  marginBottom: 8,
                }}
              >
                <CloudUploadOutlined />
              </div>
              <Text strong style={{ fontSize: 13, color: "#0f172a" }}>
                Select Multiple Photos (Cloudinary)
              </Text>
              <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>
                Click to browse multiple photos from your device
              </Text>
            </label>

            {uploadingImage && (
              <div style={{ textAlign: "center", padding: "6px 0" }}>
                <Spin size="small" />
                <Text style={{ fontSize: 12, marginLeft: 8, color: "#2563eb" }}>
                  Uploading to Cloudinary...
                </Text>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <Input
                placeholder="Or paste an image URL..."
                value={singleUrlInput}
                onChange={(e) => setSingleUrlInput(e.target.value)}
                onPressEnter={() => {
                  if (singleUrlInput.trim()) {
                    setNewPhotosList((prev) => [...prev, singleUrlInput.trim()]);
                    setSingleUrlInput("");
                  }
                }}
                size="small"
              />
              <Button
                size="small"
                onClick={() => {
                  if (singleUrlInput.trim()) {
                    setNewPhotosList((prev) => [...prev, singleUrlInput.trim()]);
                    setSingleUrlInput("");
                  }
                }}
                disabled={!singleUrlInput.trim()}
              >
                + Add
              </Button>
            </div>

            {newPhotosList.length > 0 && (
              <div>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                  Photos to be added ({newPhotosList.length}):
                </Text>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {newPhotosList.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        height: 70,
                      }}
                    >
                      <img
                        src={url}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewPhotosList((prev) => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 18,
                          height: 18,
                          fontSize: 11,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Space>
        </Modal>
      )}

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
