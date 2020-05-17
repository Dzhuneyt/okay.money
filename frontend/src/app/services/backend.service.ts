import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {catchError, flatMap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {environment} from "src/environments/environment";

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
        console.log(`Making APi call to ${method} ${path}`);
        const headers = new HttpHeaders({
          'Authorization': authKey['AccessToken'],
        })
        console.log('headers', headers);
        return this.http.request(method, absoluteUrl, {
          body: bodyParams,
          params: queryParams,
          headers,
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
