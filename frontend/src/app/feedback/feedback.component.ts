import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, Validators} from '@angular/forms';
import {BackendService} from '../services/backend.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  public form = this.fb.group({
    message: this.fb.control('', [Validators.min(10)]),
  });

  constructor(
    private dialog: MatDialogRef<FeedbackComponent>,
    private fb: FormBuilder,
    private backendService: BackendService,
  ) {
  }

  ngOnInit(): void {
  }

  submit() {
    this.backendService.request('feedback', 'POST', {}, {
      message: this.form.get('message').value,
    }).subscribe(() => {
      this.dialog.close(true);
    });
  }
}
