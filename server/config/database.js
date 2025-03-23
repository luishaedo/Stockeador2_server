const { Sequelize } = require("sequelize")
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log("Configuración de BD:", {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  passwordProvided: !!process.env.DB_PASSWORD,
  port: process.env.DB_PORT
  


})

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  port: process.env.DB_PORT || 5432,
  logging: false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Conexión a la base de datos establecida correctamente.")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
  }
}

testConnection()

module.exports = sequelize

