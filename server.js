import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'path'
import { WebSocketServer } from 'ws'
import { redisPublish, redisSubscribe } from './connection.js'

const PORT = process.env.PORT || 8000
const REDIS_CHANNEL = 'ws-messages'

redisSubscribe.subscribe(REDIS_CHANNEL)
redisSubscribe.on('message', (channel,message) => {
    if(channel == REDIS_CHANNEL) {
        weServer.clients.forEach((client) => {
            client.send(message.toString())
        })
    }
})

const httpServer = http.createServer(async function(req,res) {
    const indexFile = await fs.readFile(path.resolve(`./index.html`), 'utf-8')
    res.setHeader('Content-Type', 'text/html')
    return res.end(indexFile)
})
const weServer = new WebSocketServer({
    server: httpServer
})

weServer.on('connection',async (websocket) => {
    console.log(`websocket connection...`);
    websocket.on('message', async(data) => {
        console.log('web scoket msg recv. :: ', data.toString())
        await redisPublish.publish(REDIS_CHANNEL,data.toString())
    })
    
})

httpServer.listen(PORT, () => {
    console.log(`server running on port http://localhost:${PORT}`);
})