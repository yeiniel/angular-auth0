import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, shareReplay, concatMap, map } from 'rxjs/operators';
import createAuth0Client, { Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { OptionsToken } from './options.token';

/** Auth0 service
 *
 * Wraps @auth0/auth0-spa-js:Auth0Client into an observable angular service.
 */
@Injectable()
export class Auth0Service {

  public auth0Client$: Observable<Auth0Client> = from(
    createAuth0Client(this.options)
  ).pipe(
    shareReplay(1),
    catchError(err => throwError(err))
  );

  /** Whether or not the user is authenticated */
  public isAuthenticated$: Observable<boolean> = this.auth0Client$.pipe(
    concatMap(client => from(client.isAuthenticated()))
  );

  public profile$: Observable<unknown> = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.getUser()))
  );

  constructor(@Inject(DOCUMENT) protected document: Document,
              @Inject(OptionsToken) protected options: Auth0ClientOptions) { }

  /** Login
   *
   * @param appState Data to make it available during callback auth handling
   */
  public login(appState?: unknown): void {
    this.auth0Client$
      .pipe(concatMap(client => from(client.loginWithRedirect({ appState }))))
      .subscribe();
  }

  /** Logout */
  public logout(returnTo?: string): void {
    // Ensure Auth0 client instance exists
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log out
      client.logout({
        client_id: this.options.client_id,
        returnTo: returnTo || `${this.document.location.origin}`
      });
    });
  }

  /** Handle redirect callback after authentication
   *
   * @param path: URL path segment including query parameters
   */
  public handleRedirectCallback(path: string): Observable<{ isAuthenticated: boolean, appState: unknown }> {

    // return early if no query parameters required
    if (!path.includes('code=') || !path.includes('state=')) {
      return of({ isAuthenticated: false, appState: null });
    }

    return this.auth0Client$.pipe(
      concatMap(client => from(client.handleRedirectCallback(path))),
      concatMap(redirectLoginResult =>
        this.isAuthenticated$.pipe(map(isAuthenticated =>
          ({ isAuthenticated, appState: redirectLoginResult.appState })))
      )
    );
  }
}
