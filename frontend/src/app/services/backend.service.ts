import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {EMPTY, Observable} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {SnackbarService} from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  get baseUrl(): string {
    if (environment.baseUrl && environment.baseUrl.length > 0) {
      return environment.baseUrl + 'api/';
    }
    return '/api/';
  }

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorage,
    private router: Router,
    private snackbar: SnackbarService,
  ) {
  }

  /**
   * Get an ID token from local storage.
   * If it is expired, refresh it using the Refresh Token
   */
  private getIdToken(): Observable<string | undefined> {
    return new Observable<string | undefined>(subscriber => {
      this.localStorage.getItem('access_token').subscribe((cachedTokens: Object) => {

        if (!cachedTokens || !cachedTokens['IdToken']) {
          console.log('No tokens whatsoever in Local Storage');
          subscriber.next();
          subscriber.complete();
          return;
        }

        // Is it still fresh, not expired?
        if (cachedTokens['ExpiresAt'] > Math.round(new Date().getTime() / 1000)) {
          console.log('IdToken still valid. Using it');
          subscriber.next(cachedTokens['IdToken']);
          subscriber.complete();
          return;
        }

        console.log(cachedTokens['RefreshToken']);
        console.log('Using RefreshToken to get new IdToken');

        this.http.post(this.baseUrl + 'refreshToken', {
          refreshToken: cachedTokens['RefreshToken'],
        }).pipe(
          catchError(err => {
            console.error(err);
            this.localStorage.removeItem('access_token').subscribe();
            this.router.navigate(['/login']).then();
            return EMPTY;
          })
        ).subscribe((refreshTokenResponse: {
          IdToken: string,
          AccessToken: string,
          ExpiresIn: number,
        }) => {
          // Store it for future use
          this.localStorage.setItem('access_token', {
            ...cachedTokens,
            ...refreshTokenResponse,
            ExpiresAt: Math.round(new Date().getTime() / 1000 + refreshTokenResponse.ExpiresIn),
          }).subscribe(() => {
            console.log('Stored to LocalStorage for future use');
            subscriber.next(refreshTokenResponse['IdToken']);
            subscriber.complete();
          });
        }, error => {
          if (error.error?.message?.includes('Refresh Token has expired')) {
            this.snackbar.error('Login expired. Please login again.');

            this.localStorage.removeItem('access_token').subscribe(() => {
              this.router.navigate(['/login']);
            });
            return EMPTY;
          }
          console.error(JSON.stringify(error, null, 2));
          return error;
        });
      });
    });
  }

  request(path: string, method: string = 'get', queryParams = {}, bodyParams = {}): Observable<any> {
    return this.getIdToken().pipe(
      // Switch to a new observable and return that one, which represents the result of the API call
      switchMap((IdToken: string) => {
        const absoluteUrl = this.baseUrl + path;

        const headers = new HttpHeaders(IdToken ? {
          'Authorization': IdToken,
        } : {});

        console.time(`${method.toUpperCase()} /${path}`);
        return this.http.request(method, absoluteUrl, {
          body: bodyParams,
          params: queryParams,
          headers,
        }).pipe(
          tap(() => console.timeEnd(`${method.toUpperCase()} /${path}`)),
          catchError(err => {
            console.error(`${method.toUpperCase()} /${path} ERROR:`, err.message);
            if (err.status === 401 || err.status === 403) {
              // Unauthorized. Most likely Access token has expired
              console.warn('Access token expired. Redirecting to login page');
              this.localStorage.removeItem('access_token').subscribe(() => {
                this.router.navigate(['/login']);
              });
              return EMPTY;
            }
            throw err;
          }),
          tap((response) => console.log(
            `${method.toUpperCase()} /${path} response:`,
            response
          )),
        );

      }),
    );


  }
}
