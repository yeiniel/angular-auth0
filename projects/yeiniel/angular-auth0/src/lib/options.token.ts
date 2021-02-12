import { InjectionToken } from '@angular/core';
import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

/** Options Token
 *
 * Injection token used to pass Auth0ClientOptions using DI.
 */
export const OptionsToken =
    new InjectionToken<Auth0ClientOptions>('Auth0ClientOptions');
