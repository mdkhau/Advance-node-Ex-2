'use strict';

const mariadb=require('mariadb');

module.exports= class Database{
    constructor(options){
        this.options=options;
    }

    doQuery(sql,parameters){
        return new Promise(async (resolve,reject) =>{
          let dbConnection;
          try{
              dbConnection=await mariadb.createConnection(this.options);
              const queryResult = await dbConnection.query(sql,parameters);
              if(typeof queryResult === 'undefined'){
                  reject(new Error('QueryError'));
              }
              else if(typeof queryResult.affectedRows === 'undefined') {
                  delete queryResult.meta;
                  resolve({
                      queryResult,
                      resultSet: true
                  });
              }
              else {
                  resolve({
                      queryResult:{
                          rowsAffected: queryResult.affectedRows,
                          numberAdded: queryResult.insertId,
                          status: queryResult.warningStatus
                      },
                      resultSet:false
                  });
              }
          }
          catch(err) {
              reject(new Error('SQL-Error: '+err.message));
          }
          finally{
             if(dbConnection) dbConnection.end(); 
          }
     
        });
    }

};