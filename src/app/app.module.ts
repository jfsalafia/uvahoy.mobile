import { NgModule, ErrorHandler, Injectable, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { HoyPage } from '../pages/hoy/hoy';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ChartsModule } from 'ng2-charts';
import { IndicadoresData} from  '../providers/indicadores-data';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { ENV } from '@app/env';
import { AppVersion } from '@ionic-native/app-version';


// These are all imports required for Pro Client with Monitoring & Deploy,
// feel free to merge into existing imports above.
import { Pro } from '@ionic/pro';

Pro.init('52c2709d', {
  appVersion: '0.0.1'
})

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    if(ENV.mode == 'Production') {
      Pro.monitoring.handleNewError(err);
      // Remove this if you want to disable Ionic's auto exception handling
      // in development mode.
      this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
    }
  }
}

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    HoyPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    ChartsModule,
    HttpClientModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    HoyPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    IonicErrorHandler,
    {provide: ErrorHandler, useClass:MyErrorHandler  },
    IndicadoresData,
    HttpClient,
    AppVersion
  ]
})
export class AppModule {}
