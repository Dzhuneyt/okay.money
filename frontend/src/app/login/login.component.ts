import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";
import {LocalStorage} from "@ngx-pwa/local-storage";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    username: string;
    password: string;

    public showSpinner = false;

    constructor(
        private backendService: BackendService,
        private localStorage: LocalStorage, // @TODO use it to store the token
    ) {
    }

    ngOnInit() {
    }

    login() {
        this.showSpinner = true;
        this.backendService
            .request('v1/user/login', 'post', {}, {
                username: this.username,
                password: this.password,
            })
            .subscribe(result => {
                if (result.hasOwnProperty('errors')) {
                    console.error('Login failed with errors', result);
                    this.showSpinner = false;
                    return;
                }

                const authKey = result['auth_key'];
                this.showSpinner = false;
            });
    }

}
