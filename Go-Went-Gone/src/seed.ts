import { UserModel } from "./modules/User/user.model";
import { PropertyModel } from "./modules/Merchant/merchant.model";
import { RoomModel } from "./modules/Merchant/room.model";
import { USERROLE, PROPERTYSTATUS, ServiceProvided } from "./Base/Base_Class/baseEnum";

export async function autoSeed() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log("No users found in DB. Seeding initial accounts...");
      const guest = await UserModel.create({
        name: { firstName: "Rahul", lastName: "Sharma" },
        email: "rahul@example.com",
        password: "password123",
        role: USERROLE.USER,
        wallet: 6000,
        address: { city: "Kolkata", state: "West Bengal", country: "India" },
        contactInfo: { phone: "+91 9876543210" },
      });

      const host = await UserModel.create({
        name: { firstName: "Anisur", lastName: "Rahman" },
        email: "host@example.com",
        password: "password123",
        role: USERROLE.MERCHANT,
        wallet: 15000,
        address: { city: "Darjeeling", state: "West Bengal", country: "India" },
        contactInfo: { phone: "+91 9123456780" },
      });

      const admin = await UserModel.create({
        name: { firstName: "Sabarna", lastName: "Maity" },
        email: "admin@example.com",
        password: "password123",
        role: USERROLE.ADMIN,
        wallet: 50000,
      });

      console.log("Seeding initial property & rooms...");
      const property = await PropertyModel.create({
        name: "Himalayan Pine View Resort",
        address: {
          street: "Mall Road",
          city: "Darjeeling",
          state: "West Bengal",
          country: "India",
          zipCode: "734101",
        },
        owner: host._id,
        status: PROPERTYSTATUS.OPEN,
        verification: true,
        wallet: 12000,
        BankDetails: {
          bankName: "HDFC Bank",
          accountNumber: "5010023456789",
          ifscCode: "HDFC0001234",
        },
      });

      const room1 = await RoomModel.create({
        property: property._id,
        roomName: "Pine Deluxe Balcony Suite",
        title: "Kanchenjunga Mountain View Suite",
        roomNo: "D-101",
        description: "Panoramic view of Himalayan peaks with king bed, wooden flooring, and fireplace.",
        price: 1800,
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        ],
        services: [ServiceProvided.WIFI, ServiceProvided.AC, ServiceProvided.GEYSER, ServiceProvided.BREAKFAST],
        tag: "Mountain View",
        mapLocation: "27.0410, 88.2663",
        isAvalabile: true,
      });

      const room2 = await RoomModel.create({
        property: property._id,
        roomName: "Cozy Attic Studio",
        title: "Wooden Attic with Stargazing Skylight",
        roomNo: "A-204",
        description: "Cozy studio with fast Wi-Fi, electric kettle, heating, and glass skylight.",
        price: 1200,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        ],
        services: [ServiceProvided.WIFI, ServiceProvided.POWER_BACKUP, ServiceProvided.GEYSER],
        tag: "Budget Friendly",
        mapLocation: "27.0415, 88.2670",
        isAvalabile: true,
      });

      property.rooms = [room1._id as any, room2._id as any];
      await property.save();
      console.log("Database initialized with seed data!");
    }
  } catch (err: any) {
    console.error("Seed error:", err.message);
  }
}
