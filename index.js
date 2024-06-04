const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');
require('dotenv').config()

app.use(express.json())
app.use(cors({
    origin: [
        "http://localhost:5173",
        // "https://cardoctor-bd.web.app",
        // "https://cardoctor-bd.firebaseapp.com",
    ]
})
);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.bls3tyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        const database = client.db("contestDB");
        const userCollection = database.collection("users");
        const contestCollection = database.collection("contest");
        const commentCollection = database.collection("comment");

        app.post('/jwt', async (req, res) => {
            const user = req.body
            console.log(user);
            const token = await jwt.sign(user, process.env.ACCESS_TOKEN_SECURE, { expiresIn: '1h' });
            res.send({ token })
        })

        app.post('/users', async (req, res) => {
            const users = req.body
            const result = await userCollection.insertOne(users)
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/users/blocking/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: 'Block'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.patch('/users/unblocking/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: 'Active'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'Admin'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.patch('/users/contest/creator/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'Creator'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'User'
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // Contest Api

        app.post('/contest', async (req, res) => {
            const contestInfo = req.body
            const result = await contestCollection.insertOne(contestInfo)
            res.send(result)
        })

        app.get('/contest', async (req, res) => {
            const result = await contestCollection.find().toArray()
            res.send(result)
        })

        // pagination api
        app.get('/contests', async (req, res) => {
            console.log(req.query);
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            console.log(page,size);
            const result = await contestCollection.find()
                .skip(page * size)
                .limit(size)
                .toArray()
            res.send(result)
        })

        app.get('/manage-contest', async (req, res) => {
            const count = await contestCollection.estimatedDocumentCount()
            res.send({ count })
        })


        app.patch('/contest/:id', async (req, res) => {
            const id = req.params.id
            const count = req.body
            console.log(count.count);
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    participantsCount: count.count
                },
            };
            const result = await contestCollection.updateOne(query, updateDoc)
            res.send(result)

        })

        app.patch('/my-contest/update/:id', async (req, res) => {
            const id = req.params.id
            const data = req.body
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    contestName: data.contestName,
                    contestImg: data.contestImg,
                    contestDes: data.contestDescription,
                    taskDetails: data.taskDeatils,
                    contestTag: data.contestTag,
                    contestPrice: data.contestPrice,
                    deadLine: data.deadLine,
                    prizeMoney: data.prizeMoney
                },
            };
            const result = await contestCollection.updateOne(query, updateDoc)
            res.send(result)
        })
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await contestCollection.findOne(query)
            res.send(result)
        })

        app.patch('/contest/admin/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: 'accept'
                },
            };
            const result = await contestCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        app.delete('/my-contest/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await contestCollection.deleteOne(filter)
            res.send(result)
        })

        app.delete('/contest/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await contestCollection.deleteOne(filter)
            res.send(result)
        })

        // Comment Api

        app.post('/comments', async (req, res) => {
            const commentInfo = req.body
            const result = await commentCollection.insertOne(commentInfo)
            res.send(result)
        })

        app.get('/comments/:email', async (req, res) => {
            const email = req.params.email
            const query = { creatorEmail: email }
            const result = await commentCollection.find(query).toArray()
            res.send(result)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Contest Server Is Running...........')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})