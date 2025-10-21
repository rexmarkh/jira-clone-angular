import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { JiraControlModule } from '../../../jira-control/jira-control.module';
import { Organization } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzPopoverModule,
    JiraControlModule
  ],
  templateUrl: './organization-card.component.html',
  styleUrls: ['./organization-card.component.scss']
})
export class OrganizationCardComponent {
  @Input() organization!: Organization;
  @Output() cardClick = new EventEmitter<Organization>();
  @Output() settings = new EventEmitter<Organization>();
  @Output() delete = new EventEmitter<Organization>();

  onCardClick() {
    this.cardClick.emit(this.organization);
  }

  onSettings() {
    this.settings.emit(this.organization);
  }

  onDelete() {
    this.delete.emit(this.organization);
  }

  getInitials(): string {
    return this.organization.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getVisibilityColor(): string {
    return this.organization.settings.visibility === 'public' ? 'green' : 'blue';
  }

  getVisibilityIcon(): string {
    return this.organization.settings.visibility === 'public' ? 'global' : 'lock';
  }

  getVisibilityLabel(): string {
    return this.organization.settings.visibility === 'public' ? 'Public' : 'Private';
  }

  getTimeAgo(): string {
    const now = new Date();
    const created = new Date(this.organization.updatedAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
  }

  formatDate(): string {
    const date = new Date(this.organization.createdAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}