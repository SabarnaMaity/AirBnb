"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Room, AppNotification, USERROLE, Property, PROPERTYSTATUS, PaymentStatus } from "@/types";
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
  Input,
  InputNumber,
  Select,
  Badge,
  message,
  Divider,
  Drawer,
  List,
  Avatar,
  Spin,
  Alert,
  Empty,
  Tabs,
  Popconfirm,
  Form,
  Descriptions,
} from "antd";
import {
  WalletOutlined,
  PlusCircleOutlined,
  ArrowDownOutlined,
  HeartOutlined,
  HeartFilled,
  BellOutlined,
  RollbackOutlined,
  EnvironmentOutlined,
  LoginOutlined,
  ReloadOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function UserPanel() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("trips");

  // Modals
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<{
    booking: any;
    room: Room | null;
  } | null>(null);

  // Form states
  const [addAmount, setAddAmount] = useState<number>(1000);
  const [addMethod, setAddMethod] = useState("UPI / GPay");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [bookDuration, setBookDuration] = useState<number>(2);
  const [bookDate, setBookDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0] || "2026-12-01"
  );

  // Profile update form
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    emergencyContact: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync user profile state
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.name?.firstName || (user.name as any)?.first || "",
        lastName: user.name?.lastName || (user.name as any)?.last || "",
        phone: user.contactInfo?.phone || "",
        emergencyContact: user.contactInfo?.emergencyContact || "",
        addressLine: (user.address as any)?.addressLine || (user.address as any)?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: (user.address as any)?.postalCode || (user.address as any)?.zipCode || "",
        country: user.address?.country || "India",
      });
    }
  }, [user]);

  // Fetch real data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Rooms, Properties, Payments simultaneously
      const [roomsRes, propsRes, payRes] = await Promise.all([
        api.getAllRooms(),
        api.getAllProperties(),
        api.getAllPayments(),
      ]);

      if (roomsRes.success && Array.isArray(roomsRes.data)) {
        setRooms(roomsRes.data);
      }
      if (propsRes.success && Array.isArray(propsRes.data)) {
        setProperties(propsRes.data);
      }
      if (payRes.success && Array.isArray(payRes.data)) {
        setPayments(payRes.data);
      }

      // 2. Fetch User-specific data if logged in
      if (user?._id) {
        await refreshUser();

        // Fetch likes
        const likesRes = await api.getLikes(user._id);
        if (likesRes.success && Array.isArray(likesRes.data)) {
          setWishlist(likesRes.data.map((item: any) => item.room));
        }

        // Fetch notifications
        const notifsRes = await api.getNotifications(user._id);
        if (notifsRes.success && Array.isArray(notifsRes.data)) {
          setNotifications(notifsRes.data);
        }

        // Fetch bookings
        const bookingsRes = await api.getAllBookings();
        if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
          const userBookings = bookingsRes.data.filter(
            (b: any) => b.user === user._id || b.user?._id === user._id
          );
          setBookings(userBookings);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch user data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  // If user is not logged in, prompt login
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <Card
          style={{
            maxWidth: 480,
            margin: "0 auto",
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Space direction="vertical" size={16} align="center">
            <Avatar size={64} icon={<UserOutlined />} style={{ background: "#ff385c" }} />
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              Sign In to View Trips & Account
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 360 }}>
              Please sign in to view your reservation details, check your digital wallet balance, and manage your account.
            </Paragraph>
            <Link href="/login">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                style={{ backgroundColor: "#ff385c", borderColor: "#ff385c", borderRadius: 10, fontWeight: 700 }}
              >
                Sign In
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    );
  }

  // Add Money Handler
  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      message.error("Please enter a valid deposit amount");
      return;
    }

    const res = await api.addWalletMoney({
      userId: user._id,
      amount: addAmount,
      method: addMethod,
      transectionDetails: `Deposited via ${addMethod} at ${new Date().toLocaleTimeString()}`,
    });

    if (res.success) {
      message.success(`₹${addAmount} successfully added to your wallet!`);
      await refreshUser();
      setIsAddMoneyOpen(false);
    } else {
      message.error(res.message || "Failed to add money");
    }
  };

  // Withdraw Handler
  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      message.error("Please enter a valid withdrawal amount");
      return;
    }
    if (withdrawAmount > (user.wallet || 0)) {
      message.error("Insufficient wallet balance for this withdrawal");
      return;
    }

    const res = await api.withdrawMoney({
      userId: user._id,
      amount: withdrawAmount,
    });

    if (res.success) {
      message.success(`Withdrawal request of ₹${withdrawAmount} submitted!`);
      await refreshUser();
      setIsWithdrawOpen(false);
    } else {
      message.error(res.message || "Failed to submit withdrawal request");
    }
  };

  // Wishlist Toggle
  const toggleLike = async (roomId: string) => {
    if (wishlist.includes(roomId)) {
      setWishlist(wishlist.filter((id) => id !== roomId));
      await api.removeLike(roomId);
      message.info("Removed from your wishlist");
    } else {
      setWishlist([...wishlist, roomId]);
      await api.addLike(user._id, roomId);
      message.success("Saved to your wishlist!");
    }
  };

  // Check if target property is closed for bookingRoom
  const isTargetPropertyClosed = (() => {
    if (!bookingRoom) return false;
    const propId = typeof bookingRoom.property === "object" ? (bookingRoom.property as any)?._id : bookingRoom.property;
    const foundProp =
      (typeof bookingRoom.property === "object" && bookingRoom.property !== null ? (bookingRoom.property as any) : null) ||
      properties.find((p) => p._id === propId);
    return foundProp?.status === PROPERTYSTATUS.CLOSE || foundProp?.status === "close";
  })();

  // Confirm Room Booking
  const handleConfirmBooking = async () => {
    if (!bookingRoom) return;

    if (isTargetPropertyClosed) {
      message.error("This property is currently closed for bookings by the host.");
      return;
    }

    const totalPrice = bookingRoom.price * bookDuration;

    if ((user.wallet || 0) < totalPrice) {
      message.error(
        `Insufficient wallet balance! Required: ₹${totalPrice}, Available: ₹${user.wallet || 0}`
      );
      return;
    }

    const res = await api.bookRoom({
      userId: user._id,
      roomId: bookingRoom._id,
      duration: bookDuration,
      startDate: bookDate,
    });

    if (res.success) {
      message.success(`Booking confirmed for ${bookingRoom.roomName}!`);
      setBookingRoom(null);
      await refreshUser();
      await fetchData();
      setActiveTab("trips");
    } else {
      message.error(res.message || "Booking failed");
    }
  };

  // Refund Handler
  const handleRefund = async (bookingId: string) => {
    try {
      const res = await api.refundPayment(bookingId);
      if (res.success) {
        message.success("100% Instant Refund credited back to your digital wallet!");
        if (selectedBookingDetail?.booking?._id === bookingId) {
          setSelectedBookingDetail(null);
        }
        await refreshUser();
        await fetchData();
      } else {
        message.error(res.message || "Refund failed");
      }
    } catch (err: any) {
      message.error("Failed to process cancellation refund");
    }
  };

  // Save profile updates
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await api.updateUser(user._id, {
        name: {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          first: profileForm.firstName,
          last: profileForm.lastName,
        },
        contactInfo: {
          phone: profileForm.phone,
          emergencyContact: profileForm.emergencyContact,
          email: user.email,
        },
        address: {
          addressLine: profileForm.addressLine,
          city: profileForm.city,
          state: profileForm.state,
          postalCode: profileForm.postalCode,
          country: profileForm.country,
        },
      });

      if (res.success) {
        message.success("Profile information updated successfully!");
        await refreshUser();
      } else {
        message.error(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      message.error("Failed to save changes");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const likedRoomObjects = rooms.filter((r) => wishlist.includes(r._id));
  const guestCode = user._id ? user._id.slice(-6).toUpperCase() : "GUEST";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* 1. Sleek Modern User Profile & Wallet Card */}
      <Card
        style={{
          borderRadius: 20,
          boxShadow: "0 2px 14px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
        styles={{ body: { padding: "26px 30px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[20, 20]}>
          <Col xs={24} md={13}>
            <Space orientation="horizontal" size={18} align="center">
              <Avatar
                size={64}
                style={{
                  background: "linear-gradient(135deg, #ff385c, #e11d48)",
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: "0 4px 14px rgba(255, 56, 92, 0.3)",
                }}
              >
                {user.name?.firstName?.[0] || (user.name as any)?.first?.[0] || "U"}
              </Avatar>
              <div>
                <Space size={8} wrap align="center">
                  <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
                    {user.name?.firstName || (user.name as any)?.first} {user.name?.lastName || (user.name as any)?.last}
                  </Title>
                  <Tag
                    icon={<CheckCircleFilled />}
                    color="success"
                    style={{ fontWeight: 600, borderRadius: 12, padding: "2px 10px" }}
                  >
                    Verified Traveler
                  </Tag>
                  <Tag color="default" style={{ fontWeight: 600, borderRadius: 12 }}>
                    ID: #{guestCode}
                  </Tag>
                </Space>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 6,
                    flexWrap: "wrap",
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MailOutlined /> {user.email}
                  </span>
                  {profileForm.phone && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <PhoneOutlined /> {profileForm.phone}
                    </span>
                  )}
                  {profileForm.city && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <EnvironmentOutlined /> {profileForm.city}, {profileForm.state || "India"}
                    </span>
                  )}
                  <span>• <strong>{bookings.length}</strong> Trip{bookings.length !== 1 ? "s" : ""} Booked</span>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={11}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "10px 20px",
                  borderRadius: 14,
                  textAlign: "right",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                  DIGITAL WALLET BALANCE
                </Text>
                <Text strong style={{ color: "#059669", fontSize: 24, letterSpacing: "-0.5px" }}>
                  ₹{(user.wallet || 0).toLocaleString()}
                </Text>
              </div>

              <Space orientation="horizontal" size={8}>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setIsAddMoneyOpen(true)}
                  style={{
                    backgroundColor: "#ff385c",
                    borderColor: "#ff385c",
                    fontWeight: 700,
                    height: 42,
                    borderRadius: 10,
                  }}
                >
                  Deposit
                </Button>

                <Button
                  icon={<ArrowDownOutlined />}
                  onClick={() => setIsWithdrawOpen(true)}
                  style={{ fontWeight: 600, height: 42, borderRadius: 10 }}
                >
                  Withdraw
                </Button>

                <Badge count={unreadCount} size="small">
                  <Button
                    icon={<BellOutlined />}
                    onClick={() => setIsNotificationOpen(true)}
                    style={{ height: 42, borderRadius: 10 }}
                  />
                </Badge>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  style={{ height: 42, borderRadius: 10 }}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 2. Organized Dashboard Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: "trips",
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                🧳 My Bookings ({bookings.length})
              </span>
            ),
            children: (
              <div style={{ marginTop: 8 }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Spin size="large" tip="Loading your booked stays..." />
                  </div>
                ) : bookings.length === 0 ? (
                  <Card style={{ borderRadius: 20, textAlign: "center", padding: 48, border: "1px solid #e2e8f0" }}>
                    <Empty
                      description={
                        <div style={{ maxWidth: 440, margin: "0 auto" }}>
                          <Title level={4} style={{ margin: "8px 0 4px", fontWeight: 700 }}>
                            No upcoming trips booked yet
                          </Title>
                          <Text type="secondary">
                            Ready to pack your bags? Explore our handpicked rooms, suites, and vacation retreats.
                          </Text>
                        </div>
                      }
                    >
                      <Button
                        type="primary"
                        onClick={() => setActiveTab("explore")}
                        style={{
                          backgroundColor: "#ff385c",
                          borderColor: "#ff385c",
                          borderRadius: 10,
                          fontWeight: 700,
                          marginTop: 16,
                          height: 42,
                          padding: "0 28px",
                        }}
                      >
                        Explore Available Stays
                      </Button>
                    </Empty>
                  </Card>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {bookings.map((booking) => {
                      const roomId = typeof booking.room === "object" ? booking.room?._id : booking.room;
                      const matchedRoom =
                        rooms.find((r) => r._id === roomId) ||
                        (typeof booking.room === "object" ? booking.room : null);

                      const roomName = matchedRoom?.roomName || "Deluxe Vacation Suite";
                      const roomLocation = matchedRoom?.mapLocation || "Darjeeling, India";
                      const roomPhoto =
                        matchedRoom?.images?.[0] ||
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

                      const checkInDate = booking.startDate ? new Date(booking.startDate) : new Date();
                      const checkOutDate = new Date(checkInDate);
                      checkOutDate.setDate(checkOutDate.getDate() + (booking.duration || 1));

                      const checkInFormatted = checkInDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const checkOutFormatted = checkOutDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      const tripCode = booking._id ? booking._id.slice(-6).toUpperCase() : "TRIP";

                      // Match payment from payments array
                      const matchingPayment = payments.find(
                        (p) =>
                          (p.room === roomId || p.room?._id === roomId) &&
                          (p.userId === user._id || p.userId?._id === user._id)
                      );

                      const isSettledOrCheckedOut =
                        booking.status === "CHECKED_OUT" ||
                        matchingPayment?.status === PaymentStatus.SEND;

                      const isRefunded =
                        booking.status === "REFUNDED" ||
                        matchingPayment?.status === PaymentStatus.REFUND;

                      return (
                        <Card
                          key={booking._id}
                          hoverable
                          style={{
                            borderRadius: 18,
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                            transition: "all 0.2s ease",
                          }}
                          styles={{ body: { padding: 20 } }}
                        >
                          <Row gutter={[20, 20]} align="middle">
                            {/* Room Image */}
                            <Col xs={24} sm={8} md={6}>
                              <div
                                style={{
                                  height: 145,
                                  borderRadius: 12,
                                  overflow: "hidden",
                                  position: "relative",
                                  background: "#f1f5f9",
                                }}
                              >
                                <img
                                  src={roomPhoto}
                                  alt={roomName}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                {matchedRoom?.roomNo && (
                                  <Tag
                                    color="rgba(0,0,0,0.75)"
                                    style={{
                                      position: "absolute",
                                      top: 8,
                                      left: 8,
                                      color: "#fff",
                                      border: "none",
                                      fontWeight: 700,
                                      borderRadius: 6,
                                      fontSize: 11,
                                    }}
                                  >
                                    Room #{matchedRoom.roomNo}
                                  </Tag>
                                )}
                              </div>
                            </Col>

                            {/* Booking Details */}
                            <Col xs={24} sm={10} md={12}>
                              <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                  {isSettledOrCheckedOut ? (
                                    <Tag color="purple" style={{ fontWeight: 700, borderRadius: 6 }}>
                                      STAY COMPLETED
                                    </Tag>
                                  ) : isRefunded ? (
                                    <Tag color="error" style={{ fontWeight: 700, borderRadius: 6 }}>
                                      CANCELLED & REFUNDED
                                    </Tag>
                                  ) : (
                                    <Tag color="success" style={{ fontWeight: 700, borderRadius: 6 }}>
                                      CONFIRMED RESERVATION
                                    </Tag>
                                  )}
                                  <Tag color="blue" style={{ fontWeight: 600, borderRadius: 6 }}>
                                    Ref: #{tripCode}
                                  </Tag>
                                  {matchedRoom?.tag && (
                                    <Tag color="purple" style={{ fontWeight: 600, borderRadius: 6 }}>
                                      {matchedRoom.tag}
                                    </Tag>
                                  )}
                                </div>

                                <Title level={4} style={{ margin: "6px 0 2px", fontWeight: 700 }}>
                                  {roomName}
                                </Title>

                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: 13,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                >
                                  <EnvironmentOutlined /> {roomLocation}
                                </Text>

                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 12,
                                    marginTop: 10,
                                    background: "#f8fafc",
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    fontSize: 12,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span style={{ color: "#334155", fontWeight: 600 }}>
                                    📅 {checkInFormatted} ➔ {checkOutFormatted}
                                  </span>
                                  <span style={{ color: "#64748b" }}>
                                    ({booking.duration} Night{booking.duration > 1 ? "s" : ""})
                                  </span>
                                </div>
                              </Space>
                            </Col>

                            {/* Price & Actions */}
                            <Col xs={24} sm={6} md={6}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: 12,
                                }}
                              >
                                <div style={{ textAlign: "right" }}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}
                                  >
                                    Total Paid
                                  </Text>
                                  <Text strong style={{ fontSize: 24, color: "#0f172a", display: "block" }}>
                                    ₹{booking.price?.toLocaleString()}
                                  </Text>
                                  <Tag
                                    color={isSettledOrCheckedOut ? "default" : isRefunded ? "error" : "cyan"}
                                    style={{ fontSize: 10, fontWeight: 700, borderRadius: 4, marginTop: 2 }}
                                  >
                                    {isSettledOrCheckedOut
                                      ? "Checked Out"
                                      : isRefunded
                                      ? "Refunded to Wallet"
                                      : "Paid via Wallet"}
                                  </Tag>
                                </div>

                                <Space size={8}>
                                  <Button
                                    size="small"
                                    icon={<InfoCircleOutlined />}
                                    onClick={() => setSelectedBookingDetail({ booking, room: matchedRoom })}
                                    style={{ borderRadius: 8, fontWeight: 600 }}
                                  >
                                    Details
                                  </Button>

                                  {isSettledOrCheckedOut ? (
                                    <Tag color="default" style={{ fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>
                                      ✓ Completed
                                    </Tag>
                                  ) : isRefunded ? (
                                    <Tag color="red" style={{ fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>
                                      Refunded
                                    </Tag>
                                  ) : (
                                    <Popconfirm
                                      title="Cancel this reservation?"
                                      description="100% instant refund will be credited directly to your digital wallet."
                                      onConfirm={() => handleRefund(booking._id)}
                                      okText="Yes, Cancel & Refund"
                                      cancelText="Keep Stay"
                                      okButtonProps={{ danger: true }}
                                    >
                                      <Button
                                        size="small"
                                        danger
                                        icon={<RollbackOutlined />}
                                        style={{ borderRadius: 8, fontWeight: 600 }}
                                      >
                                        Cancel & Refund
                                      </Button>
                                    </Popconfirm>
                                  )}
                                </Space>
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "profile",
            label: <span style={{ fontWeight: 700, fontSize: 15 }}>👤 My Profile & Account</span>,
            children: (
              <div style={{ marginTop: 8 }}>
                <Row gutter={[24, 24]}>
                  {/* Personal Information */}
                  <Col xs={24} lg={14}>
                    <Card
                      style={{ borderRadius: 18, border: "1px solid #e2e8f0" }}
                      title={<span style={{ fontWeight: 700 }}>Personal Information</span>}
                    >
                      <Form layout="vertical" onFinish={handleSaveProfile}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="First Name" required>
                              <Input
                                size="large"
                                value={profileForm.firstName}
                                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Last Name" required>
                              <Input
                                size="large"
                                value={profileForm.lastName}
                                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item label="Email Address">
                          <Input size="large" value={user.email} disabled prefix={<MailOutlined />} />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Phone Number">
                              <Input
                                size="large"
                                placeholder="+91 9876543210"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                prefix={<PhoneOutlined />}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Emergency Contact">
                              <Input
                                size="large"
                                placeholder="+91 9123456780"
                                value={profileForm.emergencyContact}
                                onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider style={{ margin: "16px 0" }} />

                        <Title level={5} style={{ fontWeight: 700, marginBottom: 16 }}>
                          Residential Address
                        </Title>

                        <Form.Item label="Street / Apartment Address">
                          <Input
                            size="large"
                            placeholder="e.g. 12B Park Street, Flat 4A"
                            value={profileForm.addressLine}
                            onChange={(e) => setProfileForm({ ...profileForm, addressLine: e.target.value })}
                          />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item label="City">
                              <Input
                                size="large"
                                placeholder="Kolkata"
                                value={profileForm.city}
                                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label="State">
                              <Input
                                size="large"
                                placeholder="West Bengal"
                                value={profileForm.state}
                                onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item label="Postal Code">
                              <Input
                                size="large"
                                placeholder="700091"
                                value={profileForm.postalCode}
                                onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isSavingProfile}
                          style={{
                            backgroundColor: "#ff385c",
                            borderColor: "#ff385c",
                            borderRadius: 10,
                            fontWeight: 700,
                            height: 42,
                            padding: "0 28px",
                            marginTop: 8,
                          }}
                        >
                          Save Profile Changes
                        </Button>
                      </Form>
                    </Card>
                  </Col>

                  {/* Account Summary & Digital Wallet info */}
                  <Col xs={24} lg={10}>
                    <Card
                      style={{ borderRadius: 18, border: "1px solid #e2e8f0" }}
                      title={<span style={{ fontWeight: 700 }}>Account & Wallet Status</span>}
                    >
                      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                        <div
                          style={{
                            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                            borderRadius: 16,
                            padding: 20,
                            color: "#ffffff",
                            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.2)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700 }}>
                              AVAILABLE WALLET FUNDS
                            </Text>
                            <WalletOutlined style={{ fontSize: 22 }} />
                          </div>
                          <Title level={2} style={{ color: "#ffffff", margin: "8px 0 16px", fontWeight: 800 }}>
                            ₹{(user.wallet || 0).toLocaleString()}
                          </Title>
                          <Space size={10}>
                            <Button
                              onClick={() => setIsAddMoneyOpen(true)}
                              style={{
                                background: "#ffffff",
                                color: "#059669",
                                fontWeight: 700,
                                border: "none",
                                borderRadius: 8,
                              }}
                            >
                              Add Money
                            </Button>
                            <Button
                              onClick={() => setIsWithdrawOpen(true)}
                              style={{
                                background: "rgba(255,255,255,0.2)",
                                color: "#ffffff",
                                fontWeight: 600,
                                border: "none",
                                borderRadius: 8,
                              }}
                            >
                              Withdraw
                            </Button>
                          </Space>
                        </div>

                        <div style={{ background: "#f8fafc", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                          <Title level={5} style={{ margin: "0 0 10px", fontWeight: 700 }}>
                            Member Overview
                          </Title>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text type="secondary">Account Role:</Text>
                              <Tag color="green" style={{ fontWeight: 700 }}>Verified Traveler</Tag>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text type="secondary">Total Trips Booked:</Text>
                              <Text strong>{bookings.length}</Text>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text type="secondary">Wishlist Items:</Text>
                              <Text strong>{wishlist.length}</Text>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text type="secondary">Account ID:</Text>
                              <Text code>#{guestCode}</Text>
                            </div>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: "explore",
            label: <span style={{ fontWeight: 700, fontSize: 15 }}>🏨 Browse Stays ({rooms.length})</span>,
            children: (
              <div style={{ marginTop: 8 }}>
                {rooms.length === 0 ? (
                  <Card style={{ borderRadius: 20, textAlign: "center", padding: 48, border: "1px solid #e2e8f0" }}>
                    <Empty description="No stays currently listed. Check back soon!" />
                  </Card>
                ) : (
                  <Row gutter={[20, 20]}>
                    {rooms.map((room) => {
                      const isLiked = wishlist.includes(room._id);
                      const roomImg =
                        room.images?.[0] ||
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

                      // Check parent property status
                      const propId = typeof room.property === "object" ? (room.property as any)?._id : room.property;
                      const matchedProperty =
                        (typeof room.property === "object" && room.property !== null ? (room.property as any) : null) ||
                        properties.find((p) => p._id === propId);

                      const isPropertyClosed =
                        matchedProperty?.status === PROPERTYSTATUS.CLOSE ||
                        matchedProperty?.status === "close";

                      const isRoomAvailable = room.isAvalabile && !isPropertyClosed;

                      return (
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
                              opacity: isPropertyClosed ? 0.75 : 1,
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
                              <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                                <img
                                  alt={room.roomName}
                                  src={roomImg}
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

                                <Button
                                  type="text"
                                  shape="circle"
                                  icon={
                                    isLiked ? (
                                      <HeartFilled style={{ color: "#ff385c", fontSize: 18 }} />
                                    ) : (
                                      <HeartOutlined style={{ color: "#ffffff", fontSize: 18 }} />
                                    )
                                  }
                                  onClick={() => toggleLike(room._id)}
                                  style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    background: "rgba(0,0,0,0.3)",
                                    backdropFilter: "blur(4px)",
                                  }}
                                />

                                {isPropertyClosed ? (
                                  <Tag
                                    color="error"
                                    style={{
                                      position: "absolute",
                                      bottom: 10,
                                      left: 12,
                                      fontWeight: 700,
                                      borderRadius: 6,
                                    }}
                                  >
                                    Bookings Closed
                                  </Tag>
                                ) : (
                                  <Tag
                                    color={room.isAvalabile ? "success" : "error"}
                                    style={{
                                      position: "absolute",
                                      bottom: 10,
                                      left: 12,
                                      fontWeight: 700,
                                      borderRadius: 6,
                                    }}
                                  >
                                    {room.isAvalabile ? "Available" : "Occupied"}
                                  </Tag>
                                )}
                              </div>
                            }
                          >
                            <div>
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  color: "#ff385c",
                                }}
                              >
                                {room.tag || "Deluxe"}
                              </Text>
                              <Title level={5} style={{ margin: "2px 0 6px", fontWeight: 700 }} ellipsis>
                                {room.roomName}
                              </Title>
                              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 10 }} ellipsis={{ rows: 2 }}>
                                {room.description}
                              </Paragraph>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                                <EnvironmentOutlined />
                                <span>{room.mapLocation}</span>
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: 14,
                                paddingTop: 12,
                                borderTop: "1px solid #f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                                  ₹{room.price?.toLocaleString()}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  per night
                                </Text>
                              </div>

                              {isPropertyClosed ? (
                                <Button
                                  disabled
                                  style={{
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    backgroundColor: "#f1f5f9",
                                  }}
                                >
                                  Bookings Paused
                                </Button>
                              ) : (
                                <Button
                                  type="primary"
                                  disabled={!room.isAvalabile}
                                  onClick={() => setBookingRoom(room)}
                                  style={{
                                    backgroundColor: room.isAvalabile ? "#ff385c" : undefined,
                                    borderColor: room.isAvalabile ? "#ff385c" : undefined,
                                    fontWeight: 700,
                                    borderRadius: 8,
                                  }}
                                >
                                  {room.isAvalabile ? "Reserve Stay" : "Reserved"}
                                </Button>
                              )}
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
            ),
          },
          {
            key: "wishlist",
            label: (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                ❤️ Saved Wishlist ({wishlist.length})
              </span>
            ),
            children: (
              <div style={{ marginTop: 8 }}>
                {likedRoomObjects.length === 0 ? (
                  <Card style={{ borderRadius: 20, textAlign: "center", padding: 48, border: "1px solid #e2e8f0" }}>
                    <Empty description="No saved stays in your wishlist yet. Click the heart icon on any stay to bookmark it!" />
                  </Card>
                ) : (
                  <Row gutter={[20, 20]}>
                    {likedRoomObjects.map((room) => (
                      <Col xs={24} sm={12} lg={8} key={room._id}>
                        <Card
                          hoverable
                          style={{ borderRadius: 18, overflow: "hidden", border: "1px solid #e2e8f0" }}
                          cover={
                            <img
                              alt={room.roomName}
                              src={room.images?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"}
                              style={{ height: 180, objectFit: "cover" }}
                            />
                          }
                        >
                          <Title level={5} style={{ margin: "0 0 4px", fontWeight: 700 }}>
                            {room.roomName}
                          </Title>
                          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
                            {room.mapLocation} • ₹{room.price}/night
                          </Text>
                          <Button
                            type="primary"
                            block
                            onClick={() => setBookingRoom(room)}
                            style={{ backgroundColor: "#ff385c", borderColor: "#ff385c", borderRadius: 8, fontWeight: 700 }}
                          >
                            Book Now
                          </Button>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal: View Full Stay & Booking Details */}
      {selectedBookingDetail && (
        <Modal
          title={
            <Space align="center" size={8}>
              <HomeOutlined style={{ color: "#ff385c" }} />
              <span>Stay Details & Reservation Receipt</span>
            </Space>
          }
          open={!!selectedBookingDetail}
          onCancel={() => setSelectedBookingDetail(null)}
          footer={(() => {
            const b = selectedBookingDetail.booking;
            const rId = typeof b.room === "object" ? b.room?._id : b.room;
            const mPay = payments.find(
              (p) =>
                (p.room === rId || p.room?._id === rId) &&
                (p.userId === user._id || p.userId?._id === user._id)
            );
            const isSettled = b.status === "CHECKED_OUT" || mPay?.status === PaymentStatus.SEND;
            const isRef = b.status === "REFUNDED" || mPay?.status === PaymentStatus.REFUND;

            if (isSettled || isRef) {
              return [
                <Button key="close" type="primary" onClick={() => setSelectedBookingDetail(null)}>
                  Close
                </Button>,
              ];
            }

            return [
              <Button key="close" onClick={() => setSelectedBookingDetail(null)}>
                Keep Stay
              </Button>,
              <Popconfirm
                key="refund"
                title="Cancel this reservation?"
                description="100% instant refund will be credited directly to your digital wallet."
                onConfirm={() => handleRefund(selectedBookingDetail.booking._id)}
                okText="Yes, Cancel & Refund"
                cancelText="Keep Stay"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<RollbackOutlined />}>
                  Cancel & Refund
                </Button>
              </Popconfirm>,
            ];
          })()}
          width={640}
        >
          {(() => {
            const b = selectedBookingDetail.booking;
            const r = selectedBookingDetail.room;
            const rId = typeof b.room === "object" ? b.room?._id : b.room;
            const mPay = payments.find(
              (p) =>
                (p.room === rId || p.room?._id === rId) &&
                (p.userId === user._id || p.userId?._id === user._id)
            );
            const isSettled = b.status === "CHECKED_OUT" || mPay?.status === PaymentStatus.SEND;
            const isRef = b.status === "REFUNDED" || mPay?.status === PaymentStatus.REFUND;

            const checkIn = b.startDate ? new Date(b.startDate) : new Date();
            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + (b.duration || 1));

            return (
              <div style={{ marginTop: 12 }}>
                {r?.images?.[0] && (
                  <div style={{ height: 220, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                    <img
                      src={r.images[0]}
                      alt={r.roomName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Reservation ID">
                    <Text code>#{b._id.slice(-8).toUpperCase()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Reservation Status">
                    {isSettled ? (
                      <Tag color="purple" style={{ fontWeight: 700 }}>Stay Completed • Checked Out</Tag>
                    ) : isRef ? (
                      <Tag color="error" style={{ fontWeight: 700 }}>Cancelled & Refunded</Tag>
                    ) : (
                      <Tag color="success" style={{ fontWeight: 700 }}>Active Reservation (Confirmed)</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Room Name">
                    <Text strong>{r?.roomName || "Deluxe Suite"}</Text> (Room #{r?.roomNo || "N/A"})
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {r?.mapLocation || "Darjeeling, West Bengal"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Stay Dates">
                    {checkIn.toDateString()} ➔ {checkOut.toDateString()} ({b.duration} Night{b.duration > 1 ? "s" : ""})
                  </Descriptions.Item>
                  <Descriptions.Item label="Guest Name">
                    {user.name?.firstName || (user.name as any)?.first} {user.name?.lastName || (user.name as any)?.last}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Paid">
                    <Text strong style={{ color: "#059669", fontSize: 16 }}>
                      ₹{b.price?.toLocaleString()}
                    </Text> (Paid via Digital Wallet)
                  </Descriptions.Item>
                  <Descriptions.Item label="Cancellation Policy">
                    {isSettled ? (
                      <Text type="secondary">Stay completed; checkout already settled into Host account.</Text>
                    ) : isRef ? (
                      <Text type="secondary">Already refunded to your digital wallet.</Text>
                    ) : (
                      <Tag color="success">100% Instant Refund to Wallet Available</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Modal: Deposit Funds */}
      <Modal
        title="Deposit Funds into Digital Wallet"
        open={isAddMoneyOpen}
        onOk={handleAddMoney}
        onCancel={() => setIsAddMoneyOpen(false)}
        okText="Confirm & Deposit"
        okButtonProps={{ style: { backgroundColor: "#ff385c", borderColor: "#ff385c", fontWeight: 700 } }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 12 }}>
          <div>
            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
              Deposit Amount (₹)
            </Text>
            <InputNumber
              style={{ width: "100%" }}
              min={100}
              step={500}
              value={addAmount}
              onChange={(val) => setAddAmount(val || 0)}
              prefix="₹"
            />
          </div>

          <div>
            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
              Payment Method
            </Text>
            <Select
              style={{ width: "100%" }}
              value={addMethod}
              onChange={(val) => setAddMethod(val)}
              options={[
                { value: "UPI / GPay", label: "Instant UPI (Google Pay, PhonePe, Paytm)" },
                { value: "Credit / Debit Card", label: "Credit / Debit Card" },
                { value: "Net Banking", label: "Net Banking" },
              ]}
            />
          </div>
        </Space>
      </Modal>

      {/* Modal: Withdraw Money */}
      <Modal
        title="Withdraw Funds to Bank Account"
        open={isWithdrawOpen}
        onOk={handleWithdraw}
        onCancel={() => setIsWithdrawOpen(false)}
        okText="Submit Withdrawal"
      >
        <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 12 }}>
          <div>
            <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
              Withdrawal Amount (₹)
            </Text>
            <InputNumber
              style={{ width: "100%" }}
              min={100}
              max={user.wallet || 0}
              value={withdrawAmount}
              onChange={(val) => setWithdrawAmount(val || 0)}
              prefix="₹"
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
              Current Wallet Balance: ₹{user.wallet || 0}
            </Text>
          </div>
        </Space>
      </Modal>

      {/* Modal: Book Room */}
      {bookingRoom && (
        <Modal
          title={`Reserve ${bookingRoom.roomName}`}
          open={!!bookingRoom}
          onOk={handleConfirmBooking}
          onCancel={() => setBookingRoom(null)}
          okText="Confirm & Pay via Wallet"
          okButtonProps={{
            disabled:
              isTargetPropertyClosed ||
              (user.wallet || 0) < bookingRoom.price * bookDuration,
            style: { backgroundColor: "#ff385c", borderColor: "#ff385c", fontWeight: 700 },
          }}
        >
          <Space direction="vertical" size={14} style={{ width: "100%", marginTop: 8 }}>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <Text strong>{bookingRoom.title}</Text>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Room No: {bookingRoom.roomNo} • Rate: ₹{bookingRoom.price} / night
              </Text>
            </div>

            {isTargetPropertyClosed && (
              <Alert
                type="error"
                message="Property Bookings Closed"
                description="The host has paused bookings for this property. This room cannot currently be reserved."
                showIcon
              />
            )}

            <div>
              <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                Check-in Start Date
              </Text>
              <Input
                type="date"
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
              />
            </div>

            <div>
              <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                Stay Duration (Nights)
              </Text>
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={30}
                value={bookDuration}
                onChange={(val) => setBookDuration(val || 1)}
              />
            </div>

            <Divider style={{ margin: "10px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <Text type="secondary">Total Calculation:</Text>
              <Text strong>
                ₹{bookingRoom.price} × {bookDuration} night(s) = ₹{bookingRoom.price * bookDuration}
              </Text>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <Text type="secondary">Wallet Balance:</Text>
              <Text strong>₹{user.wallet || 0}</Text>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <Text strong>Balance After Booking:</Text>
              <Text
                strong
                style={{
                  color:
                    (user.wallet || 0) >= bookingRoom.price * bookDuration
                      ? "#059669"
                      : "#dc2626",
                }}
              >
                ₹{(user.wallet || 0) - bookingRoom.price * bookDuration}
              </Text>
            </div>

            {!isTargetPropertyClosed && (user.wallet || 0) < bookingRoom.price * bookDuration && (
              <Alert
                type="error"
                message="Insufficient balance! Please deposit money into your wallet first."
                showIcon
              />
            )}
          </Space>
        </Modal>
      )}

      {/* Drawer: Notifications */}
      <Drawer
        title="Notifications Center"
        placement="right"
        onClose={() => setIsNotificationOpen(false)}
        open={isNotificationOpen}
        extra={
          <Button
            size="small"
            type="link"
            onClick={async () => {
              await api.markAllNotificationsRead(user._id);
              setNotifications(notifications.map((n) => ({ ...n, read: true })));
              message.success("Marked all as read");
            }}
          >
            Mark all as read
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          locale={{ emptyText: "No notifications found" }}
          renderItem={(item) => (
            <List.Item style={{ opacity: item.read ? 0.6 : 1 }}>
              <List.Item.Meta
                avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: item.read ? "#94a3b8" : "#ff385c" }} />}
                title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
}