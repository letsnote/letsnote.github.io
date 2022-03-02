import { Injectable } from '@angular/core';
import { ConfigService } from '../setting/config.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  socket: WebSocket | undefined;
  constructor(private config: ConfigService) {
    
    config.keyObservable.subscribe((key) => {
      if(this.socket)
        this.socket.close();
      this.socket = new WebSocket(`wss://hypothes.is/ws?access_token=${key}`);
      this.socket.onmessage = (event) => {
      }
    })
   }
}
