import { Component } from '@angular/core';
import { AuthQuery } from '@trungk18/project/auth/auth.query';

@Component({
  selector: 'app-profile-demo',
  template: `
    <div class="profile-demo-container" style="padding: 24px; background: #f5f5f5; min-height: 100vh;">
      <h1 style="margin-bottom: 24px; color: #172b4d;">Profile Component Demo</h1>
      
      <div class="demo-section" style="margin-bottom: 32px; padding: 16px; background: white; border-radius: 8px;">
        <h2 style="margin-bottom: 16px; color: #5e6c84;">1. Simple Avatar (no tooltip)</h2>
        <app-profile [showTooltip]="false" [size]="32"></app-profile>
      </div>

      <div class="demo-section" style="margin-bottom: 32px; padding: 16px; background: white; border-radius: 8px;">
        <h2 style="margin-bottom: 16px; color: #5e6c84;">2. Avatar with Basic Tooltip</h2>
        <app-profile [showTooltip]="true" [size]="40"></app-profile>
      </div>

      <div class="demo-section" style="margin-bottom: 32px; padding: 16px; background: white; border-radius: 8px;">
        <h2 style="margin-bottom: 16px; color: #5e6c84;">3. Clickable Profile (Navbar Style)</h2>
        <div style="background: #0747a6; padding: 12px; border-radius: 4px; display: inline-block;">
          <app-profile [showTooltip]="true" [size]="26" [clickable]="true"></app-profile>
        </div>
      </div>

      <div class="demo-section" style="margin-bottom: 32px; padding: 16px; background: white; border-radius: 8px;">
        <h2 style="margin-bottom: 16px; color: #5e6c84;">4. Different Sizes</h2>
        <div style="display: flex; gap: 16px; align-items: center;">
          <div>
            <p style="margin-bottom: 8px; font-size: 12px; color: #6b778c;">Small (24px)</p>
            <app-profile [showTooltip]="false" [size]="24"></app-profile>
          </div>
          <div>
            <p style="margin-bottom: 8px; font-size: 12px; color: #6b778c;">Medium (32px)</p>
            <app-profile [showTooltip]="false" [size]="32"></app-profile>
          </div>
          <div>
            <p style="margin-bottom: 8px; font-size: 12px; color: #6b778c;">Large (48px)</p>
            <app-profile [showTooltip]="false" [size]="48"></app-profile>
          </div>
        </div>
      </div>

      <div class="demo-section" style="padding: 16px; background: white; border-radius: 8px;">
        <h2 style="margin-bottom: 16px; color: #5e6c84;">5. Current User Info</h2>
        <div *ngIf="authQuery.user$ | async as user" style="padding: 12px; background: #f4f5f7; border-radius: 4px;">
          <strong>Name:</strong> {{ user.name }}<br>
          <strong>Email:</strong> {{ user.email }}<br>
          <strong>Issues:</strong> {{ user.issueIds?.length || 0 }}<br>
          <strong>Created:</strong> {{ user.createdAt | date:'medium' }}
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class ProfileDemoComponent {
  constructor(public authQuery: AuthQuery) {}
}