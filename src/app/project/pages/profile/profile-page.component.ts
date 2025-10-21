import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JUser } from '@trungk18/interface/user';
import { AuthQuery } from '@trungk18/project/auth/auth.query';
import { AuthService } from '@trungk18/project/auth/auth.service';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: false
})
@UntilDestroy()
export class ProfilePageComponent implements OnInit {
  user$: Observable<JUser | null>;
  currentUser: JUser | null = null;
  isEditing = false;
  
  // Profile stats
  totalIssuesAssigned = 0;
  completedIssues = 0;
  activeIssues = 0;
  loginEmail = '';
  lastLoginTime = new Date();

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private projectQuery: ProjectQuery,
    private router: Router
  ) {
    this.user$ = this.authQuery.user$;
  }

  ngOnInit(): void {
    this.user$.pipe(untilDestroyed(this)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.calculateUserStats(user);
        this.loginEmail = user.email || '';
        this.lastLoginTime = new Date(); // In a real app, this would come from auth state
      }
    });
  }

  private calculateUserStats(user: JUser): void {
    if (user.issueIds && user.issueIds.length > 0) {
      this.totalIssuesAssigned = user.issueIds.length;
      
      // Get project data to calculate completed vs active issues
      this.projectQuery.all$.pipe(untilDestroyed(this)).subscribe(project => {
        if (project && project.issues) {
          const userIssues = project.issues.filter(issue => 
            user.issueIds.includes(issue.id)
          );
          
          this.completedIssues = userIssues.filter(issue => 
            issue.status === 'Done'
          ).length;
          
          this.activeIssues = userIssues.filter(issue => 
            issue.status !== 'Done'
          ).length;
        }
      });
    }
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    // Implementation for saving profile changes
    this.isEditing = false;
    // You can add actual save logic here
    console.log('Profile saved');
  }

  cancelEdit(): void {
    this.isEditing = false;
    // Reset any changes if needed
  }

  onSettingChange(setting: string, value: boolean): void {
    // Handle setting changes
    console.log(`Setting ${setting} changed to:`, value);
  }

  goBack(): void {
    this.router.navigate(['/project/board']);
  }

  formatJoinDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getUserInitials(user: JUser): string {
    if (!user?.name) return '';
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCompletionPercentage(): number {
    if (this.totalIssuesAssigned === 0) return 0;
    return Math.round((this.completedIssues / this.totalIssuesAssigned) * 100);
  }

  onAvatarClick(): void {
    // TODO: Implement avatar upload functionality
    console.log('Avatar clicked - implement upload functionality');
  }

  getLoginType(): string {
    if (!this.loginEmail) return 'Email';
    
    if (this.loginEmail.includes('@gmail.com')) {
      return 'Google';
    } else if (this.loginEmail.includes('@github.com')) {
      return 'GitHub';
    } else {
      return 'Email';
    }
  }

  getLoginBadgeText(): string {
    const loginType = this.getLoginType();
    return loginType === 'Email' ? 'Active Login' : `${loginType} Login`;
  }
}