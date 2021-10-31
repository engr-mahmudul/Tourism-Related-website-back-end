const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbhkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('Connected to database');
        const database = client.db('travelingWorld');
        const servicesCollection = database.collection('services');
        const orderCollection = database.collection('orders');
        const extraServicesCollection = database.collection('extraServices');
        //GET API
        app.get('/services', async (req, res) => {
            const cusor = servicesCollection.find({}); // sob find krote chaile khali object dilei hobe
            const services = await cusor.toArray();
            res.send(services)

        });
        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log("hiiting post", service);
            const result = await servicesCollection.insertOne(service);
            res.json(result);

        });
        // GET Dynamic API
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id; // Dynamic ID ta nicche
            // console.log('hiiting to the backend id=', id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            // console.log(service)
            res.json(service)

        });
        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });
        //Get All orders
        app.get('/orders/allUsers', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })
        //Get All Etra Services
        app.get('/extraServices', async (req, res) => {
            const cursor = extraServicesCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })
        // Use POST to get data by keys
        app.get('/userOrders/:email', async (req, res) => {
            const getemail = req.params.email;
            // console.log('hitting to the backend', getemail);
            const query = { email: getemail }
            const products = await orderCollection.find(query).toArray();
            res.send(products);
        });
        //Update orders
        app.put('/userOrders/:id', async (req, res) => {
            const id = req.params.id;
            console.log("hitting update server", id)
            // const newUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'confirm'
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //Delete API
        app.delete('/userOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Traveling World Is Runnig!')
})

app.listen(port, () => {
    console.log('lisiting to port', port)
})
