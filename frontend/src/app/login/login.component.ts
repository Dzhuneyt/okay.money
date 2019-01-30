import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";
import {LocalStorage} from "@ngx-pwa/local-storage";
import {MatSnackBar} from "@angular/material";

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
        private localStorage: LocalStorage,
        private snackar: MatSnackBar,
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
                this.showSpinner = false;
                if (result.hasOwnProperty('errors')) {
                    console.error('Login failed with errors', result);
                    this.snackar.open('Login failed');
                    return;
                }

                const authKey = result['auth_key'];
                this.localStorage.setItem('auth_key', authKey).subscribe(() => {
                    this.snackar.open('Login successful');

                    // TODO redirect to homepage
                });
            }, (result) => {
                console.error('Login failed with errors', result);
                this.snackar.open('Login failed');
                this.showSpinner = false;
            });
    }

}
