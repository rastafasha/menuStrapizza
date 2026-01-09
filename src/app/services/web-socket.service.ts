import {EventEmitter, Injectable} from '@angular/core';
// import io from 'socket.io-client';
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: any;
  events = ['new-user', 'bye-user'];
  cbEvent: EventEmitter<any> = new EventEmitter<any>();

  public socketStatus = false;

  constructor() {
    // this.socket = io(environment.soketServer);
    this.checkStatus();
    this.listener();
  }

  checkStatus(){
    this.socket.on('connect', () => {
      console.log('Conectado al servidor');
      this.socketStatus = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.socketStatus = false;
    });
  }

  listener = () => {
    this.events.forEach(evenName => {
      this.socket.on(evenName, (data: any) => this.cbEvent.emit({
        name: evenName,
        data
      }));
    });
  };

  joinRoom = (data: any) => {
    this.socket.emit('join', data);
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
