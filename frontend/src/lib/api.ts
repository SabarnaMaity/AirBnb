const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const result = await res.json();
    let resData = result.data;
    if (resData === undefined) {
      if (Array.isArray(result.message)) {
        resData = result.message;
      } else if (result.success !== undefined && result.message) {
        resData = result.message;
      } else {
        resData = result;
      }
    }

    return {
      success: res.ok,
      data: resData,
      message: typeof result.message === "string" ? result.message : (res.ok ? "Success" : "Error"),
    };
  } catch (error: any) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    return {
      success: false,
      message: error.message || "Failed to connect to backend server.",
    };
  }
}

export const api = {
  // Auth APIs
  login: (credentials: { email: string; password: string }) =>
    request<any>("/api/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    request<any>("/api/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // User APIs
  createUser: (data: any) =>
    request("/api/user", { method: "POST", body: JSON.stringify(data) }),
  getAllUsers: () => request<any[]>("/api/user/get", { method: "GET" }),
  getUserById: (id: string) =>
    request<any>(`/api/user/find?_id=${id}`, { method: "GET" }),
  updateUser: (id: string, data: any) =>
    request(`/api/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request(`/api/user/delete?_id=${id}`, { method: "DELETE" }),

  // Digital Wallet
  addWalletMoney: (data: {
    userId: string;
    amount: number;
    method: string;
    transectionDetails: string;
  }) =>
    request("/api/user/add-wallet", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  withdrawMoney: (data: { userId: string; amount: number }) =>
    request("/api/user/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAllWithdraws: () =>
    request<any[]>("/api/user/withdraw/getall", { method: "GET" }),

  // Likes / Wishlist
  addLike: (userId: string, roomId: string) =>
    request("/api/user/like", {
      method: "POST",
      body: JSON.stringify({ user: userId, room: roomId }),
    }),
  getLikes: (userId: string) =>
    request<any[]>(`/api/user/like/find?_id=${userId}`, { method: "GET" }),
  removeLike: (likeId: string) =>
    request(`/api/user/like/remove?_id=${likeId}`, { method: "DELETE" }),

  // Notifications
  getNotifications: (userId: string) =>
    request<any[]>(`/api/user/notification/get-all?_id=${userId}`, {
      method: "GET",
    }),
  markNotificationRead: (id: string) =>
    request(`/api/user/notification/mark-read?_id=${id}`, { method: "PUT" }),
  markAllNotificationsRead: (userId: string) =>
    request(`/api/user/notification/read-all?_id=${userId}`, { method: "PUT" }),
  deleteAllNotifications: (userId: string) =>
    request(`/api/user/notification/delete-all?_id=${userId}`, {
      method: "DELETE",
    }),

  // Bookings & Payments
  bookRoom: (data: {
    userId: string;
    roomId: string;
    duration: number;
    startDate: string;
  }) =>
    request("/api/user/booking", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllBookings: () =>
    request<any[]>("/api/user/booking/getall", { method: "GET" }),
  getAllPayments: () =>
    request<any[]>("/api/user/payments/getall", { method: "GET" }),
  checkOutPayment: (merchantPaymentId: string) =>
    request(`/api/user/payment-send?_id=${merchantPaymentId}`, {
      method: "PUT",
    }),
  refundPayment: (merchantPaymentId: string) =>
    request(`/api/user/refund?_id=${merchantPaymentId}`, { method: "PUT" }),

  // Commissions
  getAllCommissions: () =>
    request<any[]>("/api/user/commission/getall", { method: "GET" }),

  // Merchant APIs
  createProperty: (data: any) =>
    request("/api/merchant", { method: "POST", body: JSON.stringify(data) }),
  merchantWithdraw: (data: {
    propertyId: string;
    amount: number;
    userId?: string;
    bankDetails?: any;
  }) =>
    request<any>("/api/merchant/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllProperties: () =>
    request<any[]>("/api/merchant/getall", { method: "GET" }),
  getPropertyById: (id: string) =>
    request(`/api/merchant/find?_id=${id}`, { method: "GET" }),
  updateProperty: (id: string, data: any) =>
    request(`/api/merchant/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProperty: (id: string) =>
    request(`/api/merchant/delete?_id=${id}`, { method: "DELETE" }),

  // Room APIs
  createRoom: (data: any) =>
    request("/api/merchant/room/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllRooms: () =>
    request<any[]>("/api/merchant/room/getall", { method: "GET" }),
  getRoomById: (id: string) =>
    request<any>(`/api/merchant/room/find?_id=${id}`, { method: "GET" }),
  updateRoom: (id: string, data: any) =>
    request(`/api/merchant/room/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteRoom: (id: string) =>
    request(`/api/merchant/room/delete?_id=${id}`, { method: "DELETE" }),
  addRoomImages: (roomId: string, images: string[]) =>
    request("/api/merchant/room/add-image", {
      method: "PUT",
      body: JSON.stringify({ roomId, images }),
    }),

  // Cloudinary Image Upload
  uploadImage: async (fileOrDataUrl: File | string): Promise<{ success: boolean; data?: { url: string; public_id: string }; message?: string }> => {
    try {
      if (typeof fileOrDataUrl === "string") {
        return await request<{ url: string; public_id: string }>("/api/upload", {
          method: "POST",
          body: JSON.stringify({ image: fileOrDataUrl }),
        });
      } else {
        const formData = new FormData();
        formData.append("image", fileOrDataUrl);
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        return {
          success: res.ok,
          data: result.data,
          message: typeof result.message === "string" ? result.message : (res.ok ? "Success" : "Upload failed"),
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to upload image to Cloudinary" };
    }
  },

  uploadMultipleImages: async (
    files: File[]
  ): Promise<{ success: boolean; data?: { url: string; public_id: string }[]; message?: string }> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      const res = await fetch(`${API_BASE_URL}/api/upload/multiple`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      return {
        success: res.ok,
        data: result.data,
        message: typeof result.message === "string" ? result.message : (res.ok ? "Success" : "Upload failed"),
      };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to upload images to Cloudinary" };
    }
  },
};
