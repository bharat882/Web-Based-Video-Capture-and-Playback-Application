const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
});

conn.connect((err) => {
    if (err) throw err;
    console.log('Connection Successful');

    conn.query("CREATE DATABASE IF NOT EXISTS CN_LabAssignment2", function(err, data){
        if (err)
            throw err;
    });

    conn.query('USE CN_LabAssignment2', (err, result) => {
        if (err)
            throw err;
    });

    let sql = `CREATE TABLE IF NOT EXISTS videos(
                id int primary key auto_increment,
                path varchar(255) not null
                )`;

    conn.query(sql, function(err, results, fields) {
        if (err)
            throw err;
    });
});

module.exports = conn;