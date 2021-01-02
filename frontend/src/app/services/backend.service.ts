import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Observable} from 'rxjs';
import {catchError, flatMap} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorage,
    private router: Router,
  ) {
  }

  request(path: string, method: string = 'get', queryParams = {}, bodyParams = {}): Observable<any> {
    const absoluteUrl = this.baseUrl + path;

    return this.localStorage.getItem('access_token')
      .pipe(flatMap(authKey => {
        console.log(authKey);
        console.log(`Making API call to ${method} ${path}`);
        const headers = new HttpHeaders(authKey ? {
          'Authorization': authKey['IdToken'],
        } : {});
        return this.http.request(method, absoluteUrl, {
          body: bodyParams,
          params: queryParams,
          headers,
        }).pipe(
          catchError(err => {
            console.log(err);
            if (err.status === 401 || err.status === 403) {
              // Unauthorized. Most likely Access token has expired
              this.localStorage.removeItem('access_token').subscribe(() => {
                this.router.navigate(['/login']);
              });
            }
            throw err;
          })
        );
      }));
  }
}
