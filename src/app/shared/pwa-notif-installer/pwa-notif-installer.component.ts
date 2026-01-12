import { Platform } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-pwa-notif-installer',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './pwa-notif-installer.component.html',
  styleUrls: ['./pwa-notif-installer.component.scss']
})
export class PwaNotifInstallerComponent implements OnInit {

  // pwa
  isOnline: boolean;
  modalVersion: boolean;
  modalPwaEvent: any;
  modalPwaPlatform: string|undefined;

  isIOS: boolean;
  isAndroid: boolean;

  constructor(
    private swUpdate: SwUpdate,
    private platform: Platform,
  ) { 
    this.isOnline = false;
    this.modalVersion = false;
    
    this.isIOS = this.platform.IOS;
    // The CDK has specific checks for Chrome on Android
    this.isAndroid = this.platform.ANDROID; 

    // console.log('Is iOS:', this.isIOS);
    // console.log('Is Android:', this.isAndroid);
    if(this.isAndroid){
      this.loadModalPwa()
    }

    if(this.isIOS){
      this.loadModalPwa()
    }
  }

  ngOnInit(): void {
    this.initPwa();
  }



initPwa(){
  this.updateOnlineStatus();

    window.addEventListener('online',  this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt: any) => {
          console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.modalVersion = true;
        }),
      );
    }

    this.loadModalPwa();
}

private updateOnlineStatus(): void {
  this.isOnline = window.navigator.onLine;
  console.info(`isOnline=[${this.isOnline}]`);
}

public updateVersion(): void {
  this.modalVersion = false;
  window.location.reload();
}

public closeVersion(): void {
  this.modalVersion = false;
}

private loadModalPwa(): void {
  if (this.platform.ANDROID) {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.modalPwaEvent = event;
      this.modalPwaPlatform = 'ANDROID';
    });
  }

  if (this.platform.IOS && this.platform.SAFARI) {
    const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
    if (!isInStandaloneMode) {
      this.modalPwaPlatform = 'IOS';
    }
  }
}

public addToHomeScreen(): void {
  this.modalPwaEvent.prompt();
  this.modalPwaPlatform = undefined;
}

public closePwa(): void {
  this.modalPwaPlatform = undefined;
}
// pwa

}
