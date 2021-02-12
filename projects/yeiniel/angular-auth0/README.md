# AngularAuth0
[![Build Status](https://travis-ci.com/yeiniel/angular-auth0.svg?branch=main)](https://travis-ci.com/yeiniel/angular-auth0)
[![Coverage Status](https://coveralls.io/repos/github/yeiniel/angular-auth0/badge.svg?branch=main)](https://coveralls.io/github/yeiniel/angular-auth0?branch=main)

AngularAuth0 is an [Angular](https://angular.io) module that provides 
authentication using [Auth0](https://auth0.com).

## Installation 
The module can be installed using the following command:

```bash
npm install @yeiniel/angular-auth0 --save
```

## Usage
Once the module has been installed you can add it as a dependency of the app 
module as follows:

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Auth0Module } from '@yeiniel/ngrx-auth0';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    Auth0Module.forRoot({
      domain: 'xxxx.auth0.com',
      client_id: 'yyyyyyyy',
      redirect_uri: `${window.location.origin}`
    })
  ],
  providers: [],
  bootstrap: [...]
})
export class AppModule { }
```

Once the application has been configured to use the module you can start using 
the service provided to interact with Auth0 (Auth0Service).

The following code is an example of a component that implement the UI used to
interact with the module features:

```js
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Auth0Service } from '@yeiniel/angular-auth0';

@Component({
  selector: 'app-login-logout',
  template: `
  <ng-container [ngSwitch]="isAuthenticated">
    <button *ngSwitchCase="false" (click)="auth0Service.login({ target: location.path(true) })">login</button>
    <button *ngSwitchCase="true" (click)="auth0Service.logout()">logout</button>
  </ng-container>
  `,
  styleUrls: ['./login-logout.component.scss']
})
export class LoginLogoutComponent implements OnInit {

  public isAuthenticated = false;

  constructor(public location: Location, public auth0Service: Auth0Service) { }

  ngOnInit(): void {
    this.auth0Service.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }
}
```
