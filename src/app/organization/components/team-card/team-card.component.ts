import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { JiraControlModule } from '../../../jira-control/jira-control.module';
import { Team } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    JiraControlModule
  ],
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss']
})
export class TeamCardComponent {
  @Input() team!: Team;
  @Output() cardClick = new EventEmitter<Team>();
  @Output() edit = new EventEmitter<Team>();
  @Output() manageMembers = new EventEmitter<Team>();
  @Output() settings = new EventEmitter<Team>();
  @Output() delete = new EventEmitter<Team>();

  onCardClick() {
    this.cardClick.emit(this.team);
  }

  onEdit() {
    this.edit.emit(this.team);
  }

  onManageMembers() {
    this.manageMembers.emit(this.team);
  }

  onSettings() {
    this.settings.emit(this.team);
  }

  onDelete() {
    this.delete.emit(this.team);
  }

  getInitials(): string {
    return this.team.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusColor(): string {
    if (!this.team.status) return 'default';
    
    switch (this.team.status) {
      case 'Active': return 'green';
      case 'Inactive': return 'red';
      case 'On Hold': return 'orange';
      default: return 'default';
    }
  }

  formatDate(): string {
    const date = new Date(this.team.createdAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}