'use strict';

const http=require('http');
const express=require('express');
const path=require('path');

const app=express();

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const server=http.createServer(app);

const PersonDataStorage=require('./dataStorage.js');
const dataStorage=new PersonDataStorage();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'pageviews'));

app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req,res)=>
    res.sendFile(path.join(__dirname,'public','menu.html'))
);

app.get('/all', (req,res)=> dataStorage.getAll()
    .then(result => res.render('allPersons',{result}))
    .catch(err => sendErrorPage(res, err.message))
);

app.get('/getperson', (req,res)=>
    res.render('getPerson', {title:'Get', header:'Get',
                             action:'/getperson'})
);

app.post('/getperson', (req,res)=>{
    if(!req.body) sendErrorPage(res,'Not found');
    const customerId=req.body.customerId;
    dataStorage.get(customerId)
        .then(person => res.render('personPage',{result: person}))
        .catch(error=>sendErrorPage(res,error.message));
});

app.get('/inputform', (req,res)=>{
    res.render('form',{
        header:'Add a new person',
        action:'/insert',
        customerId:{value:'', readonly:''},
        firstname:{value:'', readonly:''},
        lastname:{value:'', readonly:''},
        address:{value:'', readonly:''},
        favoritIceCream:{value:'', readonly:''}
    })
});

app.post('/insert', (req,res)=>{
    if(!req.body) sendErrorPage(res,'Not found');
    dataStorage.insert(req.body)
        .then(message => sendStatusPage(res,message))
        .catch(error=> sendErrorPage(res,error.message));
});

app.get('/updateform', (req,res)=>{
    res.render('form', {
        header:'Update person data',
        action:'/updatedata',
        customerId:{value:'',readonly:''},
        firstname:{value:'',readonly:'readonly'},
        lastname:{value:'', readonly:'readonly'},
        address:{value:'', readonly:'readonly'},
        favoritIceCream:{value:'',readonly:'readonly'}
    });
})

app.post('/updatedata', async (req,res)=>{
    const customerId=req.body.customerId;
    try{
        const person=await dataStorage.get(customerId);
        res.render('form', {
            header:'Update person data',
            action:'/updateperson',
            customerId:{value:person.customerId, readonly:'readonly'},
            firstname:{value:person.firstname, readonly:''},
            lastname:{value:person.lastname, readonly:''},
            address:{value:person.address, readonly:''},
            favoritIceCream:{value:person.favoritIceCream, readonly:''}
        });
    }
    catch(err) {
        sendErrorPage(res,err.message);
    }
});

app.post('/updateperson', (req,res)=>{
    if(!req.body) sendErrorPage(res,'Not found');
    dataStorage.update(req.body)
        .then(message=>sendStatusPage(res,message))
        .catch(error=>sendErrorPage(res, error.message));
});

app.get('/deleteperson', (req,res)=>
    res.render('getPerson',{title:'Remove', header:'Remove',action:'/deleteperson'})
);

app.post('/deleteperson', (req,res)=>{
    if(!req.body) sendErrorPage(res,'Not found');
    dataStorage.delete(req.body.customerId)
        .then(message=>sendStatusPage(res,message))
        .catch(error=>sendErrorPage(res,error.message));
});


server.listen(port, host, ()=>
    console.log(`Server ${host} is server at port ${port}.`)
);

function sendErrorPage(res,message) {
    res.render('statusPage',{title:'Error',
                             header:'Error',
                             message:message});
}
function sendStatusPage(res,message) {
    res.render('statusPage', {title:'Status',
                              header:'Status',
                              message:message});
}
