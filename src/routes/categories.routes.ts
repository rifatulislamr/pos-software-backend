import { Router } from "express";

import { authenticateUser } from "../middlewares/auth.middleware";


const router = Router();

// Get all categories (with optional pagination)
router.get("/", authenticateUser, );

// Get single category by id
router.get("/:categoryId", authenticateUser, );

// Create new category
router.post("/", authenticateUser, );

// Update existing category
router.put("/:categoryId", authenticateUser, );

// Delete category
router.delete("/:categoryId", authenticateUser, );

// Delete multiple selected categories (accepts array of categoryIds in body)
router.post("/delete-selected", authenticateUser, );

export default router;
