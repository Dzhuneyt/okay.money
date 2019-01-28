import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class BackendService {

    baseUrl = 'http://localhost:8080/';

    constructor(
        private http: HttpClient,
    ) {
    }

    request(path: string, method: string = 'get', queryParams = {}, bodyParams = {}): Observable<any> {
        const absoluteUrl = this.baseUrl + path;

        return this.http.request(method, absoluteUrl, {
            body: bodyParams,
            params: queryParams,
        });
    }
}
