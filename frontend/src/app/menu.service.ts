import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    public isOpened = false;

    constructor() {
    }

    toggle() {
        this.isOpened = !this.isOpened;
    }
}
