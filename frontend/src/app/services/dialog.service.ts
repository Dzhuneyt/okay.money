import {Injectable, TemplateRef} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ComponentType} from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {
  }

  /**
   * A wrapper around the standard MatDialog.open() method
   * Allows passing custom callback functions that will be executed
   * when the dialog is clased (either with Confirm or Cancel buttons)
   */
  open(
    componentOrTemplateRef: ComponentType<any> | TemplateRef<any>,
    config?: MatDialogConfig<any>,
    onDialogClose?: (result: any) => any,
  ) {
    const dialogRef = this.dialog.open(componentOrTemplateRef, config);

    // Subscribe for dialog closing and propagate the value
    // from the closing action to the passed in lambda function
    if (onDialogClose) {
      dialogRef.afterClosed().subscribe((result: any) => {
        onDialogClose(result);
      });
    }

    return dialogRef;
  }
}
