const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

// Donation Schema
const donationSchema = new mongoose.Schema(
    {
        foodName: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0.01
        },
        unit: {
            type: String,
            enum: ["kg", "plates", "packets"],
            required: true
        },
        vegetarian: {
            type: Boolean,
            default: true
        },
        pickupLocation: {
            type: String,
            required: true,
            trim: true
        },
        useByTime: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["Available", "Reserved", "Collected", "Expired"],
            default: "Available"
        }
    },
    { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to FoodRescue API",
        status: "Running"
    });
});

// CREATE: Add a donation
app.post("/api/donations", async (req, res) => {
    try {
        const donation = await Donation.create(req.body);

        res.status(201).json({
            message: "Food donation created successfully",
            donation
        });
    } catch (error) {
        res.status(400).json({
            message: "Unable to create donation",
            error: error.message
        });
    }
});

// READ: Get all donations
app.get("/api/donations", async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });

        res.status(200).json({
            count: donations.length,
            donations
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve donations",
            error: error.message
        });
    }
});

// READ: Get one donation
app.get("/api/donations/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid donation ID" });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.status(200).json(donation);
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve donation",
            error: error.message
        });
    }
});

// UPDATE: Modify a donation
app.put("/api/donations/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid donation ID" });
        }

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.status(200).json({
            message: "Donation updated successfully",
            donation
        });
    } catch (error) {
        res.status(400).json({
            message: "Unable to update donation",
            error: error.message
        });
    }
});

// DELETE: Remove a donation
app.delete("/api/donations/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid donation ID" });
        }

        const donation = await Donation.findByIdAndDelete(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.status(200).json({
            message: "Donation deleted successfully",
            donation
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to delete donation",
            error: error.message
        });
    }
});

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        if (!process.env.MONGODB_URI ||
            process.env.MONGODB_URI === "your_mongodb_connection_string") {
            throw new Error("Please configure MONGODB_URI in your .env file.");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`FoodRescue API is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
    }
}

startServer();