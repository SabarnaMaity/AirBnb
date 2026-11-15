"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Room, AppNotification, PaymentStatus } from "@/types";
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
  Table,
  Badge,
  Statistic,
  message,
  Divider,
  Drawer,
  List,
  Avatar,
  Spin,
  Alert,
  Empty,
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
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function UserPanel() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Modals
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  // Form states
  const [addAmount, setAddAmount] = useState<number>(1000);
  const [addMethod, setAddMethod] = useState("UPI / GPay");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [bookDuration, setBookDuration] = useState<number>(2);
  const [bookDate, setBookDate] = useState<string>("2026-12-01");

  // Fetch real data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Rooms from backend
      const roomsRes = await api.getAllRooms();
      if (roomsRes.success && Array.isArray(roomsRes.data)) {
        setRooms(roomsRes.data);
      }

      // 2. Fetch User-specific data if logged in
      if (user?._id) {
        // Refresh wallet
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
          // Filter current user's bookings
          const userBookings = bookingsRes.data.filter(
            (b: any) => b.user === user._id || b.user?._id === user._id
          );
          setBookings(userBookings);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch backend data", err);
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
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Card
          style={{
            maxWidth: 480,
            margin: "0 auto",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Space direction="vertical" size={16} align="center">
            <Avatar size={64} icon={<WalletOutlined />} style={{ background: "#ff385c" }} />
            <Title level={3} style={{ margin: 0 }}>
              User Sign-In Required
            </Title>
            <Paragraph type="secondary">
              Please sign in to your guest account to browse available rooms, manage your digital wallet, and book verified stays.
            </Paragraph>
            <Link href="/login">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                style={{ backgroundColor: "#ff385c", borderColor: "#ff385c", borderRadius: 10 }}
              >
                Go to Sign In
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
      message.error("Please enter a valid amount");
      return;
    }

    const res = await api.addWalletMoney({
      userId: user._id,
      amount: addAmount,
      method: addMethod,
      transectionDetails: `Deposited via ${addMethod} at ${new Date().toLocaleTimeString()}`,
    });

    if (res.success) {
      message.success(`Successfully added ₹${addAmount} to your wallet!`);
      await refreshUser();
      setIsAddMoneyOpen(false);
    } else {
      message.error(res.message || "Failed to add money");
    }
  };

  // Withdraw Handler
  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      message.error("Please enter a valid amount");
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

  // Confirm Room Booking
  const handleConfirmBooking = async () => {
    if (!bookingRoom) return;
    const totalPrice = bookingRoom.price * bookDuration;

    if ((user.wallet || 0) < totalPrice) {
      message.error(
        `Insufficient balance! Required: ₹${totalPrice}, Available: ₹${user.wallet || 0}`
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
      message.success(
        `Booking confirmed for ${bookingRoom.roomName}! ₹${totalPrice} debited from wallet.`
      );
      setBookingRoom(null);
      await fetchData();
    } else {
      message.error(res.message || "Booking failed");
    }
  };

  // Refund Handler
  const handleRefund = async (paymentId: string) => {
    const res = await api.refundPayment(paymentId);
    if (res.success) {
      message.success("Payment refunded to your wallet successfully!");
      await fetchData();
    } else {
      message.error(res.message || "Refund failed");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Bookings Columns
  const bookingColumns = [
    {
      title: "Booking ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id?.substring(0, 10)}...</Text>,
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
      render: (r: any) => (
        <Text strong>{typeof r === "object" ? r.roomName || r.title : r || "Room Stay"}</Text>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (d: number) => `${d} Night${d > 1 ? "s" : ""}`,
    },
    {
      title: "Total Paid",
      dataIndex: "price",
      key: "price",
      render: (val: number) => (
        <Text strong style={{ color: "#0f172a" }}>
          ₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Payment Action",
      key: "action",
      render: (_: any, record: any) => {
        const paymentId = Array.isArray(record.Payment) && record.Payment.length > 0 ? record.Payment[0] : record.payment;
        return (
          <Button
            size="small"
            danger
            icon={<RollbackOutlined />}
            onClick={() => handleRefund(paymentId || record._id)}
          >
            Refund
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Profile & Digital Wallet Card */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space orientation="horizontal" size={16} align="center">
              <Avatar
                size={54}
                style={{
                  background: "linear-gradient(135deg, #ff385c, #e11d48)",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {user.name?.firstName?.[0] || "U"}
              </Avatar>
              <div>
                <Space size={8}>
                  <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                    {user.name?.firstName} {user.name?.lastName}
                  </Title>
                  <Tag color="magenta" style={{ fontWeight: 600 }}>
                    GUEST ACCOUNT
                  </Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
                  {user.email} • ID: {user._id}
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "8px 16px",
                  borderRadius: 12,
                }}
              >
                <Statistic
                  title={
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                      DIGITAL WALLET BALANCE
                    </span>
                  }
                  value={user.wallet || 0}
                  prefix="₹"
                  valueStyle={{ color: "#059669", fontWeight: 800, fontSize: 22 }}
                />
              </div>

              <Space orientation="horizontal" size={8}>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setIsAddMoneyOpen(true)}
                  style={{
                    backgroundColor: "#ff385c",
                    borderColor: "#ff385c",
                    fontWeight: 600,
                    height: 38,
                  }}
                >
                  Deposit
                </Button>

                <Button
                  icon={<ArrowDownOutlined />}
                  onClick={() => setIsWithdrawOpen(true)}
                  style={{ fontWeight: 600, height: 38 }}
                >
                  Withdraw
                </Button>

                <Badge count={unreadCount} size="small">
                  <Button
                    icon={<BellOutlined />}
                    onClick={() => setIsNotificationOpen(true)}
                    style={{ height: 38 }}
                  />
                </Badge>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  style={{ height: 38 }}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Available Stays Catalog (Live from Backend) */}
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
              Available Stays & Rooms
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Live catalog synced with MongoDB (API: `/api/merchant/room/getall`)
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
            {rooms.length} Stays Available
          </Text>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Loading rooms from backend..." />
          </div>
        ) : rooms.length === 0 ? (
          <Card style={{ borderRadius: 16, textAlign: "center", padding: 32 }}>
            <Empty description="No rooms currently listed in MongoDB. Hosts can create rooms via Merchant Panel!" />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {rooms.map((room) => {
              const isLiked = wishlist.includes(room._id);
              const roomImg =
                room.images?.[0] ||
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

              return (
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
                          Room {room.roomNo}
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
                          {room.isAvalabile ? "Available" : "Booked"}
                        </Tag>
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
                          letterSpacing: "0.5px",
                        }}
                      >
                        {room.tag}
                      </Text>
                      <Title
                        level={5}
                        style={{ margin: "2px 0 6px", fontWeight: 700 }}
                        ellipsis
                      >
                        {room.roomName}
                      </Title>
                      <Paragraph
                        type="secondary"
                        style={{ fontSize: 12, marginBottom: 12 }}
                        ellipsis={{ rows: 2 }}
                      >
                        {room.description}
                      </Paragraph>

                      {room.services && (
                        <Space
                          orientation="horizontal"
                          size={[4, 4]}
                          wrap
                          style={{ marginBottom: 12 }}
                        >
                          {room.services.map((srv, idx) => (
                            <Tag key={idx} style={{ fontSize: 10, textTransform: "uppercase" }}>
                              {srv}
                            </Tag>
                          ))}
                        </Space>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        <EnvironmentOutlined />
                        <span>Geo: {room.mapLocation}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 12,
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Per Night
                        </Text>
                        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                          ₹{room.price}
                        </Title>
                      </div>

                      <Button
                        type="primary"
                        disabled={!room.isAvalabile}
                        onClick={() => setBookingRoom(room)}
                        style={{
                          backgroundColor: room.isAvalabile ? "#ff385c" : undefined,
                          borderColor: room.isAvalabile ? "#ff385c" : undefined,
                          fontWeight: 600,
                        }}
                      >
                        {room.isAvalabile ? "Book Now" : "Reserved"}
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* Bookings & Refund History Table */}
      <Card
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              My Bookings & Reservations
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Live reservation records from MongoDB (API: `/api/user/booking/getall`)
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
          dataSource={bookings.map((b) => ({ ...b, key: b._id }))}
          columns={bookingColumns}
          pagination={false}
          locale={{ emptyText: "No reservations found in database yet." }}
        />
      </Card>

      {/* Modal: Add Money */}
      <Modal
        title="Deposit Funds into Digital Wallet"
        open={isAddMoneyOpen}
        onOk={handleAddMoney}
        onCancel={() => setIsAddMoneyOpen(false)}
        okText="Confirm & Deposit"
        okButtonProps={{ style: { backgroundColor: "#ff385c", borderColor: "#ff385c" } }}
      >
        <Space orientation="vertical" size={16} style={{ width: "100%", marginTop: 12 }}>
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
        <Space orientation="vertical" size={16} style={{ width: "100%", marginTop: 12 }}>
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
            disabled: (user.wallet || 0) < bookingRoom.price * bookDuration,
            style: { backgroundColor: "#ff385c", borderColor: "#ff385c" },
          }}
        >
          <Space orientation="vertical" size={14} style={{ width: "100%", marginTop: 8 }}>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <Text strong>{bookingRoom.title}</Text>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Room No: {bookingRoom.roomNo} • Rate: ₹{bookingRoom.price} / night
              </Text>
            </div>

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
              <Text strong>₹{bookingRoom.price} × {bookDuration} night(s) = ₹{bookingRoom.price * bookDuration}</Text>
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

            {(user.wallet || 0) < bookingRoom.price * bookDuration && (
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
