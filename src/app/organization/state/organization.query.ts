import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationStore, OrganizationState } from './organization.store';
import { Organization, Team, OrganizationMember, TeamMember, OrganizationInvite, TeamInvite, Project } from '../interfaces/organization.interface';

@Injectable({ providedIn: 'root' })
export class OrganizationQuery extends Query<OrganizationState> {
  constructor(protected override store: OrganizationStore) {
    super(store);
  }

  // Organizations
  organizations$ = this.select(state => state.organizations);
  currentOrganization$ = this.select(state => state.currentOrganization);
  
  // Teams
  teams$ = this.select(state => state.teams);
  
  // Members
  organizationMembers$ = this.select(state => state.organizationMembers);
  teamMembers$ = this.select(state => state.teamMembers);
  
  // Projects
  projects$ = this.select(state => state.projects);
  
  // Invites
  organizationInvites$ = this.select(state => state.organizationInvites);
  teamInvites$ = this.select(state => state.teamInvites);
  
  // Loading and error states
  loading$ = this.select(state => state.loading);
  error$ = this.select(state => state.error);

  // Computed selectors
  getTeamsByOrganization(organizationId: string): Observable<Team[]> {
    return this.teams$.pipe(
      map(teams => teams.filter(team => team.organizationId === organizationId))
    );
  }

  getMembersByOrganization(organizationId: string): Observable<OrganizationMember[]> {
    return this.organizationMembers$.pipe(
      map(members => members.filter(member => member.organizationId === organizationId))
    );
  }

  getMembersByTeam(teamId: string): Observable<TeamMember[]> {
    return this.teamMembers$.pipe(
      map(members => members.filter(member => member.teamId === teamId))
    );
  }

  getProjectsByTeam(teamId: string): Observable<Project[]> {
    return this.projects$.pipe(
      map(projects => projects.filter(project => 
        project.teamIds && project.teamIds.includes(teamId)
      ))
    );
  }

  getProjectsByOrganization(organizationId: string): Observable<Project[]> {
    return this.projects$.pipe(
      map(projects => projects.filter(project => project.organizationId === organizationId))
    );
  }

  getInvitesByOrganization(organizationId: string): Observable<OrganizationInvite[]> {
    return this.organizationInvites$.pipe(
      map(invites => invites.filter(invite => invite.organizationId === organizationId))
    );
  }

  getInvitesByTeam(teamId: string): Observable<TeamInvite[]> {
    return this.teamInvites$.pipe(
      map(invites => invites.filter(invite => invite.teamId === teamId))
    );
  }

  getCurrentOrganizationTeams(): Observable<Team[]> {
    return this.currentOrganization$.pipe(
      map(org => org?.id),
      map(orgId => orgId ? this.getValue().teams.filter(team => team.organizationId === orgId) : [])
    );
  }
}