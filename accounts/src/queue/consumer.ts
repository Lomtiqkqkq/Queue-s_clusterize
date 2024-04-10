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