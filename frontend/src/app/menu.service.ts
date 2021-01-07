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

  public isOpened = true;

  public items = new BehaviorSubject<MenuItem[]>([]);
  public headerVisible = new BehaviorSubject<boolean>(true);

  constructor() {
  }

  toggle() {
    this.isOpened = !this.isOpened;
  }
}
