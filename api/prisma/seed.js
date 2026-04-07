const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
  console.log("🌱 Start seeding...");


  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordWaiter = await bcrypt.hash("waiter123", 10);
  const passwordKitchen = await bcrypt.hash("kitchen123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Restaurant Admin", email: "admin@resto.com", password: passwordAdmin, role: "ADMIN" },
      { name: "John Waiter", email: "john.waiter@gmail.com", password: passwordWaiter, role: "WAITER" },
      { name: "Mary Waiter", email: "mary.waiter@gmail.com", password: passwordWaiter, role: "WAITER" },
      { name: "Chef Paul", email: "chef.paul@gmail.com", password: passwordKitchen, role: "KITCHEN" },
    ],
  });
  console.log("✅ Users created");

  const tablesData = [];
  for (let i = 1; i <= 12; i++) {
    tablesData.push({ tableNumber: i, capacity: 2 + (i % 3) * 2, section: i <= 6 ? "Indoor" : "Patio" });
  }
  await prisma.table.createMany({ data: tablesData });
  console.log("✅ Tables created");

  const menuItems = [
    { name: "Cheeseburger", category: "Burgers", price: 8.99, description: "Juicy beef burger with cheddar cheese", imageUrl: "https://source.unsplash.com/200x200/?burger" },
    { name: "Double Beef Burger", category: "Burgers", price: 11.49, description: "Two patties with cheese and onions", imageUrl: "https://source.unsplash.com/200x200/?burger" },
    { name: "Chicken Burger", category: "Burgers", price: 9.49, description: "Crispy chicken breast with mayo", imageUrl: "https://source.unsplash.com/200x200/?chicken-burger" },
    { name: "Veggie Burger", category: "Burgers", price: 8.49, description: "Grilled plant-based patty with lettuce", imageUrl: "https://source.unsplash.com/200x200/?veggie-burger" },
    { name: "BBQ Bacon Burger", category: "Burgers", price: 10.99, description: "Smoky BBQ sauce, bacon & cheese", imageUrl: "https://source.unsplash.com/200x200/?bbq-burger" },

    { name: "Margherita Pizza", category: "Pizza", price: 10.99, description: "Tomato, mozzarella & basil", imageUrl: "https://source.unsplash.com/200x200/?pizza" },
    { name: "Pepperoni Pizza", category: "Pizza", price: 12.49, description: "Loaded with spicy pepperoni slices", imageUrl: "https://source.unsplash.com/200x200/?pepperoni-pizza" },
    { name: "BBQ Chicken Pizza", category: "Pizza", price: 13.49, description: "Chicken, onions, BBQ sauce", imageUrl: "https://source.unsplash.com/200x200/?bbq-chicken-pizza" },
    { name: "Vegetarian Pizza", category: "Pizza", price: 11.99, description: "Peppers, olives, mushrooms", imageUrl: "https://source.unsplash.com/200x200/?veggie-pizza" },
    { name: "Four Cheese Pizza", category: "Pizza", price: 12.99, description: "Mozzarella, parmesan, gorgonzola, ricotta", imageUrl: "https://source.unsplash.com/200x200/?cheese-pizza" },

    { name: "Chicken Alfredo Pasta", category: "Pasta", price: 12.49, description: "Creamy Alfredo with grilled chicken", imageUrl: "https://source.unsplash.com/200x200/?pasta" },
    { name: "Spaghetti Bolognese", category: "Pasta", price: 11.49, description: "Traditional beef bolognese sauce", imageUrl: "https://source.unsplash.com/200x200/?spaghetti" },
    { name: "Pesto Pasta", category: "Pasta", price: 10.99, description: "Fresh basil pesto with parmesan", imageUrl: "https://source.unsplash.com/200x200/?pesto-pasta" },
    { name: "Seafood Pasta", category: "Pasta", price: 14.99, description: "Shrimp, calamari, garlic cream sauce", imageUrl: "https://source.unsplash.com/200x200/?seafood-pasta" },

    { name: "Caesar Salad", category: "Salads", price: 7.5, description: "Romaine, parmesan, caesar dressing", imageUrl: "https://source.unsplash.com/200x200/?salad" },
    { name: "Greek Salad", category: "Salads", price: 7.99, description: "Feta, olives, cucumbers & tomatoes", imageUrl: "https://source.unsplash.com/200x200/?greek-salad" },
    { name: "Chicken Avocado Salad", category: "Salads", price: 9.49, description: "Grilled chicken & sliced avocado", imageUrl: "https://source.unsplash.com/200x200/?chicken-salad" },

    { name: "Coke", category: "Drinks", price: 1.99, description: "Chilled classic cola", imageUrl: "https://source.unsplash.com/200x200/?cola" },
    { name: "Sprite", category: "Drinks", price: 1.99, description: "Refreshing lemon-lime soda", imageUrl: "https://source.unsplash.com/200x200/?sprite" },
    { name: "Orange Juice", category: "Drinks", price: 2.49, description: "Freshly squeezed oranges", imageUrl: "https://source.unsplash.com/200x200/?orange-juice" },
    { name: "Lemonade", category: "Drinks", price: 2.29, description: "Homemade fresh lemonade", imageUrl: "https://source.unsplash.com/200x200/?lemonade" },
    { name: "Iced Tea", category: "Drinks", price: 2.19, description: "Sweetened black iced tea", imageUrl: "https://source.unsplash.com/200x200/?iced-tea" },

    { name: "Chocolate Cake", category: "Desserts", price: 4.99, description: "Rich chocolate fudge cake", imageUrl: "https://source.unsplash.com/200x200/?chocolate-cake" },
    { name: "Vanilla Ice Cream", category: "Desserts", price: 3.49, description: "Creamy classic vanilla", imageUrl: "https://source.unsplash.com/200x200/?vanilla-ice-cream" },
    { name: "Apple Pie", category: "Desserts", price: 4.49, description: "Warm apple pie slice", imageUrl: "https://source.unsplash.com/200x200/?apple-pie" },
    { name: "Cheesecake", category: "Desserts", price: 4.99, description: "Smooth and creamy cheesecake", imageUrl: "https://source.unsplash.com/200x200/?cheesecake" },

    { name: "Pancakes", category: "Breakfast", price: 6.99, description: "Stack of fluffy pancakes", imageUrl: "https://source.unsplash.com/200x200/?pancakes" },
    { name: "Omelette", category: "Breakfast", price: 6.49, description: "Three-egg omelette with toppings", imageUrl: "https://source.unsplash.com/200x200/?omelette" },
    { name: "French Toast", category: "Breakfast", price: 6.79, description: "Golden-brown sweet french toast", imageUrl: "https://source.unsplash.com/200x200/?french-toast" },

    { name: "French Fries", category: "Sides", price: 3.49, description: "Crispy salted fries", imageUrl: "https://source.unsplash.com/200x200/?fries" },
    { name: "Onion Rings", category: "Sides", price: 3.99, description: "Crispy fried onion rings", imageUrl: "https://source.unsplash.com/200x200/?onion-rings" },
    { name: "Garlic Bread", category: "Sides", price: 2.99, description: "Toasted garlic butter bread", imageUrl: "https://source.unsplash.com/200x200/?garlic-bread" },
  ];

  await prisma.menuItem.createMany({ data: menuItems });
  console.log("✅ Menu items created");

  console.log("🌱 Seeding completed successfully! (No orders created)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
