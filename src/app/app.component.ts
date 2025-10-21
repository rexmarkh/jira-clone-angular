import { Component, ViewEncapsulation, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ProjectQuery } from './project/state/project/project.query';
import { ProjectService } from './project/state/project/project.service';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AppComponent implements AfterViewInit {
  shouldShowLoader$: Observable<boolean>;

  constructor(
    public router: Router,
    public projectQuery: ProjectQuery,
    private _cdr: ChangeDetectorRef,
    private _projectService: ProjectService,
    private _googleAnalytics: GoogleAnalyticsService
  ) {
    // Only show loader when not on login page
    this.shouldShowLoader$ = combineLatest([
      this.projectQuery.isLoading$,
      this.router.events.pipe(
        startWith(new NavigationEnd(0, this.router.url, this.router.url))
      )
    ]).pipe(
      map(([isLoading, event]) => {
        if (event instanceof NavigationEnd) {
          const isLoginPage = event.urlAfterRedirects.includes('/login');
          return isLoading && !isLoginPage;
        }
        return false;
      })
    );

    // Only load project data if not on login page
    if (!this.router.url.includes('/login')) {
      this._projectService.setLoading(true);
    }

    if (environment.production) {
      this.router.events.subscribe(this.handleGoogleAnalytics);
    }
  }

  handleGoogleAnalytics = (event: any): void => {
    if (event instanceof NavigationEnd) {
      this._googleAnalytics.sendPageView(event.urlAfterRedirects);
      
      // Load project data when navigating to project pages (not login)
      if (event.urlAfterRedirects.includes('/project')) {
        const currentState = this.projectQuery.getValue();
        if (!currentState?.id) {
          this._projectService.setLoading(true);
        }
      }
    }
  };

  ngAfterViewInit() {
    this._cdr.detectChanges();
  }
}
