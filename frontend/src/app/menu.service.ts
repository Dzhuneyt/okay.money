import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface MenuItem {
  label: string;
  matIcon: string;
  route?: string;
  onClick?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  public isOpened = false;

  public items = new BehaviorSubject<MenuItem[]>([]);

  constructor() {
  }

  toggle() {
    this.isOpened = !this.isOpened;
  }
}
