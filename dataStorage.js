'use strict';
const Database=require('./database.js');

const fatalError = err => new Error(`Sorry! ${err.message}`);

const getAllcustomers=
    'SELECT customerId, firstname,lastname,address,favoritIceCream FROM customer';

const getcustomer=
    'SELECT customerId,firstname,lastname,address,favoritIceCream FROM customer '+
    'WHERE customerId=?';
const insertcustomer=
'INSERT INTO customer (customerId, firstname,lastname,address,favoritIceCream) '+
'values(?,?,?,?,?)';
const updatecustomer=
    'UPDATE customer SET firstname=?, lastname=?, address=?, favoritIceCream=? WHERE customerId=?';

const deletecustomer='DELETE FROM customer WHERE customerId=?';

const customervalues = customer => [
  +customer.customerId,customer.firstname,customer.lastname,
   customer.address,customer.favoritIceCream];

const customerValuesForUpdate = customer =>[
    customer.firstname, customer.lastname,customer.address,
    customer.favoritIceCream, +customer.customerId
];

module.exports=class customerDataStorage{
    constructor(){
        this.customerDb=new Database({
            'host':'localhost',
            'port':3306,
            'user':'root',
            'password':'',
            'database':'customerdb'
        })
    }

    getAll() {
        return new Promise(async (resolve, reject)=>{
            try{
                const result= await this.customerDb.doQuery(getAllcustomers);
                resolve(result.queryResult);
            }
            catch(err) {
                reject(fatalError(err));
            }
        })
    }
    get(customerId) {
        return new Promise(async (resolve,reject) => {
            try{
                const result=await this.customerDb.doQuery(getcustomer,[+customerId]);
                if(result.queryResult.length===0){
                    reject(new Error('customer unknown'));
                }
                else{
                    resolve(result.queryResult[0]);
                }
            }
            catch(err){
                reject(new Error(`Sorry! Error. ${err.message}`));
            }
        });
    }

    insert(customer) {
        return new Promise(async (resolve,reject)=>{
            try{
                const result=
                    await this.customerDb.doQuery(insertcustomer,customervalues(customer));
                if(result.queryResult.rowsAffected===0) {
                    reject(new Error('No customer was added'));
                }
                else {
                    resolve(`customer with id ${customer.customerId} was added`);
                }
            }
            catch(err) {
                reject(new Error(`Sorry! Error. ${err.message}`));
            }
        });
    }

    update(customer) {
        return new Promise(async (resolve, reject)=>{
            try{
                const result= await this.customerDb.doQuery(updatecustomer,
                                                          customerValuesForUpdate(customer));
                if(result.queryResult.rowsAffected===0) {
                    resolve('No data was updated');
                }
                else {
                    resolve(`Data of customer with id ${customer.customerId} was updated`);
                }
            }
            catch(err){
                reject(new Error('Sorry...'));
            }
        })
    }

    delete(customerId) {
        return new Promise(async (resolve, reject) => {
            try{
                const result= await this.customerDb.doQuery(deletecustomer, [+customerId]);
                if(result.queryResult.rowsAffected===0) {
                    resolve('No customer with given Id. Nothing deleted.');
                }
                else {
                    resolve(`customer with Id ${customerId} was deleted.`);
                }
            }
            catch(err){
                reject(new Error('Sorry...'));
            }
        });
    }

}; //end of the class
