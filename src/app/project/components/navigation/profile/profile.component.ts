import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JUser } from '@trungk18/interface/user';
import { AuthQuery } from '@trungk18/project/auth/auth.query';
import { AuthService } from '@trungk18/project/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  @Input() user: JUser | null = null;
  @Input() showTooltip: boolean = true;
  @Input() size: number = 26;
  @Input() clickable: boolean = true;

  user$: Observable<JUser | null>;

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authQuery.user$;
  }

  ngOnInit(): void {
    // If no user is passed as input, use the current authenticated user
    if (!this.user) {
      this.user$ = this.authQuery.user$;
    }
  }

  onProfileClick(): void {
    if (!this.clickable) return;
    
    // Navigate to profile page
    this.router.navigate(['/project/profile']);
  }

  getDisplayUser(): JUser | null {
    return this.user || null;
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
}