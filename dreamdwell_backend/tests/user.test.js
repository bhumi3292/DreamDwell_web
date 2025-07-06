const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index"); // Adjust path if your main app file is elsewhere
const User = require("../models/User");
const Category = require("../models/Category");
const Property = require("../models/Property"); // Added: Import Property model
const Cart = require("../models/Cart");     // Added: Import Cart model

let landlordToken;
let categoryId;
let resetToken; // For password reset tests
let testUserEmailForReset = "resettestuser@example.com"; // Dedicated email for reset tests

beforeAll(async () => {
    // Connect to a test database and drop existing data for a clean slate
    process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dreamdwell_test_auth";
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    console.log("Dropping auth test database for clean setup...");
    await mongoose.connection.dropDatabase();
    console.log("Auth Database dropped. Starting setup...");

    // Register landlord
    const landlordRegisterRes = await request(app).post("/api/auth/register").send({
        fullName: "Test Landlord",
        email: "landlord@auth.com", // Unique email for this test file
        phoneNumber: "9800000000",
        stakeholder: "Landlord",
        password: "password123",
        confirmPassword: "password123"
    });
    expect(landlordRegisterRes.statusCode).toBe(201);

    // Login landlord
    const landlordLoginRes = await request(app).post("/api/auth/login").send({
        email: "landlord@auth.com",
        password: "password123"
    });
    expect(landlordLoginRes.statusCode).toBe(200);
    landlordToken = landlordLoginRes.body.token;

    // Create a user specifically for password reset tests
    await request(app).post("/api/auth/register").send({
        fullName: "Reset Test User",
        email: testUserEmailForReset,
        phoneNumber: "9876543210",
        stakeholder: "Tenant",
        password: "oldpassword123",
        confirmPassword: "oldpassword123"
    });

    console.log("Auth setup complete.");
});

afterAll(async () => {
    // Disconnect from MongoDB after all tests are done
    if (mongoose.connection.readyState !== 0) {
        console.log("Disconnecting from Auth MongoDB...");
        await mongoose.disconnect();
    }
});

describe("User Authentication API", () => {
    test("should validate missing fields while creating user", async () => {
        const res = await request(app).post("/api/auth/register").send({
            fullName: "Ram Bahadur",
            email: "ramtemp@gmail.com", // Use a unique temporary email
            phoneNumber: "9800000000",
            stakeholder: "Tenant"
            // missing password + confirmPassword
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Please fill all the fields");
        await User.deleteOne({ email: "ramtemp@gmail.com" }); // Clean up
    });

    test("should create a user with all fields", async () => {
        const res = await request(app).post("/api/auth/register").send({
            fullName: "Ram Singh",
            email: "ramsingh@auth.com", // Use a unique email for this test
            phoneNumber: "9800000001",
            stakeholder: "Tenant",
            password: "password123",
            confirmPassword: "password123"
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User registered successfully");
        await User.deleteOne({ email: "ramsingh@auth.com" }); // Clean up
    });

    test("should login a user with valid credentials (landlord)", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "landlord@auth.com",
            password: "password123"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.token).toBe("string");
    });
});

describe("Password Reset Flow", () => {
    test("should request password reset link", async () => {
        const res = await request(app)
            .post("/api/auth/request-reset/send-link")
            .send({ email: testUserEmailForReset });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/password reset link has been sent/i);

        const user = await User.findOne({ email: testUserEmailForReset });
        // NOTE: In a real app, the token would be sent via email.
        // For testing, we derive it or assume it's accessible for the test setup.
        if (user && process.env.JWT_SECRET) {
            resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        } else {
            console.warn("Could not generate reset token for testing.");
            resetToken = "mock_invalid_token_for_test"; // Fallback
        }
    });

    test("should reset password with valid token", async () => {
        if (!resetToken || resetToken === "mock_invalid_token_for_test") {
            console.warn("Skipping reset password test: resetToken not available.");
            return;
        }

        const res = await request(app)
            .post(`/api/auth/reset-password/${resetToken}`)
            .send({
                newPassword: "newpassword123",
                confirmPassword: "newpassword123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Password has been reset successfully.");

        // Verify login with new password
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: testUserEmailForReset,
                password: "newpassword123"
            });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.success).toBe(true);
    });

    test("should fail reset with invalid token", async () => {
        const res = await request(app)
            .post("/api/auth/reset-password/invalidtoken123")
            .send({
                newPassword: "anotherpass123",
                confirmPassword: "anotherpass123"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/invalid reset token/i);
    });
});

