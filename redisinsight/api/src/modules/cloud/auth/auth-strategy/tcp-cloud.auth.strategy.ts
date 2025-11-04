import { Injectable, Logger } from '@nestjs/common';
import { createServer, Server } from 'net';
import { CloudAuthStrategy } from './cloud-auth.strategy';
import { CloudAuthService } from '../cloud-auth.service';

@Injectable()
export class TcpCloudAuthStrategy extends CloudAuthStrategy {
  private authPort = process.env.TCP_LOCAL_CLOUD_AUTH_PORT
    ? parseInt(process.env.TCP_LOCAL_CLOUD_AUTH_PORT)
    : 5542;

  private server: Server;

  private readonly logger = new Logger('TcpCloudAuthStrategy');

  constructor(private readonly cloudAuthService: CloudAuthService) {
    super();

    this.initServer();
  }

  private initServer() {
    this.server = createServer((socket) => {
      socket.setEncoding('utf8');

      socket.on('data', async (data) => {
        try {
          this.logger.debug(`Received raw data: ${data.toString()}`);
          const { action, options } = JSON.parse(data.toString());
          this.logger.debug('Parsed request:', { action, options });

          if (action === 'getAuthUrl') {
            try {
              const url = await this.cloudAuthService.getAuthorizationUrl(
                options.sessionMetadata,
                options.authOptions,
              );
              this.logger.debug('Generated URL:', url);
              socket.write(JSON.stringify({ success: true, url }));
            } catch (err) {
              this.logger.error('Error getting authorization URL:', err);
              socket.write(
                JSON.stringify({
                  success: false,
                  error: err.message,
                  details: err.stack,
                  context: { action, options }, // Add the context to help debug
                }),
              );
            }
          } else if (action === 'handleCallback') {
            try {
              this.logger.debug('Handling callback with query:', options.query);
              const result = await this.cloudAuthService.handleCallback(
                options.query,
              );
              socket.write(JSON.stringify({ success: true, result }));
            } catch (err) {
              this.logger.error('Error handling callback:', err);
              socket.write(
                JSON.stringify({
                  success: false,
                  error: err.message,
                  details: err.stack,
                }),
              );
            }
          }
        } catch (err) {
          this.logger.error('Error processing request:', err);
          socket.write(
            JSON.stringify({
              success: false,
              error: err.message,
              details: err.stack,
            }),
          );
        }
        socket.end();
      });

      socket.on('end', () => {
        this.logger.debug('Client connection ended');
      });

      socket.on('error', (err) => {
        this.logger.error('Socket error:', err);
      });
    });

    this.server.listen(this.authPort, () => {
      this.logger.log(`TCP server listening on port ${this.authPort}`);
    });

    this.server.on('error', (err) => {
      this.logger.error('Server error:', err);
    });
  }
}
