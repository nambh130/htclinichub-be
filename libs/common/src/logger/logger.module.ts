import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { MongoClient } from 'mongodb';
import pino from 'pino';

// Hàm ghi log ra nhiều stream
const multiWrite = (...streams: { write: (msg: string) => void }[]) => {
  return {
    write: (msg: string) => {
      streams.forEach((s) => {
        try {
          s.write(msg);
        } catch (e) {
          console.error('Error writing to log stream:', e);
        }
      });
    },
  };
};

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: async () => {
        const mongoClient = await MongoClient.connect('mongodb://mongo:27017');
        const collection = mongoClient
          .db('htclinics_logs_db')
          .collection('logs');

        const mongoStream = {
          write: (msg: string) => {
            try {
              const log = JSON.parse(msg);
              collection.insertOne(log).catch((err) => {
                console.error('❌ Failed to insert log to MongoDB:', err);
              });
            } catch (err) {
              console.error('❌ Failed to parse log message:', err);
            }
          },
        };

        const prettyStream = pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            ignore: 'pid,hostname,time',
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            messageFormat: '{context} - {msg}',
          },
        });

        return {
          pinoHttp: {
            timestamp: pino.stdTimeFunctions.isoTime,
            stream: multiWrite(mongoStream, prettyStream),
            serializers: {
              req: (req: any) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                headers: req.headers,
                remoteAddress: req.remoteAddress,
                remotePort: req.remotePort,
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
                headers: res.getHeaders?.() || res.headers,
              }),
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
