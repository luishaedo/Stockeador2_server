const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');

// Establecer relaciones
Product.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(Product, {
  foreignKey: 'userId'
});

// Exportar modelos
module.exports = {
  User,
  Product,
  Category
};