import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

const key = 'cookie_policy_accepted_timestamp';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  policyAccepted$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Restore state on init from permanent browser storage
    if (localStorage.getItem(key)) {
      this.policyAccepted$.next(true);
    }

    this.policyAccepted$.subscribe(value => {
      if (value) {
        // When policy was accepted, store this decision in localStorage, for future visits
        localStorage.setItem(key, new Date().getTime().toString());
      } else {
        // When policy is rejected, remove stored local storage,
        // causing the dialog to be shown on next visit
        localStorage.removeItem(key);
      }
    });
  }
}
