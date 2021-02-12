import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';
import { Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { Auth0Service } from './auth0.service';
import { OptionsToken } from './options.token';

@Injectable()
class TestableAuth0Service extends Auth0Service {
  /* utility method used to gain access to the auth0 client */
  public getAuth0Client$(): Observable<Auth0Client> {
    return this.auth0Client$;
  }
}

describe('Auth0Service', () => {
  let service: TestableAuth0Service;
  let options: Auth0ClientOptions;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: OptionsToken, useValue: {} },
        { provide: Auth0Service, useClass: TestableAuth0Service },
        { provide: DOCUMENT, useValue: {} }
      ]
    });
    service = TestBed.inject(Auth0Service) as TestableAuth0Service;
    options = TestBed.inject(OptionsToken);
    document = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create Auth0Client with the right options', async () => {
    const client = await service.getAuth0Client$().toPromise();

    // tslint:disable-next-line:no-any
    expect((client as any).options).toBe(options);
  });

  it('should isAuthenticated$ observes auth0Client$.isAuthenticated()', async () => {
    const client = await service.getAuth0Client$().toPromise();

    spyOn(client, 'isAuthenticated').and.callFake(() => Promise.resolve(true));

    const authenticated = await service.isAuthenticated$.toPromise();

    expect(client.isAuthenticated).toHaveBeenCalledTimes(1);

    expect(authenticated).toBeTrue();
  });

  it('should login call auth0Client$.loginWithRedirect()', (doneFn) => {
    const redirectPath  = `/some/redirect/path/${Math.random()}`;

    service.getAuth0Client$().subscribe(auth0Client => {

      const loginWithRedirectSpy =
        spyOn(auth0Client, 'loginWithRedirect')
          .and.callFake(() => Promise.resolve());

      service.login({ target: redirectPath });

      expect(loginWithRedirectSpy).toHaveBeenCalledTimes(1);
      expect(loginWithRedirectSpy.calls.mostRecent().args[0]?.appState.target)
        .toBe(redirectPath);

      // reset spy
      loginWithRedirectSpy.and.callThrough();

      doneFn();
    });
  });

  it('should logout call auth0Client$.logout()', (doneFn) => {
    const returnTo  = `/some/redirect/path/${Math.random()}`;

    service.getAuth0Client$().subscribe(auth0Client => {

      const logoutSpy =
        spyOn(auth0Client, 'logout')
          .and.callFake(() => undefined);

      service.logout(returnTo);

      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(logoutSpy.calls.mostRecent().args[0]?.returnTo)
        .toBe(returnTo);

      // reset spy
      logoutSpy.and.callThrough();

      doneFn();
    });
  });

  it('should logout call auth0Client$.logout() with document.location.origin if returnTo not provided', (doneFn) => {
    document.location = {
      origin: `/some/redirect/path/${Math.random()}`
    } as unknown as any;

    service.getAuth0Client$().subscribe(auth0Client => {

      const logoutSpy =
        spyOn(auth0Client, 'logout')
          .and.callFake(() => undefined);

      service.logout();

      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(logoutSpy.calls.mostRecent().args[0]?.returnTo)
        .toBe(document.location.origin);

      // reset spy
      logoutSpy.and.callThrough();

      doneFn();
    });
  });

  it('should handleRedirectCallback call auth0Client$.handleRedirectCallback()', (doneFn) => {
    const path  = `/some/path?code=${Math.random()}&state=${Math.random()}`;

    service.getAuth0Client$().subscribe(auth0Client => {

      const handleRedirectCallbackSpy =
        spyOn(auth0Client, 'handleRedirectCallback')
          .and.callFake(() => Promise.resolve({ appState: {} }));

      service.handleRedirectCallback(path).subscribe(result => {
        expect(handleRedirectCallbackSpy).toHaveBeenCalledTimes(1);
        expect(handleRedirectCallbackSpy.calls.mostRecent().args[0])
          .toBe(path);

        // reset spy
        handleRedirectCallbackSpy.and.callThrough();

        doneFn();
      });
    });
  });

  it('should handleRedirectCallback call isAuthenticated$', (doneFn) => {
    const path  = `/some/path?code=${Math.random()}&state=${Math.random()}`;
    const isAuthenticated = !!Math.random();

    service.getAuth0Client$().subscribe(auth0Client => {

      const handleRedirectCallbackSpy =
        spyOn(auth0Client, 'handleRedirectCallback')
          .and.callFake(() => Promise.resolve({ appState: {} }));

      const isAuthenticatedSpy =
        spyOn(auth0Client, 'isAuthenticated')
          .and.callFake(() => Promise.resolve(isAuthenticated));

      service.handleRedirectCallback(path).subscribe(result => {

        expect(isAuthenticatedSpy).toHaveBeenCalledTimes(1);

        expect(result.isAuthenticated).toBe(isAuthenticated);

        // reset spies
        handleRedirectCallbackSpy.and.callThrough();
        isAuthenticatedSpy.and.callThrough();

        doneFn();
      });
    });
  });

  it('should handleRedirectCallback end early if code query param missing', (doneFn) => {
    const path  = `/some/path?state=${Math.random()}`;
    const isAuthenticated = !!Math.random();

    service.getAuth0Client$().subscribe(auth0Client => {

      const handleRedirectCallbackSpy =
        spyOn(auth0Client, 'handleRedirectCallback')
          .and.callFake(() => Promise.resolve({ appState: {} }));

      const isAuthenticatedSpy =
        spyOn(auth0Client, 'isAuthenticated')
          .and.callFake(() => Promise.resolve(isAuthenticated));

      service.handleRedirectCallback(path).subscribe(result => {

        expect(isAuthenticatedSpy).not.toHaveBeenCalled();
        expect(handleRedirectCallbackSpy).not.toHaveBeenCalled();

        expect(result.isAuthenticated).toBe(false);

        // reset spies
        handleRedirectCallbackSpy.and.callThrough();
        isAuthenticatedSpy.and.callThrough();

        doneFn();
      });
    });
  });

  it('should handleRedirectCallback end early if state query param missing', (doneFn) => {
    const path  = `/some/path?code=${Math.random()}`;
    const isAuthenticated = !!Math.random();

    service.getAuth0Client$().subscribe(auth0Client => {

      const handleRedirectCallbackSpy =
        spyOn(auth0Client, 'handleRedirectCallback')
          .and.callFake(() => Promise.resolve({ appState: {} }));

      const isAuthenticatedSpy =
        spyOn(auth0Client, 'isAuthenticated')
          .and.callFake(() => Promise.resolve(isAuthenticated));

      service.handleRedirectCallback(path).subscribe(result => {

        expect(isAuthenticatedSpy).not.toHaveBeenCalled();
        expect(handleRedirectCallbackSpy).not.toHaveBeenCalled();

        expect(result.isAuthenticated).toBe(false);

        // reset spies
        handleRedirectCallbackSpy.and.callThrough();
        isAuthenticatedSpy.and.callThrough();

        doneFn();
      });
    });
  });

  it('should profile$ calls auth0Client$.getUser()', (doneFn) => {
    const profile = {};

    service.getAuth0Client$().subscribe(auth0Client => {

      const getUserSpy =
        spyOn(auth0Client, 'getUser')
          .and.callFake(() => Promise.resolve(profile as any));

      service.profile$.subscribe(observedProfile => {
        expect(getUserSpy).toHaveBeenCalledTimes(1);
        expect(observedProfile).toBe(profile);

        // reset spy
        getUserSpy.and.callThrough();

        doneFn();
      });
    });
  });
});
