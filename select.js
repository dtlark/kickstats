/* Copyright (c) 2015, 2020, Oracle and/or its affiliates. All rights reserved. */

/******************************************************************************
 *
 * You may not use the identified files except in compliance with the Apache
 * License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * NAME
 *   select2.js
 *
 * DESCRIPTION
 *   Executes queries to show array and object output formats.
 *   Gets results directly without using a ResultSet.
 *
 *   This example uses Node 8's async/await syntax.
 *
 ******************************************************************************/



const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

// Oracledb properties are applicable to all connections and SQL
// executions.  They can also be set or overridden at the individual
// execute() call level

// This script sets outFormat in the execute() call but it could be set here instead:
//
// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


var globalVariable={
  x: 0
};


async function queryData() {

  let connection;

  try {
    // Get a non-pooled connection

    connection = await oracledb.getConnection(dbConfig);

    // The statement to execute
    const sql =
        `SELECT * FROM students`;

    let result;

    // Default Array Output Format
    result = await connection.execute(sql);
    console.log("----- Banana Farmers (default ARRAY output format) --------");
    console.log(result.rows);
    console.log(result.rows[0][2]);


  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        // Connections should always be released when not needed
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

queryData();