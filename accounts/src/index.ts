import cluster from 'cluster';
import * as os from 'os';
import express from 'express';
import {receiveMessage} from './queue/consumer.js';
import bodyParser from 'body-parser';
const numCpuS = os.availableParallelism()
async function accountsBootstrap() {
    const app = express()
    const port = 3000
    app.use(express.json())
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        }),
    );
    app.use (function (req, res, next) {
        const data = JSON.stringify(req.body)
        receiveMessage(data).then(()=>{
            console.log(`received: ${data}`)})
    })
    app.listen(port, ()=>{
        console.log(`subCluster running: ${port}, process: ${process.pid}`)})
}

if(cluster.isPrimary) {
    console.log(`primary running: ${process.pid}`)
    for (let i = 0; i< numCpuS -1; i++) {
        cluster.fork()
    }
    cluster.on('exit', (worker, code, signal)=>{
        console.log(`subCluster: ${worker.process.pid} died, code: ${code}, signal: ${signal}, restarting...`)
        cluster.fork()
    })
} else {
    accountsBootstrap()
}
