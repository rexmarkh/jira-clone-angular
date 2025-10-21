import { DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { AutofocusDirective } from '@trungk18/core/directives/autofocus.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { QuillModule } from 'ngx-quill';
import { JiraControlModule } from '../jira-control/jira-control.module';
import { AddIssueModalComponent } from './components/add-issue-modal/add-issue-modal.component';
import { IssueAssigneesSelectComponent } from './components/add-issue-modal/issue-assignees-select/issue-assignees-select.component';
import { IssuePrioritySelectComponent } from './components/add-issue-modal/issue-priority-select/issue-priority-select.component';
import { IssueReporterSelectComponent } from './components/add-issue-modal/issue-reporter-select/issue-reporter-select.component';
import { IssueTypeSelectComponent } from './components/add-issue-modal/issue-type-select/issue-type-select.component';
import { BoardPageComponents } from './components/board';
import { IssueUtilComponents } from './components/issues';
import { NavigationComponents } from './components/navigation';
import { NavbarLeftComponent } from './components/navigation/navbar-left/navbar-left.component';
import { ResizerComponent } from './components/navigation/resizer/resizer.component';
import { IssueResultComponent } from './components/search/issue-result/issue-result.component';
import { SearchDrawerComponent } from './components/search/search-drawer/search-drawer.component';
import { UserComponent } from './components/user/user.component';
import { NZ_JIRA_ICONS } from './config/icons';
import { BoardComponent } from './pages/board/board.component';
import { FullIssueDetailComponent } from './pages/full-issue-detail/full-issue-detail.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';

@NgModule({
  declarations: [
    AutofocusDirective,
    ...NavigationComponents,
    ...BoardPageComponents,
    ...IssueUtilComponents,
    ProjectComponent,
    BoardComponent,
    SettingsComponent,
    ProfilePageComponent,
    FullIssueDetailComponent,
    SearchDrawerComponent,
    IssueResultComponent,
    AddIssueModalComponent,
    UserComponent,
    IssueTypeSelectComponent,
    IssuePrioritySelectComponent,
    IssueReporterSelectComponent,
    IssueAssigneesSelectComponent,
    ResizerComponent
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    NzIconModule.forChild(NZ_JIRA_ICONS),
    NzToolTipModule,
    NzModalModule,
    NzDropDownModule,
    NzSelectModule,
    NzDrawerModule,
    NzPopoverModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzInputModule,
    NzSpinModule,
    NzSwitchModule,
    DragDropModule,
    TextFieldModule,
    FormsModule,
    ReactiveFormsModule,
    JiraControlModule,
    ContentLoaderModule,
    QuillModule
  ],
  exports: [
    NavbarLeftComponent
  ]
})
export class ProjectModule {}
