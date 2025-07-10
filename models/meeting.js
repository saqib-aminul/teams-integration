import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const Meeting = sequelize.define("Meeting", {
  subject: DataTypes.STRING,
  startDateTime: DataTypes.DATE,
  endDateTime: DataTypes.DATE,
  joinUrl: DataTypes.STRING
});

await sequelize.sync();
export { sequelize, Meeting };
