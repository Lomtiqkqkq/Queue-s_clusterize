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