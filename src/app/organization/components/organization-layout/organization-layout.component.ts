import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { JiraControlModule } from '../../../jira-control/jira-control.module';
import { ProjectModule } from '../../../project/project.module';
import { AuthQuery } from '../../../project/auth/auth.query';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-organization-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    JiraControlModule,
    ProjectModule
  ],
  templateUrl: './organization-layout.component.html',
  styleUrls: ['./organization-layout.component.scss']
})
export class OrganizationLayoutComponent implements OnInit {
  user$ = this.authQuery.user$;

  constructor(
    private router: Router,
    private authQuery: AuthQuery
  ) { }

  ngOnInit() {
    // Component initialization
  }

  navigateToProject() {
    this.router.navigate(['/project']);
  }
}