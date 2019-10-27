const express = require('express');
const cors = require('cors');
const uuid = require('uuid/v5');

// Firebase init
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Express and CORS middleware init

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(cors());

const userId = (data) => {
    const string = `${data} ${new Date(Date.now())}`;

    return uuid(string, uuid.DNS);
};

app.post("/", (request, response) => {
    const {age, birthday, firstName, hobby, lastName} = request.body;

    return admin.database().ref('/users').push({age, birthday, firstName, hobby, lastName})
        .then(() => {
            return response.status(200).send({age, birthday, firstName, hobby, lastName})
        }).catch(error => {
            console.error(error);
            return response.status(500).send('Oh no! Error: ' + error);
        });
});

app.get("/", (request, response) => {
    return admin.database().ref().on("value", snapshot => {
        return response.status(200).send(snapshot.val());
    }, error => {
        console.error(error);
        return response.status(500).send('Oh no! Error: ' + error);
    });
});

exports.users = functions.https.onRequest(app);

exports.addUserId = functions.database.ref('/users/{pushID}')
    .onCreate((snapshot) => {
        const userData = snapshot.val();

        return snapshot.ref.update({
            id: userId(userData['lastName']),
        });
    });