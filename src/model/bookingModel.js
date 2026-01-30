import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";

const  Booking = sequelize.define('Booking',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Rooms',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },

      total_amount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
      },
      booking_date:{
        type:DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      check_in_completed:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      check_out_complete:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      cancellation_date:{
        type:DataTypes.DATE,
        allowNull:true
      },
      cancellation_reason:{
        type:DataTypes.STRING,
        allowNull:true
      },
     
})

export default Booking;