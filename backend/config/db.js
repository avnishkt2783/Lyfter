import Sequelize  from 'sequelize'

const sequelize = new Sequelize('lyfter', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
})

export default sequelize