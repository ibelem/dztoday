const {TE, to}              = require('../services/util.service');

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('News', {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    img: DataTypes.STRING,
    url: DataTypes.STRING,
    from: DataTypes.STRING,
    category: DataTypes.STRING
  });

  Model.associate = function(models){
      this.Users = this.belongsToMany(models.User, {through: 'UserNews'});
  };

  Model.prototype.toWeb = function (pw) {
      let json = this.toJSON();
      return json;
  };

  return Model;
};