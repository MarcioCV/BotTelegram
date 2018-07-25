var mysql = require('mysql2');
var net = require('net');

const pool = mysql.createPool({
  host: "35.238.249.86",
  user: "root",
  password: "root",
  database: "usuarios",
  stream: function(opts) {
    var socket = net.connect(opts.config.port, opts.config.host);
    socket.setKeepAlive(true);
    return socket;
  }
});

module.exports = async (query) => new Promise((res, rej) => {
  pool.query(query, function (error, results, fields) {
    if (error) throw error;
    res(results);
  });
});

