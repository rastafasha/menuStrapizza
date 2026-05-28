import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConectividadService {

  // Inicializamos con el estado actual del navegador
  private isOnlineSubject = new BehaviorSubject<boolean>(window.navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor(private toastr: ToastrService) {
    this.initConnectivityListeners();
  }

 private initConnectivityListeners() {
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline); // Notificamos a los componentes
      
      if (isOnline) {
        this.toastr.clear();
        this.toastr.success('Conexión restaurada');
      } else {
        this.toastr.error('Sin conexión', '', { disableTimeOut: true });
      }
    });
  }
}
