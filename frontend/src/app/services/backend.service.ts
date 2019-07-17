import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {catchError, flatMap} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  baseUrl = 'http://localhost:8080/';

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorage,
    private router: Router,
  ) {
  }

  request(path: string, method: string = 'get', queryParams = {}, bodyParams = {}): Observable<any> {
    const absoluteUrl = this.baseUrl + path;

    return this.localStorage.getItem('auth_key')
      .pipe(flatMap(authKey => {
        if (authKey) {
          queryParams['access-token'] = authKey;
        }
        return this.http.request(method, absoluteUrl, {
          body: bodyParams,
          params: queryParams,
        }).pipe(
          catchError(err => {
            console.log(err);
            if (err.status === 401) {
              // Unauthorized
              this.router.navigate(['/login']);
            }
            throw err;
          })
        );
      }));
  }
}
