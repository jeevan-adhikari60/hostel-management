import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize('hostel_management', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',//kun garni yo mysql, postgres ni hunxa
  logging: false // terminal ma sql query haru dekhaundaina
});