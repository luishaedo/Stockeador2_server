const express = require("express")
const multer = require("multer")
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/productController")
const auth = require("../middleware/auth")

const router = express.Router()

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname)
  },
})

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  } else {
    cb(new Error("Solo se permiten imágenes"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Todas las rutas requieren autenticación
router.use(auth)

// Rutas de productos
router.get("/", getProducts)
router.get("/categories", getCategories)
router.get("/:id", getProductById)
router.post("/", upload.single("image"), createProduct)
router.put("/:id", upload.single("image"), updateProduct)
router.delete("/:id", deleteProduct)

module.exports = router

