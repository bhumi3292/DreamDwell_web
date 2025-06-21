const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index");
const User = require("../models/User");
const Category = require("../models/Category");

let landlordToken;
let categoryId;
let resetToken;

beforeAll(async () => {
    // Clear database before tests
    await mongoose.connection.dropDatabase();

    //=============== Register landlord
    const registerRes = await request(app).post("/api/auth/register").send({
        fullName: "Test Landlord",
        email: "landlord@test.com",
        phoneNumber: "9800000000",
        stakeholder: "Landlord",
        password: "password123",
        confirmPassword: "password123"
    });
    expect(registerRes.statusCode).toBe(201);

    // -------Login landlord to get token
    const loginRes = await request(app).post("/api/auth/login").send({
        email: "landlord@test.com",
        password: "password123"
    });
    expect(loginRes.statusCode).toBe(200);
    landlordToken = loginRes.body.token;

    // Clean test user before running user tests
    await User.deleteOne({ email: "ram123@gmail.com" });
});

afterAll(async () => {
    await mongoose.disconnect();
});
//============================================================================================
describe("User Authentication API", () => {
    test("should validate missing fields while creating user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                fullName: "Ram Bahadur",
                email: "ram123@gmail.com",
                phoneNumber: "9800000000",
                stakeholder: "Tenant"
                // missing password + confirmPassword
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Please fill all the fields");
    });

    test("should create a user with all fields", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                fullName: "Ram Singh",
                email: "ram123@gmail.com",
                phoneNumber: "9800000000",
                stakeholder: "Tenant",
                password: "password123",
                confirmPassword: "password123"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User registered successfully");
    });

    test("should login a user with valid credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "ram123@gmail.com",
                password: "password123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toEqual(expect.any(String));
    });
});
//==============================================================================
describe("Password Reset Flow", () => {
    test("should request password reset link", async () => {
        const res = await request(app)
            .post("/api/auth/request-reset/send-link")
            .send({ email: "ram123@gmail.com" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/password reset link has been sent/i);

        // Simulate getting the reset token (what would be emailed)
        const user = await User.findOne({ email: "ram123@gmail.com" });
        resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    });

    test("should reset password with valid token", async () => {
        const res = await request(app)
            .post(`/api/auth/reset-password/${resetToken}`)
            .send({
                newPassword: "newpassword123",
                confirmPassword: "newpassword123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Password has been reset successfully.");
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
//========================================================================================================

describe("Category API", () => {
    test("should create a new category", async () => {
        const res = await request(app)
            .post("/api/category")
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Apartment" });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.category.category_name).toBe("Apartment");
        categoryId = res.body.category._id;
    });

    test("should not create duplicate category", async () => {
        const res = await request(app)
            .post("/api/category")
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Apartment" });

        expect(res.statusCode).toBe(400);
    });

    test("should fetch all categories", async () => {
        const res = await request(app).get("/api/category");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should fetch category by ID", async () => {
        const res = await request(app).get(`/api/category/${categoryId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data._id).toBe(categoryId);
    });

    test("should return 404 for invalid category ID", async () => {
        const res = await request(app).get(`/api/category/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toBe(404);
    });

    test("should update a category", async () => {
        const res = await request(app)
            .put(`/api/category/${categoryId}`)
            .set("Authorization", `Bearer ${landlordToken}`)
            .send({ name: "Updated Apartment" });

        expect(res.statusCode).toBe(200);
        expect(res.body.category.category_name).toBe("Updated Apartment");
    });

    test("should delete a category", async () => {
        const temp = await Category.create({ category_name: "Temp Category" });
        const res = await request(app)
            .delete(`/api/category/${temp._id}`)
            .set("Authorization", `Bearer ${landlordToken}`);

        expect(res.statusCode).toBe(200);
    });

    test("should 404 deleting non-existent category", async () => {
        const res = await request(app)
            .delete(`/api/category/${new mongoose.Types.ObjectId()}`)
            .set("Authorization", `Bearer ${landlordToken}`);
        expect(res.statusCode).toBe(404);
    });
});


//===========================================================================================================
describe("Property API", () => {
    test("should get all properties", async () => {
        const res = await request(app).get("/api/properties");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should 404 deleting non-existent property", async () => {
        const res = await request(app)
            .delete(`/api/properties/${new mongoose.Types.ObjectId()}`)
            .set("Authorization", `Bearer ${landlordToken}`);
        expect(res.statusCode).toBe(404);
    });
});
