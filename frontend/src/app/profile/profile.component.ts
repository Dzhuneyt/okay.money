import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BackendService} from 'src/app/services/backend.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public form = new FormGroup({
    email: new FormControl(null, []),
    firstname: new FormControl(null, []),
    lastname: new FormControl(null, []),
    old_password: new FormControl(null, []),
    new_password: new FormControl(null, []),
  });

  constructor(
    private backend: BackendService,
  ) {
  }

  ngOnInit() {
    this.backend.request('v1/user/profile', 'GET').subscribe(res => {
      // tslint:disable-next-line:forin
      for (const key in res) {
        const value = res[key];

        if (this.form.controls.hasOwnProperty(key)) {
          this.form.controls[key].setValue(value);
        }
      }
    });
  }

}
