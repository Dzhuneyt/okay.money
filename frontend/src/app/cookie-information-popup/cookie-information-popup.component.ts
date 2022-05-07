import {Component, OnInit} from '@angular/core';
import {CookieService} from '../cookie.service';

@Component({
  selector: 'app-cookie-information-popup',
  templateUrl: './cookie-information-popup.component.html',
  styleUrls: ['./cookie-information-popup.component.scss']
})
export class CookieInformationPopupComponent implements OnInit {

  constructor(
    private cookieService: CookieService,
  ) {
  }

  ngOnInit(): void {
  }

  markCookiePolicyAccepted() {
    this.cookieService.policyAccepted$.next(true);
  }
}
