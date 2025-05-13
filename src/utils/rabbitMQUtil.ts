import amqplib from "amqplib";
import { ThrowErrorMessage } from "./errorHandler";
import { RabbitMQConnData } from "../models/RabbitMQConnData";
class RabbitMQUtil{

    public channel: any;
    public connection: any;

    constructor(){        
        
    }

    public async EnsureCreateNewQueueInChannel(newQName: string){

        if(this.channel){
            //make sure the channel exists before consuming from it
            this.channel.assertQueue( newQName, {
                durable: false
            });
            //console.log(`asserted queue for: ${newQName}`);
        }else{
            ThrowErrorMessage(`OH NOES!! Failed to create queue: ${newQName}; channel is null in EnsureCreateNewQueueInChannel()`);
        }
       
    }

    public async Listen(callback:any, qName: string){
        //make sure the channel exists before consuming from it
        this.EnsureCreateNewQueueInChannel(qName);

        this.channel.consume(qName, function(ingress:any){
            // console.log(`rabbitMQUtil received a msg: ${ingress}`);
            callback(ingress.content.toString());
        },{
            noAck: true
        });
    }

    public async SendData(data: string, qName: string){
        this.channel = await this.connection.createChannel();
        //this.EnsureCreateNewQueueInChannel(qName)
        if(this.channel){
            // console.log(`--> sending: ${data}`);
            await this.channel.sendToQueue(qName, Buffer.from(data));        
        }else{
            ThrowErrorMessage(`OH NOES channel is null for queue: ${qName}`);
        }
        
    }

    public async ConnectQueue(connectionData: RabbitMQConnData){
        try{          
            // let opt={
            //     protocol: 'amqps',
            //     hostname: connectionData.hostAddress,
            //     port: 5671,
            //     username: connectionData.username,
            //     password: connectionData.password,
            //     vhost: connectionData.vhost
            // }
            let url = `amqps://${connectionData.username}:${connectionData.password}@${connectionData.hostAddress}:5671/${connectionData.vhost}`;
            console.log('attempting to connect to: ${url}');
            this.connection = await amqplib.connect(url);
            console.log('connected() complete');
            this.channel = await this.connection.createChannel();            
            console.assert(this.channel !== null, "channel is nuLL??");            
        }catch (error){
            console.log(error);
        }
    } 

}

export const RabbitMQUtilInstance = new RabbitMQUtil();