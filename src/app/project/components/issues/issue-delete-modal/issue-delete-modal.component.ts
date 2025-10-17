import { Component, EventEmitter, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { DeleteIssueModel } from '@trungk18/interface/ui-model/delete-issue-model';

@Component({
  selector: 'issue-delete-modal',
  templateUrl: './issue-delete-modal.component.html',
  styleUrls: ['./issue-delete-modal.component.scss']
})
export class IssueDeleteModalComponent implements OnInit {
  issueId: string;

  onDelete = new EventEmitter<DeleteIssueModel>();

  constructor(
    private _modalRef: NzModalRef
  ) {}

  ngOnInit() {
    // Get data from the new ng-zorro modal data
    const config = this._modalRef.getConfig();
    console.log('Delete modal config:', config);
    if (config.nzData?.issueId) {
      this.issueId = config.nzData.issueId;
      console.log('Issue ID set from nzData:', this.issueId);
    }
    if (config.nzData?.onDelete) {
      this.onDelete = config.nzData.onDelete;
      console.log('onDelete callback set from nzData');
    }
  }

  deleteIssue() {
    this.onDelete.emit(new DeleteIssueModel(this.issueId, this._modalRef));
  }

  closeModal() {
    this._modalRef.close();
  }
}
