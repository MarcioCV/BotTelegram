var mysql = require('mysql');

var con = mysql.createConnection({
  host: "35.238.249.86",
  user: "root",
  password: "root",
  database: "usuarios"
});

module.exports = () => new Promise((Resolve, Reject) => {

  con.connect(function(err) {

    if (err) throw err;

    Resolve((q) => new Promise((Resolve, Reject) => {
      con.query(q, (err, result) => {
        if(err) Reject(err);
        Resolve(result);
      });
    }));

  });

});