const { Product, Category } = require("../models")
const { uploadImage, deleteImage } = require("../utils/cloudinary")
const { Op } = require("sequelize")

// Obtener productos con paginación y filtros
const getProducts = async (req, res) => {
  try {
    const { page = 1, pageSize = 12, search = "", category = "" } = req.query

    const offset = (page - 1) * pageSize

    // Construir condiciones de búsqueda
    const where = { userId: req.user.id }

    if (search) {
      where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
    }

    if (category) {
      where.category = category
    }

    // Obtener total de productos
    const total = await Product.count({ where })

    // Obtener productos paginados
    const products = await Product.findAll({
      where,
      limit: Number.parseInt(pageSize),
      offset,
      order: [["createdAt", "DESC"]],
    })

    // Calcular total de páginas
    const totalPages = Math.ceil(total / pageSize)

    res.json({
      data: products,
      pagination: {
        total,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize),
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    res.status(500).json({ message: "Error al obtener productos" })
  }
}

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    // Verificar que el producto pertenece al usuario
    if (product.userId !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso para ver este producto" })
    }

    res.json(product)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    res.status(500).json({ message: "Error al obtener producto" })
  }
}

// Crear un nuevo producto
const createProduct = async (req, res) => {
  try {
    const { name, description, category, tags } = req.body

    if (!name || !category || !req.file) {
      return res.status(400).json({ message: "Faltan campos requeridos" })
    }

    // Subir imagen a Cloudinary
    const result = await uploadImage(req.file.path)

    // Procesar etiquetas
    const processedTags = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    // Crear producto
    const product = await Product.create({
      name,
      description,
      category,
      tags: processedTags,
      imageUrl: result.url,
      publicId: result.publicId,
      userId: req.user.id,
    })

    // Asegurarse de que la categoría existe
    await Category.findOrCreate({
      where: { name: category },
    })

    res.status(201).json(product)
  } catch (error) {
    console.error("Error al crear producto:", error)
    res.status(500).json({ message: "Error al crear producto" })
  }
}

// Actualizar un producto
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, tags } = req.body

    // Obtener producto existente
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    // Verificar que el producto pertenece al usuario
    if (product.userId !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso para editar este producto" })
    }

    // Procesar etiquetas
    const processedTags = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : product.tags

    // Actualizar datos básicos
    product.name = name || product.name
    product.description = description !== undefined ? description : product.description
    product.category = category || product.category
    product.tags = processedTags

    // Si hay una nueva imagen, actualizar
    if (req.file) {
      // Eliminar imagen anterior
      if (product.publicId) {
        await deleteImage(product.publicId)
      }

      // Subir nueva imagen
      const result = await uploadImage(req.file.path)
      product.imageUrl = result.url
      product.publicId = result.publicId
    }

    // Guardar cambios
    await product.save()

    // Asegurarse de que la categoría existe
    await Category.findOrCreate({
      where: { name: product.category },
    })

    res.json(product)
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    res.status(500).json({ message: "Error al actualizar producto" })
  }
}

// Eliminar un producto
const deleteProduct = async (req, res) => {
  try {
    // Obtener producto
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    // Verificar que el producto pertenece al usuario
    if (product.userId !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este producto" })
    }

    // Eliminar imagen de Cloudinary
    if (product.publicId) {
      await deleteImage(product.publicId)
    }

    // Eliminar producto
    await product.destroy()

    res.json({ message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    res.status(500).json({ message: "Error al eliminar producto" })
  }
}

// Obtener todas las categorías
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    })

    res.json(categories.map((category) => category.name))
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    res.status(500).json({ message: "Error al obtener categorías" })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
}

