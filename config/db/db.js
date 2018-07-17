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
  // get the client
//   pool.getConnection(function(err, conn) {
//     //if(err) throw err;
//     //console.log(conn);
//     //conn.query();
//     pool.releaseConnection(conn);
//  })
  // query database
  //const [rows, fields] = await connection.execute('SELECT * FROM `table` WHERE `name` = ? AND `age` > ?', ['Morty', 14]);
  // pool.getConnection(function(err, conn) {
  //   if (err) {
  //       console.log(err);
  //   }
  //   console.log("Conectado ao db!")
  //   // if (err) throw err; // not connected!
  //   // // Use the connection
  //   // connection.query('SELECT something FROM sometable', function (error, results, fields) {
  //   //   res(results);
  //   //   connection.release();
  //   //   if (error) throw error;
  //   // });
  // });

});

// connection.release();
