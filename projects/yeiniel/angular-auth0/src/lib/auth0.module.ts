import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { OptionsToken } from './options.token';
import { Auth0Service } from './auth0.service';

/** Auth0 module
 *
 * Provide all artifacts required for Auth0 integration.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class Auth0Module {

  static forRoot(options: Auth0ClientOptions): ModuleWithProviders<Auth0Module> {
    return {
      ngModule: Auth0Module,
      providers: [
        { provide: OptionsToken, useValue: options },
        Auth0Service
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: Auth0Module) {
    if (parentModule) {
      throw new Error(
        'Auth0Module is already loaded. Import it in the AppModule only');
    }
  }
}
