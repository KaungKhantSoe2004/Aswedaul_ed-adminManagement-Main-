import mysql, { Pool } from "mysql2/promise";

export const db: Pool = mysql.createPool({
  host: "localhost",
  user: "zlllzpsz_aswedaul_ed_a",
  password: "y5#3Wq_ho_U(AV{2",
  database: "zlllzpsz_aswedaul_ed_a",
});