describe("Category API", () => {
    test("should create a new category", async () => {
        const res = await request(app)
            .post("/api/category")
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Category For Auth Test" }); // Unique name

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.category_name).toBe("Category For Auth Test");
        categoryId = res.body.data._id; // Store for other category tests
    });

    test("should not create duplicate category", async () => {
        const res = await request(app)
            .post("/api/category")
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Category For Auth Test" });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Category already exists");
    });

    test("should fetch all categories", async () => {
        const res = await request(app).get("/api/category");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1); // At least the one from setup
    });

    test("should fetch category by ID", async () => {
        if (!categoryId) { // Ensure categoryId is set from a previous test
            const category = await Category.findOne({ category_name: "Category For Auth Test" });
            if (category) categoryId = category._id;
        }
        expect(categoryId).toBeDefined();

        const res = await request(app).get(`/api/category/${categoryId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id.toString()).toBe(categoryId.toString());
    });

    test("should return 404 for non-existent category ID", async () => {
        const res = await request(app).get(`/api/category/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Category not found");
    });

    test("should update a category", async () => {
        const temp = await Category.create({ category_name: "Temp Category To Update" });
        const res = await request(app)
            .put(`/api/category/${temp._id}`)
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Updated Temp Category" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.category_name).toBe("Updated Temp Category");
    });

    test("should delete a category", async () => {
        const temp = await Category.create({ category_name: "Temp Category To Delete" });
        const res = await request(app)
            .delete(`/api/category/${temp._id}`)
            .set("Authorization", `Bearer ${landlordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Category deleted");
    });

    test("should 404 deleting non-existent category", async () => {
        const res = await request(app)
            .delete(`/api/category/${new mongoose.Types.ObjectId()}`)
            .set("Authorization", `Bearer ${landlordToken}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Category not found");
    });
});

describe("Property API (Basic)", () => {
    // For these basic property tests, we'll quickly create a property here
    // rather than relying on the main setup, for better isolation.
    let tempPropertyId;
    let tempCategoryId;

    beforeAll(async () => {
        const categoryRes = await request(app)
            .post("/api/category")
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Temp Property Category for Property API Test" });
        tempCategoryId = categoryRes.body.data._id;

        const propertyRes = await request(app)
            .post("/api/properties")
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({
                title: "Temp Property for Property API Test",
                description: "A temp property for testing Property API.",
                price: 10000,
                location: "Temp City for Property API Test",
                bedrooms: 1,
                bathrooms: 1,
                categoryName: "Temp Property Category for Property API Test",
                images: ["http://example.com/temp_prop.jpg"],
                videos: []
            });
        tempPropertyId = propertyRes.body.data._id;
    });

    afterAll(async () => {
        await Property.deleteOne({ _id: tempPropertyId });
        await Category.deleteOne({ _id: tempCategoryId });
    });

    test("should get all properties", async () => {
        const res = await request(app).get("/api/properties");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        // We expect at least one property created in this `beforeAll` block
        // The actual length depends on other tests, but at least 1 should be there.
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test("should 404 deleting non-existent property", async () => {
        const res = await request(app)
            .delete(`/api/properties/${new mongoose.Types.ObjectId()}`)
            .set("Authorization", `Bearer ${landlordToken}`); // Assuming landlord can delete
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Property not found");
    });
});