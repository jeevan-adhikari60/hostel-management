import { sequelize } from "../database.js";
import { DataTypes } from 'sequelize';
const Room = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    RoomNumber: {
        type: DataTypes.STRING(10),
        unique: true,
        allowNull: false,
    },
    Capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Status: {
        type: DataTypes.ENUM('Available', 'Occupied'),
        defaultValue:"Available",
        allowNull: true,
    },
   Type:{
    type:DataTypes.ENUM('Single','Double','Triple'),
    allowNull:false,
   },
   RoomImage:{
    type:DataTypes.STRING,
    allowNull:true,
   },
   Price:{
    type:DataTypes.INTEGER,
    allowNull:false,
   },
   Description:{
    type:DataTypes.STRING(100),
    allowNull:true,
   },
   FloorNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
});


export default Room;