import * as dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../lib/models/User";
import Product from "../lib/models/Product";
import Order from "../lib/models/Order";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

const seedProducts = [
  // Burgers
  {
    name: { en: "Classic Beef Burger", ar: "برجر لحم كلاسيك" },
    description: {
      en: "Flame-grilled beef patty, lettuce, tomato, pickles, and our signature house sauce.",
      ar: "شريحة لحم بقري مشوية على اللهب، خس، طماطم، مخلل، وصلصة الدار المميزة.",
    },
    price: 8.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Double Cheese Burger", ar: "دبل تشيز برجر" },
    description: {
      en: "Two flame-grilled beef patties, double cheddar cheese, caramelized onions, and mustard.",
      ar: "شريحتا لحم بقري مشوية على اللهب، جبن شيدر مزدوج، بصل مكرمل، وخردل.",
    },
    price: 11.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Crispy Chicken Burger", ar: "برجر دجاج مقرمش" },
    description: {
      en: "Crispy fried chicken breast, spicy mayo, pickles, and shredded lettuce.",
      ar: "صدر دجاج مقلي مقرمش، مايونيز حار، مخلل، وخس مبشور.",
    },
    price: 9.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
    available: true,
  },

  // Pizza
  {
    name: { en: "Pepperoni Pizza", ar: "بيتزا بيبيروني" },
    description: {
      en: "Mozzarella cheese, tomato sauce, and loaded with premium beef pepperoni.",
      ar: "جبنة موزاريلا، صلصة طماطم، ومحملة بقطع بيبيروني بقري فاخرة.",
    },
    price: 14.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Margherita Pizza", ar: "بيتزا مارغريتا" },
    description: {
      en: "Fresh mozzarella cheese, tomato sauce, fresh basil, and extra virgin olive oil.",
      ar: "جبنة موزاريلا طازجة، صلصة طماطم، ريحان طازج، وزيت زيتون بكر ممتاز.",
    },
    price: 12.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "BBQ Chicken Pizza", ar: "بيتزا دجاج باربكيو" },
    description: {
      en: "Grilled chicken, smoky BBQ sauce, red onions, mozzarella, and cilantro.",
      ar: "دجاج مشوي، صلصة باربكيو مدخنة، بصل أحمر، موزاريلا، وكزبرة.",
    },
    price: 15.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    available: true,
  },

  // Drinks
  {
    name: { en: "Coca Cola", ar: "كوكا كولا" },
    description: {
      en: "Chilled classic cola can.",
      ar: "علبة كولا كلاسيكية مبردة.",
    },
    price: 1.99,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" },
    description: {
      en: "100% freshly squeezed orange juice, served cold.",
      ar: "عصير برتقال طبيعي معصور طازجاً 100٪، يقدم بارداً.",
    },
    price: 3.99,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Iced Latte", ar: "لاتيه مثلج" },
    description: {
      en: "Freshly brewed espresso over milk and ice.",
      ar: "إسبرسو طازج مع الحليب والثلج.",
    },
    price: 4.49,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    available: true,
  },

  // Desserts
  {
    name: { en: "Chocolate Fudge Cake", ar: "كيكة الشوكولاتة الداكنة" },
    description: {
      en: "Rich, moist chocolate cake with warm fudge frosting.",
      ar: "كعكة شوكولاتة غنية ورطبة مغطاة بصلصة الشوكولاتة الدافئة.",
    },
    price: 5.99,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "New York Cheesecake", ar: "تشيز كيك نيويورك" },
    description: {
      en: "Creamy baked cheesecake with a buttery graham cracker crust and strawberry glaze.",
      ar: "تشيز كيك كريمي مخبوز مع طبقة من البسكويت بالزبدة وصلصة الفراولة.",
    },
    price: 6.49,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Warm Apple Pie", ar: "فطيرة تفاح دافئة" },
    description: {
      en: "Spiced apple filling in a flaky crust, served warm.",
      ar: "حشوة التفاح المتبل بالفرن داخل عجينة مقرمشة، تقدم دافئة.",
    },
    price: 4.99,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80",
    available: true,
  },

  // Salads
  {
    name: { en: "Caesar Salad", ar: "سلطة سيزر" },
    description: {
      en: "Crisp romaine lettuce, garlic croutons, parmesan cheese, and creamy Caesar dressing.",
      ar: "خس روماني مقرمش، مكعبات خبز بالثوم، جبن بارميزان، وصلصة سيزر الكريمية.",
    },
    price: 7.99,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Greek Salad", ar: "سلطة يونانية" },
    description: {
      en: "Cucumbers, tomatoes, red onions, kalamata olives, feta cheese, and Greek vinaigrette.",
      ar: "خيار، طماطم، بصل أحمر، زيتون كالاماتا، جبنة فيتا، وصلصة يونانية.",
    },
    price: 8.49,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
  {
    name: { en: "Quinoa Avocado Salad", ar: "سلطة الكينوا والأفوكادو" },
    description: {
      en: "Quinoa, fresh avocado slices, cherry tomatoes, cucumbers, cilantro, and lemon-lime vinaigrette.",
      ar: "كينوا، شرائح أفوكادو طازجة، طماطم كرزية، خيار، كزبرة، وصلصة الليمون الأخضر.",
    },
    price: 9.99,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    available: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!, {
      dbName: "food-ordering",
    });
    console.log("Connected successfully.");

    // Clean existing data
    console.log("Clearing existing orders, products, and users...");
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log("Database cleared.");

    // Create default users
    console.log("Creating default users...");
    
    // Admin user (Mongoose pre-save hashes the password)
    const adminUser = new User({
      name: "Admin User",
      email: "admin@foodie.com",
      password: "admin12345password", // Mongoose pre-save hook will hash this
      role: "admin",
    });
    await adminUser.save();

    // Regular user
    const regularUser = new User({
      name: "John Doe",
      email: "user@foodie.com",
      password: "user12345password", // Mongoose pre-save hook will hash this
      role: "user",
    });
    await regularUser.save();

    console.log("Users seeded successfully.");
    console.log(`Admin User: email: "admin@foodie.com", password: "admin12345password"`);
    console.log(`Regular User: email: "user@foodie.com", password: "user12345password"`);

    // Create default products
    console.log("Creating default products...");
    await Product.insertMany(seedProducts);
    console.log("Products seeded successfully.");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
