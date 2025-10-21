import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Routing
import { OrganizationRoutingModule } from './organization-routing.module';

// Components
import { OrganizationLayoutComponent } from './components/organization-layout/organization-layout.component';
import { OrganizationDashboardComponent } from './pages/organization-dashboard/organization-dashboard.component';
import { OrganizationDetailsComponent } from './pages/organization-details/organization-details.component';
import { TeamManagementComponent } from './pages/team-management/team-management.component';
import { OrganizationCardComponent } from './components/organization-card/organization-card.component';
import { TeamCardComponent } from './components/team-card/team-card.component';

// State Management
import { OrganizationStore } from './state/organization.store';
import { OrganizationQuery } from './state/organization.query';
import { OrganizationService } from './state/organization.service';

// Shared Modules
import { JiraControlModule } from '../jira-control/jira-control.module';

// Ant Design Modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OrganizationRoutingModule,
    
    // Standalone Components
    OrganizationLayoutComponent,
    OrganizationDashboardComponent,
    OrganizationDetailsComponent,
    TeamManagementComponent,
    OrganizationCardComponent,
    TeamCardComponent,
    
    // Shared Modules
    JiraControlModule,
    
    // Ant Design Modules
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzEmptyModule,
    NzGridModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzBreadCrumbModule,
    NzAvatarModule,
    NzSelectModule,
    NzSwitchModule,
    NzDatePickerModule,
    NzTooltipModule
  ],
  providers: [
    OrganizationStore,
    OrganizationQuery,
    OrganizationService
  ],
  exports: [
    OrganizationDashboardComponent,
    OrganizationDetailsComponent,
    TeamManagementComponent,
    OrganizationCardComponent,
    TeamCardComponent
  ]
})
export class OrganizationModule { }