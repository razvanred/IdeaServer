const express = require('express');
const app = express();
const port = process.env.port || 8000;
const bodyParser = require('body-parser');
const mysql = require('mysql');
const url = require('url');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ideatracker.group@gmail.com',
        pass: 'Condizionatore890'
    }
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

const connection = mysql.createConnection({
    "host": "192.168.64.2",
    "user": "user",
    "password": "password",
    "database": "IdeaTrackerDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Got it!");
    next();
});

function next() {
    app.route('/')
        .get((request, response) => {
            console.log("Connected");

            try {
                console.log(request.body.username);
                //throw err;
                response.send({status: true});
            } catch (err) {
                console.log(err);
                response.send({status: false});
            }
        })
        .post((request, response) => {
            response.send({a: 678});
        });

    app.route('/confirm')
        .get((request, response) => {
            const query = url.parse(request.url, true).query;

            connection.query('UPDATE user SET confirm=1 where username="' + query.username + '" AND password="' + query.password + '"', (err => {
                if (err) {
                    response.send({status: false, errorCode: 300});
                    return console.error("Not confirmed: %s", err);
                } else
                    response.send({status: true});
            }));
        });

    app.route('/user')
        .put((request, response) => {

            const mail = request.body.mail.replace("'", "\'");
            const username = request.body.username.replace("'", "\'");
            const password = request.body.password.replace("'", "\'");

            require('email-existence').check(mail, (err, res) => {
                if (err) {
                    console.log("Mail doesn't exist: %s", err);
                    return response.send({status: false, errorCode: 100});
                } else {
                    const mailOptions = {
                        from: 'IdeaTracker Staff <ideatracker.group@gmail.com>',
                        to: mail,
                        subject: 'Confirm your registration',
                        html: 'Dear ' + username + ', ' + '<a href="http://192.168.0.106:' + port + '/confirm/?username=' + username + '&password=' + password + '">click here to confirm</a>'
                    }

                    connection.query("INSERT INTO user VALUES ('" + mail + "','" + username + "','" + password + "','" + request.body.nome.replace("'", "\'") + "','" + request.body.cognome.replace("'", "\'") + "',0)", (err) => {
                        if (err) {
                            console.error("Usual error: %s", err);
                            console.log('ok but why? ' + response);
                            return response.send({status: false, errorCode: 101});
                        } else {
                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err)
                                    console.log(err);
                                else
                                    console.log(info);
                            });
                            response.send({status: true});
                        }
                    });
                }
            });


        })
        .get((request, response) => {

            const query = url.parse(request.url, true).query;

            console.log("Loggin in: %s with passkey %s", query.username, query.password);

            connection.query("SELECT * FROM user where username='" + query.username.replace("'", "\'") + "'", (err, result, fields) => {
                if (err || typeof result === 'undefined' || result.length <= 0 || result[0].password !== query.password) {
                    console.error("Login failed: %s", err);
                    response.send({status: false, errorCode: 200});
                } else {
                    if (result[0].confirm === 0) {
                        console.error("Mail not confirmed: %s", err);
                        response.send({status: false, errorCode: 201});
                    } else {

                        connection.query("SELECT COUNT(*) as count FROM app", (err, r, fields) => {
                            if (err) {
                                console.error("Cannot count applications: %s", err);
                                response.send({status: false, errorCode: 201});
                            } else {
                                response.send({
                                    status: true, data: {
                                        nome: result[0].nome,
                                        cognome: result[0].cognome,
                                        mail: result[0].mail,
                                        appcount: r[0].count
                                    }
                                });
                            }
                        });

                    }
                }
            });

        });

    app.route('/apps')
        .get((request, response) => {
            connection.query("SELECT * FROM app", (err, results, fields) => {
                response.send(results);
            });
        });

    app.listen(port, function () {
        console.log("Listening on port %d", port);
    });
}