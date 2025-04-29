import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: "metro.proxy.rlwy.net",
    user: "root",
    password: "CaCCQPMlJGquCrnImlacApdzKmACfHui",
    port: 41613,
    database: "railway",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}); 