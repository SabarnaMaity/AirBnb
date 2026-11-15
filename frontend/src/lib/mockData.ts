import { Property, PROPERTYSTATUS, Room, ServiceProvided, User, USERROLE } from "@/types";

export const mockUsers: User[] = [
  {
    _id: "usr_101",
    name: { firstName: "Rahul", lastName: "Sharma" },
    email: "rahul@example.com",
    role: USERROLE.USER,
    wallet: 4500,
    contactInfo: { phone: "+91 9876543210" },
    address: { city: "Kolkata", state: "West Bengal", country: "India" },
  },
  {
    _id: "mch_201",
    name: { firstName: "Anisur", lastName: "Rahman" },
    email: "host.anisur@example.com",
    role: USERROLE.MERCHANT,
    wallet: 18500,
    contactInfo: { phone: "+91 9123456780" },
    address: { city: "Darjeeling", state: "West Bengal", country: "India" },
  },
  {
    _id: "adm_301",
    name: { firstName: "Admin", lastName: "Sabarna" },
    email: "admin@airbnb.local",
    role: USERROLE.ADMIN,
    wallet: 50000,
  },
];

export const mockProperties: Property[] = [
  {
    _id: "prop_01",
    name: "Himalayan Pine View Resort",
    address: { street: "Mall Road", city: "Darjeeling", state: "West Bengal", country: "India", zipCode: "734101" },
    owner: "mch_201",
    status: PROPERTYSTATUS.OPEN,
    verification: true,
    wallet: 15400,
    BankDetails: { bankName: "HDFC Bank", accountNumber: "XXXX-XXXX-8921", ifscCode: "HDFC0001234" },
    rooms: ["room_01", "room_02"],
  },
  {
    _id: "prop_02",
    name: "Goa Sunset Beach Villa",
    address: { street: "Calangute Beach Road", city: "North Goa", state: "Goa", country: "India", zipCode: "403516" },
    owner: "mch_201",
    status: PROPERTYSTATUS.OPEN,
    verification: false,
    wallet: 8200,
    BankDetails: { bankName: "SBI", accountNumber: "XXXX-XXXX-4421", ifscCode: "SBIN0005678" },
    rooms: ["room_03"],
  },
];

export const mockRooms: Room[] = [
  {
    _id: "room_01",
    property: "prop_01",
    roomName: "Pine Deluxe Suite",
    title: "Mountain View Luxury Suite with Balcony",
    roomNo: "D-102",
    description: "Enjoy panoramic sunrise views of Kanchenjunga with king bed, wooden flooring, and fireplace.",
    price: 1800,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    ],
    services: [ServiceProvided.WIFI, ServiceProvided.AC, ServiceProvided.GEYSER, ServiceProvided.BREAKFAST],
    tag: "Mountain View",
    mapLocation: "27.0410, 88.2663",
    isAvalabile: true,
  },
  {
    _id: "room_02",
    property: "prop_01",
    roomName: "Cozy Attic Studio",
    title: "Charming Wooden Attic with Stargazing Skylight",
    roomNo: "A-304",
    description: "A cozy studio room with fast Wi-Fi, electric kettle, heating, and glass skylight.",
    price: 1200,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    ],
    services: [ServiceProvided.WIFI, ServiceProvided.POWER_BACKUP, ServiceProvided.GEYSER],
    tag: "Budget Friendly",
    mapLocation: "27.0415, 88.2670",
    isAvalabile: true,
  },
  {
    _id: "room_03",
    property: "prop_02",
    roomName: "Sea Breeze Pool Villa Room",
    title: "Private Beachside Cottage with Pool Access",
    roomNo: "V-01",
    description: "Steps from Calangute beach. Includes private patio, hammock, mini fridge, and swimming pool access.",
    price: 3200,
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    services: [ServiceProvided.WIFI, ServiceProvided.AC, ServiceProvided.TV, ServiceProvided.FRIDGE, ServiceProvided.SECURITY],
    tag: "Beachfront",
    mapLocation: "15.5439, 73.7553",
    isAvalabile: false,
  },
];
