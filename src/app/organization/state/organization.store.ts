import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Organization, Team, OrganizationMember, TeamMember, OrganizationInvite, TeamInvite, Project } from '../interfaces/organization.interface';

export interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  teams: Team[];
  organizationMembers: OrganizationMember[];
  teamMembers: TeamMember[];
  projects: Project[];
  organizationInvites: OrganizationInvite[];
  teamInvites: TeamInvite[];
  loading: boolean;
  error: string | null;
}

export function createInitialState(): OrganizationState {
  return {
    currentOrganization: null,
    organizations: [],
    teams: [],
    organizationMembers: [],
    teamMembers: [],
    projects: [],
    organizationInvites: [],
    teamInvites: [],
    loading: false,
    error: null
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization' })
export class OrganizationStore extends Store<OrganizationState> {
  constructor() {
    super(createInitialState());
  }
}