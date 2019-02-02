import {inject, TestBed} from '@angular/core/testing';

import {BackendService} from './backend.service';
import {HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe('BackendService', () => {
    beforeEach(() => {
        const moduleDefinition = {
            imports: [
                HttpClientModule,
                HttpClientTestingModule
            ],
            providers: [],
        };
        return TestBed.configureTestingModule(moduleDefinition);
    });

    afterEach(inject([HttpTestingController], (backend: HttpTestingController) => {
        backend.verify();
    }));

    it('should be created', () => {
        const service: BackendService = TestBed.get(BackendService);
        expect(service).toBeTruthy();
    });
});
