# Queue-s_clusterize
## Description

**This fragment shows the basic distribution of a high-load request flow, which is based on tasks requiring non-blocking I/O**

## business logic of the module
1. Setting up RMQ via docker.compose
```
version: '3'
services:
  rabbitMQ:
    image: rabbitmq:3-management
    container_name: rabbitmq_untitled8
    hostname: rabbitmq
    volumes:
      - /var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    env_file:
      - .env
    environment:
      - RABBITMQ_DEFAULT_USER = user
      - RABBITMQ_DEFAULT_PASSWORD = user
```
2. Configuring publisher to send a message to a queue
```
import amqp, {Channel, ChannelWrapper} from 'amqp-connection-manager';
export const initConnectionRMQ = async ()=>{
    return new Promise<ChannelWrapper>(function (resolve, reject) {
        const connection = amqp.connect('amqp://quest:quest@localhost')
        const channel = connection.createChannel()
        channel.assertQueue('test_queue', {durable: false, exclusive: true})
        resolve(channel);
    })
}
export const sendMessage = async (msg: string)=> {
    const channel = await initConnectionRMQ()
    channel.sendToQueue('test_queue', Buffer.from(msg)).then(()=>{
        console.log('message sent')}).catch((e: Error)=>{
        console.log(`message not sent, e: ${e}`)})
}
```
3. Setting up a consumer to receive a message from a queue
```
import amqp from 'amqp-connection-manager';
import {initConnectionRMQ} from '../../../api/src/queue/publisher.js';

const connection = amqp.connect('amqp://localhost')
const channel = connection.createChannel()
const queue = 'test_queue'
await channel.assertQueue('test_queue')

export const receiveMessage = async (msg: any)=> {
    const channel = await initConnectionRMQ()
    channel.consume(queue, msg).then(()=>{
        console.log(`message received: ${msg}`)}).catch((e: Error)=>{
        console.log(`error:${e}`)})
}
```
4. clustering of the recipient for further distribution of tasks among service copies 
```
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
        //qwe
    })
} else {
    accountsBootstrap()
}
```
***IMPORTANT***
1. This distribution was written using the express framework, since in this logic there is not much difference in using the framework
2. Database connection presentation (postgres) omitted