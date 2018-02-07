//const http = require('http');
//const mysql = require('mysql');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ideatracker.group@gmail.com',
        pass: 'Condizionatore890'
    }
});

const mailOptions = {
    from: 'Bill Gates <razvan@its.me>', // sender address
    to: 'razvanred99@gmail.com', // list of receivers
    subject: 'A lot of money are waiting you', // Subject line
    html: '<h1>Trust me</h1>'// plain text body
};

require('email-existence').check(mailOptions.to, function (err, res) {

    if (err) return console.log("error: %s", err);

    if (res) {

        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err);
            else
                console.log(info);
        });

    }else return console.error("Mail doesn't exists");
});

/*const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:""
});

connection.connect(function(err){
    if(err) throw err;
    console.log("Connected");

    connection.query("USE IdeaDB;",function(err,result){
        if(err) throw err;
        console.log("RESULT: "+result)
    });

    const sql="INSERT INTO UTENTE VALUES ('razvan','pass','Razvan','Rosu');";
    connection.query(sql,function(err,result){
        if(err) throw err;
        console.log("RESULT: "+result);
    });
});


http.createServer(function(request,response){
    response.writeHead(200,{'Content-Type':'text/plain'});
    response.write('working');
    response.end();
}).listen(8000);*/