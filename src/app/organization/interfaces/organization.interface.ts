export interface Organization {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  teamCount: number;
  ownerId: string;
  isPrivate: boolean;
  settings?: OrganizationSettings;
  jiraIntegration?: JiraIntegration;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  projectCount: number;
  leadId?: string;
  lead?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  status?: 'Active' | 'Inactive' | 'On Hold';
  isPrivate: boolean;
  settings?: TeamSettings;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  teamId: string;
  organizationId: string;
  role: 'team_lead' | 'senior' | 'developer' | 'designer' | 'qa' | 'member';
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
  projectIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  teamIds: string[];
  memberIds: string[];
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  totalTasks?: number;
  completedTasks?: number;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: string;
  invitedBy?: string;
  status: MemberStatus;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface OrganizationSettings {
  visibility: 'public' | 'private';
  allowMemberInvites: boolean;
  requireApprovalForJoining: boolean;
  defaultRole: OrganizationRole;
  allowPublicTeams: boolean;
  requireApprovalForMembers: boolean;
  defaultTeamVisibility: 'public' | 'private';
}

export interface TeamSettings {
  visibility: 'public' | 'private';
  allowMemberInvites: boolean;
  projectAccess: 'all' | 'selected' | 'none';
  allowExternalCollaborators: boolean;
  requireApprovalForProjects: boolean;
  defaultProjectVisibility: 'public' | 'private';
}

export interface OrganizationInvite {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InviteStatus;
}

export interface TeamInvite {
  id: string;
  email: string;
  teamId: string;
  role: TeamRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InviteStatus;
}

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum TeamRole {
  LEAD = 'lead',
  MEMBER = 'member'
}

export enum MemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface JiraIntegration {
  isConnected: boolean;
  siteUrl: string;
  connectedAt: string;
}