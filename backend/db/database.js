import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: "turntable.proxy.rlwy.net",
    user: "root",
    password: "zAbgeCNfUOmgRMUjooltDVFfoifYOBXQ",
    port: 15309,
    database: "railway",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}); 