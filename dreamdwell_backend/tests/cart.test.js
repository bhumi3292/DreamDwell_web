const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");
const Property = require("../models/Property");
const Cart = require("../models/Cart");
const Category = require("../models/Category");

let landlordToken, tenant1Token, tenant2Token;
let tenant1Id, tenant2Id;
let propertyId1, propertyId2;
let categoryId;
const categoryNameForCartTest = "Category for Cart Properties";

beforeAll(async () => {
    process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dreamdwell_test_cart";
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    await mongoose.connection.dropDatabase();

    await request(app).post("/api/auth/register").send({
        fullName: "Cart Landlord",
        email: "cartlandlord@test.com",
        phoneNumber: "9800000000",
        stakeholder: "Landlord",
        password: "password123",
        confirmPassword: "password123",
    });
    const landlordLoginRes = await request(app).post("/api/auth/login").send({
        email: "cartlandlord@test.com",
        password: "password123",
    });
    landlordToken = landlordLoginRes.body.token;

    await request(app).post("/api/auth/register").send({
        fullName: "Cart Tenant 1",
        email: "carttenant1@test.com",
        phoneNumber: "9811111111",
        stakeholder: "Tenant",
        password: "password123",
        confirmPassword: "password123",
    });
    const createdTenant1User = await User.findOne({ email: "carttenant1@test.com" });
    tenant1Id = createdTenant1User._id;
    const tenant1LoginRes = await request(app).post("/api/auth/login").send({
        email: "carttenant1@test.com",
        password: "password123",
    });
    tenant1Token = tenant1LoginRes.body.token;

    await request(app).post("/api/auth/register").send({
        fullName: "Cart Tenant 2",
        email: "carttenant2@test.com",
        phoneNumber: "9822222222",
        stakeholder: "Tenant",
        password: "password123",
        confirmPassword: "password123",
    });
    const createdTenant2User = await User.findOne({ email: "carttenant2@test.com" });
    tenant2Id = createdTenant2User._id;
    const tenant2LoginRes = await request(app).post("/api/auth/login").send({
        email: "carttenant2@test.com",
        password: "password123",
    });
    tenant2Token = tenant2LoginRes.body.token;

    const createCategoryRes = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${landlordToken}`)
        .send({ name: categoryNameForCartTest });
    categoryId = createCategoryRes.body.data._id;

    const createPropertyRes1 = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${landlordToken}`)
        .send({
            title: "Cart Test Apartment",
            description: "An apartment for cart test.",
            price: 100000,
            location: "Cart Test Location 1",
            bedrooms: 2,
            bathrooms: 1,
            categoryName: categoryNameForCartTest,
            images: ["http://example.com/cart_img1.jpg"],
            videos: [],
        });
    propertyId1 = createPropertyRes1.body.data._id;

    const createPropertyRes2 = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${landlordToken}`)
        .send({
            title: "Cart Test House",
            description: "A house for cart test.",
            price: 200000,
            location: "Cart Test Location 2",
            bedrooms: 3,
            bathrooms: 2,
            categoryName: categoryNameForCartTest,
            images: ["http://example.com/cart_img2.jpg"],
            videos: [],
        });
    propertyId2 = createPropertyRes2.body.data._id;
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
});

describe("Cart API", () => {
    beforeEach(async () => {
        await Cart.deleteMany({});
    });

    test("should allow a tenant to add a property to their cart", async () => {
        const res = await request(app)
            .post(`/api/cart/add`)
            .set("Authorization", `Bearer ${tenant1Token}`)
            .send({ propertyId: propertyId1 });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("should prevent adding the same property twice to cart", async () => {
        await request(app).post(`/api/cart/add`).set("Authorization", `Bearer ${tenant1Token}`).send({ propertyId: propertyId1 });
        const res = await request(app).post(`/api/cart/add`).set("Authorization", `Bearer ${tenant1Token}`).send({ propertyId: propertyId1 });
        expect(res.statusCode).toBe(400);
    });

    test("should allow a tenant to remove a property from their cart", async () => {
        await request(app).post(`/api/cart/add`).set("Authorization", `Bearer ${tenant1Token}`).send({ propertyId: propertyId2 });
        const res = await request(app).delete(`/api/cart/remove/${propertyId2}`).set("Authorization", `Bearer ${tenant1Token}`);
        expect(res.statusCode).toBe(200);
    });

    test("should get an empty cart for a tenant with no items", async () => {
        const res = await request(app).get("/api/cart").set("Authorization", `Bearer ${tenant2Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.items).toEqual([]);
    });

    test("should return 401 if unauthorized user tries to access cart endpoints", async () => {
        const resAdd = await request(app).post(`/api/cart/add`).send({ propertyId: propertyId1 });
        expect(resAdd.statusCode).toBe(401);

        const resRemove = await request(app).delete(`/api/cart/remove/${propertyId1}`);
        expect(resRemove.statusCode).toBe(401);

        const resGet = await request(app).get("/api/cart");
        expect(resGet.statusCode).toBe(401);
    });

    test("should get cart with multiple items", async () => {
        await request(app).post(`/api/cart/add`).set("Authorization", `Bearer ${tenant1Token}`).send({ propertyId: propertyId1 });
        await request(app).post(`/api/cart/add`).set("Authorization", `Bearer ${tenant1Token}`).send({ propertyId: propertyId2 });
        const res = await request(app).get("/api/cart").set("Authorization", `Bearer ${tenant1Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.items.length).toBe(2);
    });
});
