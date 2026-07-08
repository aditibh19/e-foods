import { db, restaurantsTable, menuItemsTable } from "@workspace/db";

const restaurants = [
  {
    name: "Spice Garden",
    description: "Authentic North Indian cuisine with rich curries and fresh naan",
    cuisine: "South Indian",
    rating: "4.5",
    reviewCount: 284,
    deliveryTime: "25-35 min",
    deliveryFee: "30",
    minOrder: "150",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    isOpen: true,
    isFeatured: true,
    address: "12, MG Road, Bengaluru",
  },
  {
    name: "Pizza Palace",
    description: "Wood-fired pizzas with fresh Italian ingredients",
    cuisine: "Pizza",
    rating: "4.3",
    reviewCount: 192,
    deliveryTime: "30-40 min",
    deliveryFee: "25",
    minOrder: "199",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    isOpen: true,
    isFeatured: true,
    address: "45, Indiranagar, Bengaluru",
  },
  {
    name: "Burger Barn",
    description: "Juicy gourmet burgers stacked with fresh veggies",
    cuisine: "Burger",
    rating: "4.6",
    reviewCount: 341,
    deliveryTime: "20-30 min",
    deliveryFee: "20",
    minOrder: "120",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    isOpen: true,
    isFeatured: true,
    address: "78, Koramangala, Bengaluru",
  },
  {
    name: "Dragon Wok",
    description: "Authentic Chinese stir-fries and dim sum",
    cuisine: "Chinese",
    rating: "4.2",
    reviewCount: 158,
    deliveryTime: "35-45 min",
    deliveryFee: "35",
    minOrder: "200",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
    isOpen: true,
    isFeatured: false,
    address: "22, HSR Layout, Bengaluru",
  },
  {
    name: "Bake & Roll",
    description: "Freshly baked pastries, cakes and artisan rolls",
    cuisine: "Cakes",
    rating: "4.7",
    reviewCount: 412,
    deliveryTime: "30-45 min",
    deliveryFee: "40",
    minOrder: "250",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    isOpen: true,
    isFeatured: true,
    address: "5, JP Nagar, Bengaluru",
  },
  {
    name: "Pasta Pronto",
    description: "Classic Italian pasta dishes made fresh every day",
    cuisine: "Pasta",
    rating: "4.4",
    reviewCount: 223,
    deliveryTime: "25-40 min",
    deliveryFee: "30",
    minOrder: "180",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    isOpen: true,
    isFeatured: false,
    address: "90, Whitefield, Bengaluru",
  },
];

const menuItems = [
  // Spice Garden (index 0)
  { restaurantIndex: 0, name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: "320", category: "South Indian", imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.6" },
  { restaurantIndex: 0, name: "Paneer Tikka Masala", description: "Cottage cheese in spiced tomato gravy", price: "280", category: "South Indian", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.5" },
  { restaurantIndex: 0, name: "Dal Makhani", description: "Slow-cooked black lentils with butter", price: "220", category: "South Indian", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", isVeg: true, isBestseller: false, rating: "4.4" },
  { restaurantIndex: 0, name: "Garlic Naan", description: "Soft leavened flatbread with garlic", price: "60", category: "Paratha", imageUrl: "https://images.unsplash.com/photo-1619894991209-9f9694be045a?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.7" },
  // Pizza Palace (index 1)
  { restaurantIndex: 1, name: "Margherita Pizza", description: "Classic tomato, mozzarella and basil", price: "349", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.5" },
  { restaurantIndex: 1, name: "BBQ Chicken Pizza", description: "Smoky BBQ sauce with grilled chicken", price: "429", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.4" },
  { restaurantIndex: 1, name: "Veggie Supreme", description: "Loaded with bell peppers, olives and mushrooms", price: "379", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", isVeg: true, isBestseller: false, rating: "4.2" },
  // Burger Barn (index 2)
  { restaurantIndex: 2, name: "Classic Beef Burger", description: "Juicy beef patty with lettuce and cheese", price: "249", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.7" },
  { restaurantIndex: 2, name: "Veggie Burger", description: "Crispy veggie patty with avocado mayo", price: "199", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80", isVeg: true, isBestseller: false, rating: "4.3" },
  { restaurantIndex: 2, name: "Chicken Zinger", description: "Crispy fried chicken with jalapeño sauce", price: "229", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.6" },
  // Dragon Wok (index 3)
  { restaurantIndex: 3, name: "Chicken Fried Rice", description: "Wok-tossed rice with egg and veggies", price: "220", category: "Chinese", imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.4" },
  { restaurantIndex: 3, name: "Vegetable Spring Rolls", description: "Crispy rolls with crunchy veggie filling", price: "160", category: "Chinese", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.3" },
  { restaurantIndex: 3, name: "Kung Pao Chicken", description: "Spicy stir-fry with peanuts and chillies", price: "290", category: "Chinese", imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80", isVeg: false, isBestseller: false, rating: "4.2" },
  // Bake & Roll (index 4)
  { restaurantIndex: 4, name: "Chocolate Truffle Cake", description: "Rich dark chocolate with ganache frosting", price: "450", category: "Cakes", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.8" },
  { restaurantIndex: 4, name: "Butter Croissant", description: "Flaky French-style croissant", price: "120", category: "Pastries", imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.6" },
  { restaurantIndex: 4, name: "Red Velvet Pastry", description: "Moist red velvet with cream cheese", price: "180", category: "Pastries", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", isVeg: true, isBestseller: false, rating: "4.5" },
  { restaurantIndex: 4, name: "Mango Shake", description: "Thick fresh mango shake with milk", price: "150", category: "Shakes", imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80", isVeg: true, isBestseller: true, rating: "4.7" },
  // Pasta Pronto (index 5)
  { restaurantIndex: 5, name: "Spaghetti Carbonara", description: "Classic Roman pasta with egg and pancetta", price: "380", category: "Pasta", imageUrl: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.5" },
  { restaurantIndex: 5, name: "Penne Arrabiata", description: "Spicy tomato sauce with garlic and chillies", price: "300", category: "Pasta", imageUrl: "https://images.unsplash.com/photo-1627286395782-b20b05c2ad8a?w=400&q=80", isVeg: true, isBestseller: false, rating: "4.3" },
  { restaurantIndex: 5, name: "Chicken Sandwich", description: "Grilled chicken breast with Italian herbs", price: "260", category: "Sandwich", imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80", isVeg: false, isBestseller: true, rating: "4.4" },
];

async function seed() {
  // Check if already seeded
  const existing = await db.select().from(restaurantsTable);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  // Insert restaurants
  const insertedRestaurants = await db
    .insert(restaurantsTable)
    .values(restaurants)
    .returning();

  console.log(`Inserted ${insertedRestaurants.length} restaurants`);

  // Insert menu items
  const itemsToInsert = menuItems.map((item) => ({
    restaurantId: insertedRestaurants[item.restaurantIndex].id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl,
    isVeg: item.isVeg,
    isBestseller: item.isBestseller,
    rating: item.rating,
    orderCount: Math.floor(Math.random() * 500) + 50,
  }));

  const insertedItems = await db
    .insert(menuItemsTable)
    .values(itemsToInsert)
    .returning();

  console.log(`Inserted ${insertedItems.length} menu items`);
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
