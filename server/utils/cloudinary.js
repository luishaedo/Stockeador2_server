const cloudinary = require("cloudinary").v2
require("dotenv").config()

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Función para subir imagen a Cloudinary
const uploadImage = async (file, folder = "product-catalog") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error)
    throw new Error("Error al subir la imagen")
  }
}

// Función para eliminar imagen de Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error)
    return { success: false }
  }
}

module.exports = {
  uploadImage,
  deleteImage,
}

