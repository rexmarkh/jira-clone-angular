import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// NG-ZORRO imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

// Components
import { TeamCardComponent } from '../../components/team-card/team-card.component';

// Services and Models
import { OrganizationService } from '../../state/organization.service';
import { OrganizationQuery } from '../../state/organization.query';
import { Organization, Team, OrganizationMember } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzEmptyModule,
    NzBreadCrumbModule,
    NzTagModule,
    NzTableModule,
    NzAvatarModule,
    TeamCardComponent
  ],
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  organization: Organization | null = null;
  teams: Team[] = [];
  members: OrganizationMember[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private organizationQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    // Get organization ID from route
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const orgId = params['orgId'];
        this.loadOrganizationDetails(orgId);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrganizationDetails(orgId: string) {
    // Subscribe to organization
    this.organizationQuery.organizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(organizations => {
        this.organization = organizations.find(org => org.id === orgId) || null;
      });

    // Subscribe to teams for this organization
    this.organizationQuery.getTeamsByOrganization(orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(teams => {
        this.teams = teams;
      });

    // Subscribe to members for this organization
    this.organizationQuery.getMembersByOrganization(orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.members = members;
      });
  }

  goBack() {
    this.router.navigate(['/organization']);
  }

  showCreateTeamModal() {
    // Implementation for creating team modal
    console.log('Create team modal');
  }

  showInviteMemberModal() {
    // Implementation for inviting member modal
    console.log('Invite member modal');
  }

  onTeamClick(team: Team) {
    this.router.navigate(['/organization/teams', team.id]);
  }

  onTeamSettings(team: Team) {
    console.log('Team settings:', team);
  }

  onTeamDelete(team: Team) {
    console.log('Delete team:', team);
  }

  trackByTeamId(index: number, team: Team): string {
    return team.id;
  }

  trackByMemberId(index: number, member: OrganizationMember): string {
    return member.id;
  }

  getOrganizationInitials(): string {
    if (!this.organization) return '';
    return this.organization.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'owner': return 'purple';
      case 'admin': return 'blue';
      case 'member': return 'green';
      default: return 'default';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'suspended': return 'red';
      default: return 'default';
    }
  }
}