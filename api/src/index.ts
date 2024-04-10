import 'reflect-metadata'
import express from 'express'
import {myDataSource} from './db/data-source.js';
import {initConnectionRMQ, sendMessage} from './queue/publisher.js';
import bodyParser from 'body-parser';

async function bootstrap() {
    await myDataSource.initialize().then(()=>{
        console.log(`init db success`)
    }).catch((e)=>{
        console.log(`error: ${e}`)
    })
    // await initConnectionRMQ().then(()=>{
    //     console.log(`RMQ connected`)}).catch((e: Error)=>{
    //     console.log(`e: ${e}`)})
    const app = express()
    const port = 8000
    initConnectionRMQ().then(()=>{
        console.log(`RMQ connected`)}).catch((e: Error)=>{
        console.log(`e:${e}`)})
    app.use(express.json())
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        }),
    );
    app.post('/createTask', function (req, res, next) {
        const body = JSON.stringify(req.body)
        sendMessage(body).then(()=>{console.log(`data sent: ${body}`)}).then(()=>{res.send('success')})
    })
    app.listen(port, ()=>{
        console.log(`Primary server started: ${port}`)})
}
bootstrap()

