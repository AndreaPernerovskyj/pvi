const { MongoClient } = require('mongodb');

class Db {
    constructor() {
        this._connectionString = "mongodb://localhost:27017";
        this._client = new MongoClient(this._connectionString);
        this._db = null;
    }

    async connectToDb(dbName) {
        try {
            await this._client.connect();
            this._db = this._client.db(dbName);
            console.log("Mongo connected");
            return this._db;
        } catch (err) {
            console.error("Mongo connect fail", err);
        }
    }

    async closeConnection() {
        await this._client.close();
        console.log("Mongo connection closed");
    }
}

module.exports = { Db };
