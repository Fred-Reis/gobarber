module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      alowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('user', 'avatar_id');
  },
};
