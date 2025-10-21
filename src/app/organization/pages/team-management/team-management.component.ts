import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { OrganizationService } from '../../state/organization.service';
import { OrganizationQuery } from '../../state/organization.query';
import { Team, TeamMember, Project } from '../../interfaces/organization.interface';
import { JiraControlModule } from '../../../jira-control/jira-control.module';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzModalModule,
    NzEmptyModule,
    NzGridModule,
    NzTagModule,
    NzBreadCrumbModule,
    NzAvatarModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    JiraControlModule
  ],
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  team: Team | null = null;
  members: TeamMember[] = [];
  projects: Project[] = [];
  
  isAddMemberModalVisible = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private organizationQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    // Get team ID from route
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const teamId = params['teamId'];
        if (teamId) {
          this.loadTeamData(teamId);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeamData(teamId: string) {
    // Subscribe to team data
    this.organizationQuery.teams$
      .pipe(takeUntil(this.destroy$))
      .subscribe(teams => {
        this.team = teams.find(team => team.id === teamId) || null;
      });

    // Load members and projects for this team
    this.organizationQuery.teamMembers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.members = members.filter(member => member.teamId === teamId);
      });

    this.organizationQuery.projects$
      .pipe(takeUntil(this.destroy$))
      .subscribe(projects => {
        this.projects = projects.filter(project => 
          project.teamIds && project.teamIds.includes(teamId)
        );
      });
  }

  // Navigation
  navigateBack() {
    this.router.navigate(['/organization']);
  }

  // Team Management
  showTeamSettings() {
    // TODO: Implement team settings
    console.log('Show team settings');
  }

  getTeamInitials(): string {
    if (!this.team) return '';
    return this.team.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Member Management
  showAddMemberModal() {
    this.isAddMemberModalVisible = true;
  }

  addMember() {
    // TODO: Implement add member logic
    this.cancelAddMember();
  }

  cancelAddMember() {
    this.isAddMemberModalVisible = false;
  }

  editMember(member: TeamMember) {
    // TODO: Implement edit member
    console.log('Edit member:', member);
  }

  removeMember(member: TeamMember) {
    if (confirm(`Remove ${member.name} from the team?`)) {
      // TODO: Implement remove member
      console.log('Remove member:', member);
    }
  }

  // Project Management
  showCreateProjectModal() {
    // TODO: Implement create project modal
    console.log('Show create project modal');
  }

  editProject(project: Project) {
    // TODO: Implement edit project
    console.log('Edit project:', project);
  }

  viewProject(project: Project) {
    // TODO: Navigate to project details
    console.log('View project:', project);
  }

  // Utility Methods
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getMemberInitials(memberId: string): string {
    const member = this.members.find(m => m.id === memberId);
    return member ? this.getInitials(member.name) : '?';
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  }

  getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      'team_lead': 'red',
      'senior': 'orange',
      'developer': 'blue',
      'designer': 'purple',
      'qa': 'green',
      'member': 'default'
    };
    return roleColors[role] || 'default';
  }

  formatRole(role: string): string {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  getProjectStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'active': 'green',
      'planning': 'blue',
      'on_hold': 'orange',
      'completed': 'purple',
      'cancelled': 'red'
    };
    return statusColors[status] || 'default';
  }

  formatProjectStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getActiveTasksCount(): number {
    return this.projects.reduce((count, project) => {
      return count + (project.totalTasks || 0) - (project.completedTasks || 0);
    }, 0);
  }

  getCompletionRate(): number {
    const totalTasks = this.projects.reduce((total, project) => total + (project.totalTasks || 0), 0);
    const completedTasks = this.projects.reduce((total, project) => total + (project.completedTasks || 0), 0);
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }
}