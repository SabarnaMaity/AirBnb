"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Property,
  PROPERTYSTATUS,
  Room,
  Booking,
  User,
  USERROLE,
  Commission,
} from "@/types";
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
  Statistic,
  message,
  Popconfirm,
  Tabs,
  Avatar,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Tooltip,
  Image,
  Divider,
} from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LoginOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  AppstoreOutlined,
  PercentageOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  WalletOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AdminPanel() {
  const { user } = useAuth();

  // 1. Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // 2. Search & Filter states
  const [activeTab, setActiveTab] = useState<string>("hotels");
  const [hotelSearch, setHotelSearch] = useState<string>("");
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const [roomSearch, setRoomSearch] = useState<string>("");
  const [roomPropertyFilter, setRoomPropertyFilter] = useState<string>("all");
  const [bookingSearch, setBookingSearch] = useState<string>("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  // 3. Modal states & forms (must be called unconditionally)
  const [walletModalVisible, setWalletModalVisible] = useState<boolean>(false);
  const [selectedUserForWallet, setSelectedUserForWallet] = useState<User | null>(null);
  const [walletForm] = Form.useForm();

  const [roleModalVisible, setRoleModalVisible] = useState<boolean>(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [roleForm] = Form.useForm();

  const [bookingDetailModal, setBookingDetailModal] = useState<Booking | null>(null);

  // 4. Fetch all admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.getAllUsers();
      if (usersRes.success && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      }

      const propsRes = await api.getAllProperties();
      if (propsRes.success && Array.isArray(propsRes.data)) {
        setProperties(propsRes.data);
      }

      const roomsRes = await api.getAllRooms();
      if (roomsRes.success && Array.isArray(roomsRes.data)) {
        setRooms(roomsRes.data);
      }

      const bookRes = await api.getAllBookings();
      if (bookRes.success && Array.isArray(bookRes.data)) {
        setBookings(bookRes.data);
      }

      const commRes = await api.getAllCommissions();
      if (commRes.success && Array.isArray(commRes.data)) {
        setCommissions(commRes.data);
      }

      const withRes = await api.getAllWithdraws();
      if (withRes.success && Array.isArray(withRes.data)) {
        setWithdrawals(withRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load admin data", err);
      message.error("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  // 5. Filtered Data (All useMemo called unconditionally at top level)
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        p.address?.city?.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        p.address?.state?.toLowerCase().includes(hotelSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (hotelFilter === "verified") return p.verification === true;
      if (hotelFilter === "pending") return p.verification === false;
      if (hotelFilter === "open") return p.status === PROPERTYSTATUS.OPEN;
      if (hotelFilter === "close") return p.status === PROPERTYSTATUS.CLOSE;
      return true;
    });
  }, [properties, hotelSearch, hotelFilter]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch =
        r.roomName?.toLowerCase().includes(roomSearch.toLowerCase()) ||
        r.roomNo?.toLowerCase().includes(roomSearch.toLowerCase()) ||
        r.title?.toLowerCase().includes(roomSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (roomPropertyFilter !== "all") {
        const propId = typeof r.property === "object" ? (r.property as any)?._id : r.property;
        if (propId !== roomPropertyFilter) return false;
      }
      return true;
    });
  }, [rooms, roomSearch, roomPropertyFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const userName =
        typeof b.user === "object"
          ? `${b.user?.name?.firstName || ""} ${b.user?.name?.lastName || ""}`
          : "";
      const userEmail = typeof b.user === "object" ? b.user?.email || "" : "";
      const roomName = typeof b.room === "object" ? b.room?.roomName || "" : "";

      const matchesSearch =
        b._id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        userEmail.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        roomName.toLowerCase().includes(bookingSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (bookingStatusFilter !== "all") {
        if ((b.status || "CONFIRMED").toUpperCase() !== bookingStatusFilter.toUpperCase()) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.name?.firstName || ""} ${u.name?.lastName || ""}`;
      const matchesSearch =
        fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.contactInfo?.phone?.includes(userSearch);
      if (!matchesSearch) return false;

      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      return true;
    });
  }, [users, userSearch, userRoleFilter]);

  // 6. Aggregate Key Metrics
  const totalRegisteredHotels = properties.length;
  const verifiedHotelsCount = properties.filter((p) => p.verification).length;
  const pendingHotelsCount = properties.filter((p) => !p.verification).length;

  const totalBookingsCount = bookings.length;
  const totalBookingAmount = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const totalCommissionEarned = commissions.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );

  const totalRoomsCount = rooms.length;
  const availableRoomsCount = rooms.filter((r) => r.isAvalabile).length;
  const occupiedRoomsCount = rooms.filter((r) => !r.isAvalabile).length;

  const totalUsersCount = users.length;
  const guestsCount = users.filter((u) => u.role === USERROLE.USER).length;
  const hostsCount = users.filter((u) => u.role === USERROLE.MERCHANT).length;

  // 7. Action Handlers
  const togglePropertyVerification = async (propId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const res = await api.updateProperty(propId, { verification: nextStatus });
    if (res.success) {
      setProperties((prev) =>
        prev.map((p) => (p._id === propId ? { ...p, verification: nextStatus } : p))
      );
      message.success(
        nextStatus
          ? "Property successfully verified & approved!"
          : "Property verification revoked."
      );
    } else {
      message.error(res.message || "Failed to update verification status");
    }
  };

  const togglePropertyStatus = async (propId: string, currentStatus: PROPERTYSTATUS | string) => {
    const nextStatus =
      currentStatus === PROPERTYSTATUS.OPEN ? PROPERTYSTATUS.CLOSE : PROPERTYSTATUS.OPEN;
    const res = await api.updateProperty(propId, { status: nextStatus });
    if (res.success) {
      setProperties((prev) =>
        prev.map((p) => (p._id === propId ? { ...p, status: nextStatus } : p))
      );
      message.success(`Property status set to ${nextStatus.toUpperCase()}`);
    } else {
      message.error(res.message || "Failed to update property status");
    }
  };

  const handleDeleteProperty = async (propId: string) => {
    const res = await api.deleteProperty(propId);
    if (res.success) {
      setProperties((prev) => prev.filter((p) => p._id !== propId));
      message.success("Property removed from MongoDB");
    } else {
      message.error(res.message || "Failed to delete property");
    }
  };

  const toggleRoomAvailability = async (roomId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const res = await api.updateRoom(roomId, { isAvalabile: nextStatus });
    if (res.success) {
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, isAvalabile: nextStatus } : r))
      );
      message.success(`Room marked as ${nextStatus ? "Available" : "Occupied"}`);
    } else {
      message.error(res.message || "Failed to update room availability");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const res = await api.deleteRoom(roomId);
    if (res.success) {
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      message.success("Room successfully removed");
    } else {
      message.error(res.message || "Failed to delete room");
    }
  };

  const handleRefundBooking = async (bookingId: string) => {
    const res = await api.refundPayment(bookingId);
    if (res.success) {
      message.success(res.message || "Booking refunded to user wallet successfully!");
      fetchData();
    } else {
      message.error(res.message || "Refund failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await api.deleteUser(userId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      message.success("User account removed from database.");
    } else {
      message.error(res.message || "Failed to remove user");
    }
  };

  const handleUpdateWallet = async (values: { wallet: number }) => {
    if (!selectedUserForWallet) return;
    const res = await api.updateUser(selectedUserForWallet._id, { wallet: values.wallet });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUserForWallet._id ? { ...u, wallet: values.wallet } : u
        )
      );
      message.success("User wallet updated successfully!");
      setWalletModalVisible(false);
      setSelectedUserForWallet(null);
    } else {
      message.error(res.message || "Failed to update wallet");
    }
  };

  const handleUpdateRole = async (values: { role: USERROLE }) => {
    if (!selectedUserForRole) return;
    const res = await api.updateUser(selectedUserForRole._id, { role: values.role });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUserForRole._id ? { ...u, role: values.role } : u
        )
      );
      message.success("User role updated successfully!");
      setRoleModalVisible(false);
      setSelectedUserForRole(null);
    } else {
      message.error(res.message || "Failed to update role");
    }
  };

  // 8. Auth gate (SAFE: placed AFTER all Hooks have executed)
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Card style={{ maxWidth: 480, margin: "0 auto", borderRadius: 16 }}>
          <Space orientation="vertical" size={16} align="center">
            <Avatar size={64} icon={<SafetyCertificateOutlined />} style={{ background: "#d97706" }} />
            <Title level={3} style={{ margin: 0 }}>
              Administrator Sign-In Required
            </Title>
            <Paragraph type="secondary">
              Please sign in with your Administrator credentials to review merchant property verifications, inspect all hotel rooms, audit bookings, and manage platform users.
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

  // 9. Table Columns
  const propertyColumns = [
    {
      title: "Hotel / Property",
      key: "name",
      render: (_: any, r: Property) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>
            {r.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            📍 {r.address?.city || "Unknown City"}, {r.address?.state || "State"} ({r.address?.country || "India"})
          </Text>
        </Space>
      ),
    },
    {
      title: "Host / Owner",
      key: "owner",
      render: (_: any, r: Property) => {
        if (typeof r.owner === "object" && r.owner !== null) {
          const owner = r.owner as User;
          return (
            <Space orientation="vertical" size={2}>
              <Text strong style={{ fontSize: 13 }}>
                {owner.name?.firstName} {owner.name?.lastName}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {owner.email}
              </Text>
            </Space>
          );
        }
        return (
          <Text code style={{ fontSize: 11 }}>
            {typeof r.owner === "string" ? r.owner.substring(0, 10) + "..." : "Unknown"}
          </Text>
        );
      },
    },
    {
      title: "Rooms",
      key: "rooms",
      render: (_: any, r: Property) => {
        const count = Array.isArray(r.rooms) ? r.rooms.length : 0;
        return (
          <Tag color="cyan" icon={<AppstoreOutlined />}>
            {count} Rooms
          </Tag>
        );
      },
    },
    {
      title: "Wallet",
      dataIndex: "wallet",
      key: "wallet",
      render: (val: number) => (
        <Text strong style={{ color: "#059669", fontSize: 13 }}>
          ₹{(val || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PROPERTYSTATUS, r: Property) => (
        <Button
          size="small"
          onClick={() => togglePropertyStatus(r._id, status)}
          style={{
            borderColor: status === PROPERTYSTATUS.OPEN ? "#10b981" : "#ef4444",
            color: status === PROPERTYSTATUS.OPEN ? "#059669" : "#dc2626",
            background: status === PROPERTYSTATUS.OPEN ? "#ecfdf5" : "#fef2f2",
            fontWeight: 600,
          }}
        >
          {status === PROPERTYSTATUS.OPEN ? "OPEN" : "CLOSED"}
        </Button>
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
      title: "Actions",
      key: "actions",
      render: (_: any, r: Property) => (
        <Space size={8}>
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
            {r.verification ? "Revoke" : "Verify & Approve"}
          </Button>

          <Button
            size="small"
            icon={<AppstoreOutlined />}
            onClick={() => {
              setRoomPropertyFilter(r._id);
              setActiveTab("rooms");
            }}
          >
            Rooms
          </Button>

          <Popconfirm
            title="Delete Property"
            description="Are you sure you want to delete this property and unlink its rooms?"
            onConfirm={() => handleDeleteProperty(r._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roomColumns = [
    {
      title: "Room Image",
      key: "image",
      width: 80,
      render: (_: any, r: Room) => (
        <Image
          width={60}
          height={45}
          src={
            r.images && r.images[0]
              ? r.images[0]
              : "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80"
          }
          alt={r.roomName}
          style={{ objectFit: "cover", borderRadius: 6 }}
          fallback="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80"
        />
      ),
    },
    {
      title: "Room Name & No",
      key: "roomName",
      render: (_: any, r: Room) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ fontSize: 13 }}>
            {r.roomName}
          </Text>
          <Space orientation="horizontal" size={6}>
            <Tag color="geekblue">Room #{r.roomNo || "N/A"}</Tag>
            <Tag color="default" style={{ fontSize: 11 }}>
              {r.tag || "Standard"}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: "Hotel / Property",
      key: "property",
      render: (_: any, r: Room) => {
        if (typeof r.property === "object" && r.property !== null) {
          const prop = r.property as Property;
          return (
            <Space orientation="vertical" size={2}>
              <Text strong style={{ fontSize: 12 }}>
                {prop.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                📍 {prop.address?.city || "Unknown City"}
              </Text>
            </Space>
          );
        }
        return <Text code style={{ fontSize: 11 }}>{String(r.property).substring(0, 10)}...</Text>;
      },
    },
    {
      title: "Price / Night",
      dataIndex: "price",
      key: "price",
      render: (val: number) => (
        <Text strong style={{ color: "#d97706", fontSize: 14 }}>
          ₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Amenities",
      key: "services",
      render: (_: any, r: Room) => (
        <Space size={[4, 4]} wrap style={{ maxWidth: 200 }}>
          {r.services && r.services.length > 0 ? (
            r.services.slice(0, 3).map((s, idx) => (
              <Tag key={idx} color="blue" style={{ fontSize: 10, margin: 0 }}>
                {s.toUpperCase()}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: 11 }}>Standard</Text>
          )}
          {r.services && r.services.length > 3 && (
            <Tag style={{ fontSize: 10, margin: 0 }}>+{r.services.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Availability",
      dataIndex: "isAvalabile",
      key: "isAvalabile",
      render: (avail: boolean, r: Room) => (
        <Button
          size="small"
          onClick={() => toggleRoomAvailability(r._id, avail)}
          style={{
            borderColor: avail ? "#10b981" : "#f97316",
            color: avail ? "#059669" : "#c2410c",
            background: avail ? "#ecfdf5" : "#fff7ed",
            fontWeight: 600,
          }}
        >
          {avail ? "Available" : "Occupied"}
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, r: Room) => (
        <Popconfirm
          title="Delete Room"
          description="Are you sure you want to delete this room from MongoDB?"
          onConfirm={() => handleDeleteRoom(r._id)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" type="text" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const bookingColumns = [
    {
      title: "Booking ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string, r: Booking) => (
        <Space orientation="vertical" size={2}>
          <Text code style={{ fontSize: 12 }}>
            {id?.substring(0, 10)}...
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Guest Details",
      key: "user",
      render: (_: any, b: Booking) => {
        if (typeof b.user === "object" && b.user !== null) {
          const guest = b.user as User;
          return (
            <Space orientation="vertical" size={2}>
              <Text strong style={{ fontSize: 13 }}>
                {guest.name?.firstName} {guest.name?.lastName}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {guest.email}
              </Text>
            </Space>
          );
        }
        return <Text code style={{ fontSize: 11 }}>{String(b.user).substring(0, 10)}...</Text>;
      },
    },
    {
      title: "Hotel & Room",
      key: "room",
      render: (_: any, b: Booking) => {
        if (typeof b.room === "object" && b.room !== null) {
          const r = b.room as Room;
          const propName =
            typeof r.property === "object" && r.property !== null
              ? (r.property as Property).name
              : "Hotel Stay";
          return (
            <Space orientation="vertical" size={2}>
              <Text strong style={{ fontSize: 12 }}>
                {propName}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {r.roomName} (Room #{r.roomNo || ""})
              </Text>
            </Space>
          );
        }
        return <Text code style={{ fontSize: 11 }}>{String(b.room).substring(0, 10)}...</Text>;
      },
    },
    {
      title: "Dates & Duration",
      key: "dates",
      render: (_: any, b: Booking) => (
        <Space orientation="vertical" size={2}>
          <Text style={{ fontSize: 12 }}>
            📅 {b.startDate ? new Date(b.startDate).toLocaleDateString() : "N/A"} -{" "}
            {b.endDate ? new Date(b.endDate).toLocaleDateString() : "N/A"}
          </Text>
          <Tag color="purple" style={{ fontSize: 10, width: "fit-content" }}>
            {b.duration || 1} Nights
          </Tag>
        </Space>
      ),
    },
    {
      title: "Total Paid",
      dataIndex: "price",
      key: "price",
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
      render: (st: string) => {
        const s = (st || "CONFIRMED").toUpperCase();
        let color = "processing";
        if (s === "CONFIRMED") color = "success";
        else if (s === "CHECKED_OUT") color = "purple";
        else if (s === "REFUNDED" || s === "CANCELLED") color = "error";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, b: Booking) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setBookingDetailModal(b)}
          >
            Details
          </Button>
          {(b.status || "CONFIRMED").toUpperCase() === "CONFIRMED" && (
            <Popconfirm
              title="Process Refund"
              description="Are you sure you want to refund this booking back to the user's wallet?"
              onConfirm={() => handleRefundBooking(b._id)}
              okText="Yes, Refund"
              cancelText="Cancel"
            >
              <Button size="small" danger>
                Refund
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const commissionColumns = [
    {
      title: "Commission ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => (
        <Text code style={{ fontSize: 11 }}>
          {id?.substring(0, 10)}...
        </Text>
      ),
    },
    {
      title: "Guest / Payer",
      key: "user",
      render: (_: any, c: Commission) => {
        if (typeof c.user === "object" && c.user !== null) {
          const u = c.user as User;
          return <Text strong>{u.name?.firstName} {u.name?.lastName}</Text>;
        }
        return <Text code style={{ fontSize: 11 }}>{String(c.user).substring(0, 10)}...</Text>;
      },
    },
    {
      title: "Hotel / Property",
      key: "property",
      render: (_: any, c: Commission) => {
        if (typeof c.property === "object" && c.property !== null) {
          const p = c.property as Property;
          return <Text strong>{p.name}</Text>;
        }
        return <Text code style={{ fontSize: 11 }}>{String(c.property).substring(0, 10)}...</Text>;
      },
    },
    {
      title: "Type",
      dataIndex: "commission",
      key: "commission",
      render: (t: string) => <Tag color="gold">{t || "RENT"}</Tag>,
    },
    {
      title: "Platform Revenue (15%)",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => (
        <Text strong style={{ color: "#059669", fontSize: 14 }}>
          +₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Recorded At",
      key: "createdAt",
      render: (_: any, c: any) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Live Ledger"}
        </Text>
      ),
    },
  ];

  const withdrawalColumns = [
    {
      title: "Withdrawal ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => (
        <Text code style={{ fontSize: 11 }}>
          {id?.substring(0, 10)}...
        </Text>
      ),
    },
    {
      title: "Host Account",
      dataIndex: "user",
      key: "user",
      render: (u: any) => (
        <Text strong>
          {typeof u === "object" && u !== null
            ? `${u?.name?.firstName || ""} ${u?.name?.lastName || ""} (${u?.email || ""})`
            : String(u)}
        </Text>
      ),
    },
    {
      title: "Amount Paid Out",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => (
        <Text strong style={{ color: "#dc2626", fontSize: 14 }}>
          -₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="success">PROCESSED</Tag>,
    },
    {
      title: "Date",
      key: "date",
      render: (_: any, w: any) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "Recent"}
        </Text>
      ),
    },
  ];

  const userColumns = [
    {
      title: "User Profile",
      key: "name",
      render: (_: any, u: User) => (
        <Space size={10} align="center">
          <Avatar
            style={{
              backgroundColor:
                u.role === USERROLE.ADMIN
                  ? "#d97706"
                  : u.role === USERROLE.MERCHANT
                  ? "#2563eb"
                  : "#10b981",
              fontWeight: 700,
            }}
          >
            {u.name?.firstName?.[0] || "U"}
          </Avatar>
          <div>
            <Text strong style={{ display: "block", fontSize: 13 }}>
              {u.name?.firstName} {u.name?.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {u.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: any, u: User) => (
        <Space orientation="vertical" size={2}>
          <Text style={{ fontSize: 12 }}>{u.contactInfo?.phone || "No phone registered"}</Text>
          {u.address?.city && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              📍 {u.address.city}, {u.address.state || ""}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: USERROLE) => {
        let color = "default";
        if (role === USERROLE.ADMIN) color = "gold";
        else if (role === USERROLE.MERCHANT) color = "blue";
        else color = "green";
        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {role?.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Wallet Balance",
      dataIndex: "wallet",
      key: "wallet",
      render: (val: number) => (
        <Text strong style={{ color: "#0f172a", fontSize: 14 }}>
          ₹{(val || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, u: User) => (
        <Space size={8}>
          <Tooltip title="Adjust Wallet Balance">
            <Button
              size="small"
              icon={<WalletOutlined />}
              onClick={() => {
                setSelectedUserForWallet(u);
                walletForm.setFieldsValue({ wallet: u.wallet || 0 });
                setWalletModalVisible(true);
              }}
            >
              Wallet
            </Button>
          </Tooltip>

          <Tooltip title="Change User Role">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUserForRole(u);
                roleForm.setFieldsValue({ role: u.role });
                setRoleModalVisible(true);
              }}
            >
              Role
            </Button>
          </Tooltip>

          {u.role !== USERROLE.ADMIN && (
            <Popconfirm
              title="Remove User Account"
              description="Are you sure you want to remove this user from MongoDB?"
              onConfirm={() => handleDeleteUser(u._id)}
              okText="Yes, Remove"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" type="text" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Top Banner */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
        }}
        styles={{ body: { padding: "24px 28px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space orientation="horizontal" size={18} align="center">
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #d97706, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 28,
                  boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
                }}
              >
                <SafetyCertificateOutlined />
              </div>
              <div>
                <Space size={10} align="center">
                  <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.5px" }}>
                    System Super Administrator Center
                  </Title>
                  <Tag color="gold" style={{ fontWeight: 700, padding: "2px 8px" }}>
                    ROLE: ADMIN
                  </Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 13, display: "block", marginTop: 4 }}>
                  Admin: <Text strong>{user.name?.firstName} {user.name?.lastName}</Text> ({user.email}) • Real-time MongoDB synchronization
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space size={12}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={fetchData}
                style={{
                  backgroundColor: "#d97706",
                  borderColor: "#d97706",
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Refresh Data
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 6 Key Metric Cards */}
      <Row gutter={[16, 16]}>
        {/* Total Register Hotels */}
        <Col xs={24} sm={12} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveTab("hotels")}
            style={{
              borderRadius: 16,
              border: activeTab === "hotels" ? "2px solid #2563eb" : "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 18 } }}
          >
            <Statistic
              title={
                <Space size={4}>
                  <ShopOutlined style={{ color: "#2563eb" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    REGISTERED HOTELS
                  </span>
                </Space>
              }
              value={totalRegisteredHotels}
              valueStyle={{ color: "#2563eb", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
              Verified: <Text strong style={{ color: "#059669" }}>{verifiedHotelsCount}</Text> • Pending: <Text strong style={{ color: "#d97706" }}>{pendingHotelsCount}</Text>
            </Text>
          </Card>
        </Col>

        {/* Total Bookings */}
        <Col xs={24} sm={12} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveTab("bookings")}
            style={{
              borderRadius: 16,
              border: activeTab === "bookings" ? "2px solid #7c3aed" : "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 18 } }}
          >
            <Statistic
              title={
                <Space size={4}>
                  <CalendarOutlined style={{ color: "#7c3aed" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    TOTAL BOOKINGS
                  </span>
                </Space>
              }
              value={totalBookingsCount}
              valueStyle={{ color: "#7c3aed", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
              Active & Completed Stays
            </Text>
          </Card>
        </Col>

        {/* Total Booking Amount */}
        <Col xs={24} sm={12} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveTab("bookings")}
            style={{
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 18 } }}
          >
            <Statistic
              title={
                <Space size={4}>
                  <DollarOutlined style={{ color: "#059669" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    GROSS REVENUE
                  </span>
                </Space>
              }
              value={totalBookingAmount}
              prefix="₹"
              valueStyle={{ color: "#059669", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
              Total Booking Value
            </Text>
          </Card>
        </Col>

        {/* Commission Revenue (15%) */}
        <Col xs={24} sm={12} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveTab("commissions")}
            style={{
              borderRadius: 16,
              border: activeTab === "commissions" ? "2px solid #d97706" : "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 18 } }}
          >
            <Statistic
              title={
                <Space size={4}>
                  <PercentageOutlined style={{ color: "#d97706" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    COMMISSION EARNED
                  </span>
                </Space>
              }
              value={totalCommissionEarned}
              prefix="₹"
              valueStyle={{ color: "#d97706", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
              15% Cut Retained
            </Text>
          </Card>
        </Col>

        {/* Total Rooms */}
        <Col xs={24} sm={12} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveTab("rooms")}
            style={{
              borderRadius: 16,
              border: activeTab === "rooms" ? "2px solid #e11d48" : "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 18 } }}
          >
            <Statistic
              title={
                <Space size={4}>
                  <AppstoreOutlined style={{ color: "#e11d48" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    LIST OF ROOMS
                  </span>
                </Space>
              }
              value={totalRoomsCount}
              valueStyle={{ color: "#e11d48", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
              Avail: <Text strong style={{ color: "#059669" }}>{availableRoomsCount}</Text> • Occ: <Text strong style={{ color: "#e11d48" }}>{occupiedRoomsCount}</Text>
            </Text>
          </Card>
        </Col>

        {/* Total Users */}
        <Col xs={24} sm={12} lg={4}>
          <Card
            hoverable
            onClick={() => setActiveTab("users")}
            style={{
              borderRadius: 16,
              border: activeTab === "users" ? "2px solid #0284c7" : "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            styles={{ body: { padding: 18 } }}
          >
            <Statistic
              title={
                <Space size={4}>
                  <TeamOutlined style={{ color: "#0284c7" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                    PLATFORM USERS
                  </span>
                </Space>
              }
              value={totalUsersCount}
              valueStyle={{ color: "#0284c7", fontWeight: 800, fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
              Guests: {guestsCount} • Hosts: {hostsCount}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Panel */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e2e8f0",
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          size="large"
          items={[
            // TAB 1: REGISTERED HOTELS / PROPERTIES
            {
              key: "hotels",
              label: (
                <Space size={6}>
                  <ShopOutlined />
                  <span>Registered Hotels ({properties.length})</span>
                </Space>
              ),
              children: (
                <div style={{ marginTop: 12 }}>
                  <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} md={12}>
                      <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        Merchant Hotels & Property Listings
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Approve or revoke verification badges and audit hotel status across the platform
                      </Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                      <Space size={10} wrap>
                        <Input
                          placeholder="Search hotel name or city..."
                          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                          value={hotelSearch}
                          onChange={(e) => setHotelSearch(e.target.value)}
                          style={{ width: 220, borderRadius: 8 }}
                          allowClear
                        />
                        <Select
                          value={hotelFilter}
                          onChange={(v) => setHotelFilter(v)}
                          style={{ width: 140 }}
                        >
                          <Option value="all">All Hotels</Option>
                          <Option value="verified">Verified Only</Option>
                          <Option value="pending">Pending Review</Option>
                          <Option value="open">Open Stays</Option>
                          <Option value="close">Closed Stays</Option>
                        </Select>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    dataSource={filteredProperties.map((p) => ({ ...p, key: p._id }))}
                    columns={propertyColumns}
                    loading={loading}
                    pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} hotels` }}
                    locale={{ emptyText: "No registered hotels match your query." }}
                  />
                </div>
              ),
            },

            // TAB 2: TOTAL BOOKINGS & TOTAL AMOUNT
            {
              key: "bookings",
              label: (
                <Space size={6}>
                  <CalendarOutlined />
                  <span>Bookings & Revenue ({bookings.length})</span>
                </Space>
              ),
              children: (
                <div style={{ marginTop: 12 }}>
                  <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} md={12}>
                      <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        Platform Bookings & Gross Revenue
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Real-time audit of all guest reservations, check-ins, check-outs, and refunds
                      </Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                      <Space size={10} wrap>
                        <Input
                          placeholder="Search guest, hotel, or booking ID..."
                          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                          value={bookingSearch}
                          onChange={(e) => setBookingSearch(e.target.value)}
                          style={{ width: 240, borderRadius: 8 }}
                          allowClear
                        />
                        <Select
                          value={bookingStatusFilter}
                          onChange={(v) => setBookingStatusFilter(v)}
                          style={{ width: 150 }}
                        >
                          <Option value="all">All Statuses</Option>
                          <Option value="CONFIRMED">Confirmed</Option>
                          <Option value="CHECKED_OUT">Checked Out</Option>
                          <Option value="REFUNDED">Refunded</Option>
                        </Select>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    dataSource={filteredBookings.map((b) => ({ ...b, key: b._id }))}
                    columns={bookingColumns}
                    loading={loading}
                    pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} bookings` }}
                    locale={{ emptyText: "No bookings found in database." }}
                  />
                </div>
              ),
            },

            // TAB 3: COMMISSION & PAYOUTS
            {
              key: "commissions",
              label: (
                <Space size={6}>
                  <PercentageOutlined />
                  <span>Commission & Withdrawals</span>
                </Space>
              ),
              children: (
                <div style={{ marginTop: 12 }}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={14}>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                          Platform 15% Commission Cut Ledger
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Retained 15% service cut from checkout transactions (`CommissionModel`)
                        </Text>
                      </div>
                      <Table
                        dataSource={commissions.map((c) => ({ ...c, key: c._id }))}
                        columns={commissionColumns}
                        loading={loading}
                        pagination={{ pageSize: 6 }}
                        locale={{ emptyText: "No commission records recorded yet." }}
                      />
                    </Col>

                    <Col xs={24} lg={10}>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                          Host Bank Withdrawals & Payouts
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Audit host payout transactions processed (`WithdawModel`)
                        </Text>
                      </div>
                      <Table
                        dataSource={withdrawals.map((w) => ({ ...w, key: w._id }))}
                        columns={withdrawalColumns}
                        loading={loading}
                        pagination={{ pageSize: 6 }}
                        locale={{ emptyText: "No withdrawal records found." }}
                      />
                    </Col>
                  </Row>
                </div>
              ),
            },

            // TAB 4: LIST OF ROOMS
            {
              key: "rooms",
              label: (
                <Space size={6}>
                  <AppstoreOutlined />
                  <span>List of Rooms ({rooms.length})</span>
                </Space>
              ),
              children: (
                <div style={{ marginTop: 12 }}>
                  <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} md={12}>
                      <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        All Hotel Rooms & Suites Directory
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Audit all rooms across properties, pricing, availability toggles, and images
                      </Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                      <Space size={10} wrap>
                        <Input
                          placeholder="Search room name or number..."
                          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                          value={roomSearch}
                          onChange={(e) => setRoomSearch(e.target.value)}
                          style={{ width: 220, borderRadius: 8 }}
                          allowClear
                        />
                        <Select
                          value={roomPropertyFilter}
                          onChange={(v) => setRoomPropertyFilter(v)}
                          style={{ width: 200 }}
                        >
                          <Option value="all">All Hotels & Properties</Option>
                          {properties.map((p) => (
                            <Option key={p._id} value={p._id}>
                              {p.name}
                            </Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    dataSource={filteredRooms.map((r) => ({ ...r, key: r._id }))}
                    columns={roomColumns}
                    loading={loading}
                    pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} rooms` }}
                    locale={{ emptyText: "No rooms found matching your filter." }}
                  />
                </div>
              ),
            },

            // TAB 5: USER MANAGEMENT
            {
              key: "users",
              label: (
                <Space size={6}>
                  <TeamOutlined />
                  <span>Users & Roles ({users.length})</span>
                </Space>
              ),
              children: (
                <div style={{ marginTop: 12 }}>
                  <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={24} md={12}>
                      <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        Platform Accounts, Roles & Digital Wallets
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Inspect guest, host, and admin accounts, adjust digital wallets, and update roles
                      </Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                      <Space size={10} wrap>
                        <Input
                          placeholder="Search user name, email, or phone..."
                          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          style={{ width: 240, borderRadius: 8 }}
                          allowClear
                        />
                        <Select
                          value={userRoleFilter}
                          onChange={(v) => setUserRoleFilter(v)}
                          style={{ width: 140 }}
                        >
                          <Option value="all">All Roles</Option>
                          <Option value={USERROLE.USER}>Guests Only</Option>
                          <Option value={USERROLE.MERCHANT}>Hosts Only</Option>
                          <Option value={USERROLE.ADMIN}>Admins Only</Option>
                        </Select>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    dataSource={filteredUsers.map((u) => ({ ...u, key: u._id }))}
                    columns={userColumns}
                    loading={loading}
                    pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} users` }}
                    locale={{ emptyText: "No users found matching your search." }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* MODAL 1: Adjust User Wallet Balance */}
      <Modal
        title={
          <Space>
            <WalletOutlined style={{ color: "#d97706" }} />
            <span>
              Adjust Wallet Balance: {selectedUserForWallet?.name?.firstName}{" "}
              {selectedUserForWallet?.name?.lastName}
            </span>
          </Space>
        }
        open={walletModalVisible}
        onCancel={() => {
          setWalletModalVisible(false);
          setSelectedUserForWallet(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={walletForm} layout="vertical" onFinish={handleUpdateWallet}>
          <Paragraph type="secondary">
            Set a new digital wallet balance (in ₹) for this user account. This balance can be used directly to book stays.
          </Paragraph>
          <Form.Item
            name="wallet"
            label="Wallet Balance (₹)"
            rules={[{ required: true, message: "Please input wallet amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              prefix="₹"
              min={0}
              placeholder="Enter new wallet amount"
            />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setWalletModalVisible(false);
                  setSelectedUserForWallet(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}
              >
                Save Wallet Balance
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* MODAL 2: Change User Role */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: "#2563eb" }} />
            <span>
              Change Account Role: {selectedUserForRole?.name?.firstName}{" "}
              {selectedUserForRole?.name?.lastName}
            </span>
          </Space>
        }
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false);
          setSelectedUserForRole(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" onFinish={handleUpdateRole}>
          <Paragraph type="secondary">
            Select the new role for this user account:
            <br />
            • <b>User / Guest</b>: Explore and book hotel rooms
            <br />
            • <b>Merchant / Host</b>: List properties and manage room inventory
            <br />
            • <b>Admin</b>: Super Administrator privileges
          </Paragraph>
          <Form.Item
            name="role"
            label="Account Role"
            rules={[{ required: true, message: "Please select an account role" }]}
          >
            <Select style={{ width: "100%" }}>
              <Option value={USERROLE.USER}>USER (Guest)</Option>
              <Option value={USERROLE.MERCHANT}>MERCHANT (Host)</Option>
              <Option value={USERROLE.ADMIN}>ADMIN (Super Admin)</Option>
            </Select>
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setRoleModalVisible(false);
                  setSelectedUserForRole(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save New Role
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* MODAL 3: Booking Details Inspection */}
      <Modal
        title={
          <Space>
            <CalendarOutlined style={{ color: "#7c3aed" }} />
            <span>Reservation Audit: {bookingDetailModal?._id}</span>
          </Space>
        }
        open={!!bookingDetailModal}
        onCancel={() => setBookingDetailModal(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setBookingDetailModal(null)}>
            Close
          </Button>,
        ]}
      >
        {bookingDetailModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Booking Status</Text>
              <div>
                <Tag
                  color={
                    (bookingDetailModal.status || "CONFIRMED").toUpperCase() === "CONFIRMED"
                      ? "success"
                      : (bookingDetailModal.status || "CONFIRMED").toUpperCase() === "CHECKED_OUT"
                      ? "purple"
                      : "error"
                  }
                  style={{ fontSize: 14, padding: "3px 10px", marginTop: 4 }}
                >
                  {(bookingDetailModal.status || "CONFIRMED").toUpperCase()}
                </Tag>
              </div>
            </div>

            <Divider style={{ margin: "4px 0" }} />

            <div>
              <Text strong style={{ fontSize: 14 }}>Guest Information</Text>
              {typeof bookingDetailModal.user === "object" && bookingDetailModal.user !== null ? (
                <div style={{ marginTop: 6 }}>
                  <div>Name: {(bookingDetailModal.user as User).name?.firstName} {(bookingDetailModal.user as User).name?.lastName}</div>
                  <div>Email: {(bookingDetailModal.user as User).email}</div>
                  <div>Phone: {(bookingDetailModal.user as User).contactInfo?.phone || "N/A"}</div>
                </div>
              ) : (
                <div style={{ marginTop: 6 }}>User ID: {String(bookingDetailModal.user)}</div>
              )}
            </div>

            <Divider style={{ margin: "4px 0" }} />

            <div>
              <Text strong style={{ fontSize: 14 }}>Room & Hotel Details</Text>
              {typeof bookingDetailModal.room === "object" && bookingDetailModal.room !== null ? (
                <div style={{ marginTop: 6 }}>
                  <div>Room Name: {(bookingDetailModal.room as Room).roomName}</div>
                  <div>Room Number: {(bookingDetailModal.room as Room).roomNo || "N/A"}</div>
                  <div>Rate: ₹{(bookingDetailModal.room as Room).price} / night</div>
                </div>
              ) : (
                <div style={{ marginTop: 6 }}>Room ID: {String(bookingDetailModal.room)}</div>
              )}
            </div>

            <Divider style={{ margin: "4px 0" }} />

            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Duration</Text>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{bookingDetailModal.duration} Nights</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Total Amount Paid</Text>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#059669" }}>
                  ₹{bookingDetailModal.price?.toLocaleString()}
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Check-in</Text>
                <div style={{ fontWeight: 600 }}>
                  {bookingDetailModal.startDate ? new Date(bookingDetailModal.startDate).toLocaleDateString() : "N/A"}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Check-out</Text>
                <div style={{ fontWeight: 600 }}>
                  {bookingDetailModal.endDate ? new Date(bookingDetailModal.endDate).toLocaleDateString() : "N/A"}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
