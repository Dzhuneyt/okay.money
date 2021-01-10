import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {EMPTY, Observable} from 'rxjs';
import {catchError, mergeMap, tap} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  get baseUrl(): string {
    // return 'https://2noax5lb45.execute-api.eu-west-1.amazonaws.com/prod/api/';
    if (environment.baseUrl && environment.baseUrl.length > 0) {
      return environment.baseUrl + 'api/';
    }
    return '/api/';
  }

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorage,
    private router: Router,
  ) {
  }

  request(path: string, method: string = 'get', queryParams = {}, bodyParams = {}): Observable<any> {
    const absoluteUrl = this.baseUrl + path;

    return this.localStorage.getItem('access_token')
      .pipe(
        mergeMap(authKey => {
          console.time(`${method.toUpperCase()} /${path}`);
          const headers = new HttpHeaders(authKey ? {
            'Authorization': authKey['IdToken'],
          } : {});
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
                console.log('Access token expired. Redirecting to login page');
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
        })
      );
  }
}
