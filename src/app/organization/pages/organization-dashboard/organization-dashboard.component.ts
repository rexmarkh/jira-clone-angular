import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { OrganizationService } from '../../state/organization.service';
import { OrganizationQuery } from '../../state/organization.query';
import { Organization, Team, OrganizationSettings, TeamSettings } from '../../interfaces/organization.interface';
import { OrganizationCardComponent } from '../../components/organization-card/organization-card.component';
import { JiraControlModule } from '../../../jira-control/jira-control.module';

@Component({
  selector: 'app-organization-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextFieldModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzEmptyModule,
    NzGridModule,
    NzTabsModule,
    NzSelectModule,
    NzSwitchModule,
    OrganizationCardComponent,
    JiraControlModule
  ],
  templateUrl: './organization-dashboard.component.html',
  styleUrls: ['./organization-dashboard.component.scss']
})
export class OrganizationDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  organizations: Organization[] = [];
  teams: Team[] = [];
  currentOrganization: Organization | null = null;
  
  isCreateOrgModalVisible = false;
  isCreateTeamModalVisible = false;
  
  newOrgName = '';
  newOrgDescription = '';
  newTeamName = '';
  newTeamDescription = '';

  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private organizationQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    // Subscribe to organizations
    this.organizationQuery.organizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(organizations => {
        this.organizations = organizations;
      });

    // Subscribe to current organization
    this.organizationQuery.currentOrganization$
      .pipe(takeUntil(this.destroy$))
      .subscribe(org => {
        this.currentOrganization = org;
      });

    // Subscribe to teams
    this.organizationQuery.teams$
      .pipe(takeUntil(this.destroy$))
      .subscribe(teams => {
        this.teams = this.currentOrganization 
          ? teams.filter(team => team.organizationId === this.currentOrganization!.id)
          : [];
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Organization Management
  showCreateOrganizationModal() {
    this.isCreateOrgModalVisible = true;
    this.newOrgName = '';
    this.newOrgDescription = '';
  }

  createOrganization() {
    if (this.newOrgName.trim()) {
      this.organizationService.createOrganization(
        this.newOrgName.trim(),
        this.newOrgDescription.trim()
      );
      this.cancelCreateOrganization();
    }
  }

  cancelCreateOrganization() {
    this.isCreateOrgModalVisible = false;
    this.newOrgName = '';
    this.newOrgDescription = '';
  }

  selectOrganization(organization: Organization) {
    this.router.navigate(['/organization/org', organization.id]);
  }

  showOrganizationSettings(organization: Organization) {
    // TODO: Implement organization settings modal
    console.log('Show organization settings:', organization);
  }

  deleteOrganization(organization: Organization) {
    if (confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
      this.organizationService.deleteOrganization(organization.id);
    }
  }

  // Team Management
  showCreateTeamModal() {
    if (!this.currentOrganization) {
      return;
    }
    this.isCreateTeamModalVisible = true;
    this.newTeamName = '';
    this.newTeamDescription = '';
  }

  createTeam() {
    if (this.newTeamName.trim() && this.currentOrganization) {
      this.organizationService.createTeam(
        this.newTeamName.trim(),
        this.newTeamDescription.trim(),
        this.currentOrganization.id
      );
      this.cancelCreateTeam();
    }
  }

  cancelCreateTeam() {
    this.isCreateTeamModalVisible = false;
    this.newTeamName = '';
    this.newTeamDescription = '';
  }

  openTeamManagement(team: Team) {
    this.router.navigate(['/organization/teams', team.id]);
  }

  showTeamSettings(team: Team) {
    // TODO: Implement team settings modal
    console.log('Show team settings:', team);
  }

  deleteTeam(team: Team) {
    if (confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      this.organizationService.deleteTeam(team.id);
    }
  }

  // Utility methods
  trackByOrgId(index: number, org: Organization): string {
    return org.id;
  }

  trackByTeamId(index: number, team: Team): string {
    return team.id;
  }

  getOrganizationInitials(): string {
    if (!this.currentOrganization) return '';
    return this.currentOrganization.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  loadSampleData() {
    this.organizationService.loadSampleData();
  }
}