import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginComponent} from './login.component';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSnackBar,
  MatSnackBarModule
} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {BackendService} from "../services/backend.service";
import {from} from "rxjs";
import {LocalStorage} from "@ngx-pwa/local-storage";

class MocksOfLoginComponent {
    open() {
        // Don't show any snackbars during tests
    }

    setItem() {
        // Fake local storage
        return from([true]);
    }

    getItem() {
        // Fake local storage
        return from([true]);
    }
}

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    MatCardModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatProgressSpinnerModule,
                    MatSnackBarModule,
                    FormsModule,
                    HttpClientTestingModule,
                    NoopAnimationsModule,
                ],
                declarations: [LoginComponent],
                providers: [
                    BackendService,
                    // {provide: BackendService, useClass: MocksOfLoginComponent},
                    {provide: MatSnackBar, useClass: MocksOfLoginComponent},
                    {provide: LocalStorage, useClass: MocksOfLoginComponent},
                ],
            })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(LoginComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });
    }));

    afterEach(() => {
        fixture.destroy();
        document.body.removeChild(fixture.debugElement.nativeElement);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show spinner when login() method is called', () => {
        component.login().subscribe(() => {
        });
        expect(component.showSpinner).toBeTruthy();
    });

    it('should call login API when login() method is called', (done) => {
        const backend = TestBed.get(BackendService);
        spyOn(backend, 'request').and.callFake((path, method) => {
            expect(path).toBe('v1/user/login');
            expect(method.toLowerCase()).toBe('post');

            return from([{auth_key: 'test'}]);
        });

        component
            .login()
            .subscribe(() => {
                done();
            });
    });
    it('should hide spinner after successful login()', (done: Function) => {
        const backend = TestBed.get(BackendService);
        spyOn(backend, 'request')
            .and
            .returnValue(
                from([{auth_key: 'test'}])
            );

        component
            .login()
            .subscribe(() => {
                expect(component.showSpinner).toBeFalsy();
                done();
            });
    });
});
