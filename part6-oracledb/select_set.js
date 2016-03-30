
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

var rowCount = 0;

oracledb.getConnection(
  {
    user          : dbConfig.user,
    password      : dbConfig.password,
    connectString : dbConfig.connectString
  },
  function(err, connection)
  {
    if (err) { console.error(err.message); return; }
    connection.execute(
      "SELECT employee_id, last_name " +
        "FROM   employees " +
        "WHERE ROWNUM < 11 " +
        "ORDER BY employee_id",
      [], // no bind variables
      { resultSet: true }, // return a result set.  Default is false
      function(err, result)
      {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        console.log(result);
        fetchOneRowFromRS(connection, result.resultSet);
      });
  });

function fetchOneRowFromRS(connection, resultSet)
{
  resultSet.getRow( // get one row
    function (err, row)
    {
      if (err) {
        console.error(err.message);
        doClose(connection, resultSet); // always close the result set
      } else if (!row) {                // no rows, or no more rows
        doClose(connection, resultSet); // always close the result set
      } else {
        rowCount++;
        console.log("fetchOneRowFromRS(): row " + rowCount);
        console.log(row);
        fetchOneRowFromRS(connection, resultSet);
      }
    });
}

function doRelease(connection)
{
  connection.release(
    function(err)
    {
      if (err) { console.error(err.message); }
    });
}

function doClose(connection, resultSet)
{
  resultSet.close(
    function(err)
    {
      if (err) { console.error(err.message); }
      doRelease(connection);
    });
}
