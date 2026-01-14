import mysql, { Pool } from "mysql2/promise";

export const db: Pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aswedaul_ed_admin",
});
