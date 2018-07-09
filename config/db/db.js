var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "35.238.249.86",
  user: "root",
  password: "root",
  database: "usuarios"
});

module.exports = async (query) => new Promise((Resolve, Reject) => {
  pool.query(query, function (error, results, fields) {
    if (error) throw error;
    Resolve(results);
  });
});