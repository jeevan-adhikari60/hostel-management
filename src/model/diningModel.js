import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
export const DiningSchedule = sequelize.define("DiningSchedule", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    day: {
        type: DataTypes.ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
        allowNull: false,
    },
    mealType: {
        type: DataTypes.ENUM('breakfast', 'lunch', 'snacks', 'dinner'),
        allowNull: false,
    },
    items: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            return JSON.parse(this.getDataValue('items') || '[]');
        },
        set(value) {
            this.setDataValue('items', JSON.stringify(value));
        }
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['day', 'mealType']
        }
    ]
});
